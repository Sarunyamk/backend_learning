import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { CHAT_EVENT } from '../constants/socket-event.constant';
import { SOCKET_NAMESPACE } from '../constants/socket-namespace.constant';
import { ChatService } from '../services/chat.service';
import type {
  JoinRoomPayload,
  LeaveRoomPayload,
  SendMessagePayload,
} from '../types/chat.type';

@WebSocketGateway({ namespace: SOCKET_NAMESPACE.CHAT })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  // ===== Lifecycle =====

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);

    const result = this.chatService.handleDisconnect(client.id);
    if (result) {
      this.server.to(result.roomId).emit(CHAT_EVENT.USER_LEFT, {
        userId: client.id,
        nickname: result.nickname,
      });
      this.emitRoomUsers(result.roomId);
    }
  }

  // ===== Event Handlers =====

  @SubscribeMessage(CHAT_EVENT.JOIN_ROOM)
  handleJoinRoom(
    @MessageBody() payload: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, nickname } = payload;

    if (!roomId || !nickname) {
      client.emit(CHAT_EVENT.ERROR, {
        message: 'roomId and nickname are required',
      });
      return;
    }

    const { user } = this.chatService.joinRoom(client.id, roomId, nickname);

    void client.join(roomId);

    // Broadcast user joined + อัปเดต user list
    this.server.to(roomId).emit(CHAT_EVENT.USER_JOINED, {
      userId: user.id,
      nickname: user.nickname,
    });
    this.emitRoomUsers(roomId);

    // TODO: [DB persist] load 50 ข้อความล่าสุดจาก DB → ส่งให้ client ที่เพิ่งเข้ามา
    // const history = await this.chatService.getMessageHistory(roomId, 50);
    // client.emit(CHAT_EVENT.MESSAGE_HISTORY, history);
  }

  @SubscribeMessage(CHAT_EVENT.LEAVE_ROOM)
  handleLeaveRoom(
    @MessageBody() payload: LeaveRoomPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId } = payload;

    if (!roomId) {
      client.emit(CHAT_EVENT.ERROR, { message: 'roomId is required' });
      return;
    }

    const nickname = this.chatService.leaveRoom(client.id, roomId);
    if (!nickname) return;

    void client.leave(roomId);

    this.server.to(roomId).emit(CHAT_EVENT.USER_LEFT, {
      userId: client.id,
      nickname,
    });
    this.emitRoomUsers(roomId);
  }

  @SubscribeMessage(CHAT_EVENT.SEND_MESSAGE)
  handleSendMessage(
    @MessageBody() payload: SendMessagePayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, content } = payload;

    if (!roomId || !content) {
      client.emit(CHAT_EVENT.ERROR, {
        message: 'roomId and content are required',
      });
      return;
    }

    const message = this.chatService.createMessage(client.id, roomId, content);
    if (!message) {
      client.emit(CHAT_EVENT.ERROR, { message: 'You are not in this room' });
      return;
    }

    this.server.to(roomId).emit(CHAT_EVENT.MESSAGE, message);
  }

  // ===== Helpers =====

  private emitRoomUsers(roomId: string): void {
    const users = this.chatService.getRoomUsers(roomId);
    this.server.to(roomId).emit(CHAT_EVENT.ROOM_USERS, users);
  }
}
