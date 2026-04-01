import { Logger, OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { QUIZ_EVENT } from '../constants/socket-event.constant';
import { SOCKET_NAMESPACE } from '../constants/socket-namespace.constant';
import { QuizService } from '../services/quiz.service';
import type {
  CreateRoomPayload,
  JoinRoomPayload,
  SubmitAnswerPayload,
} from '../types/quiz.type';

@WebSocketGateway({ namespace: SOCKET_NAMESPACE.QUIZ })
export class QuizGateway implements OnModuleInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizGateway.name);

  constructor(private readonly quizService: QuizService) {}

  // ===== Lifecycle =====

  onModuleInit(): void {
    // Register callbacks — service เรียกเพื่อ emit events
    this.quizService.setEmitCallbacks(
      (roomCode, event, data) => {
        this.server.to(roomCode).emit(event, data);
      },
      (socketId, event, data) => {
        this.server.to(socketId).emit(event, data);
      },
    );
  }

  handleDisconnect(client: Socket): void {
    const result = this.quizService.handleDisconnect(client.id);
    if (!result) return;

    this.logger.log(
      `Quiz client disconnected: ${client.id} (${result.nickname})`,
    );

    if (result.isHost) {
      // Host ออก → broadcast game_end (service จัดการแล้ว)
      return;
    }

    if (!result.gameEnded) {
      // Player ออก → broadcast player_left
      this.server.to(result.roomCode).emit(QUIZ_EVENT.PLAYER_LEFT, {
        nickname: result.nickname,
      });

      // ส่ง player list อัปเดต
      const room = this.quizService.getRoom(result.roomCode);
      if (room) {
        this.server.to(result.roomCode).emit(QUIZ_EVENT.PLAYER_JOINED, {
          players: this.quizService.getPlayerList(room),
        });
      }
    }
  }

  // ===== Event Handlers =====

  @SubscribeMessage(QUIZ_EVENT.CREATE_ROOM)
  handleCreateRoom(
    @MessageBody() payload: CreateRoomPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const { nickname } = payload;

    if (!nickname) {
      client.emit(QUIZ_EVENT.ERROR, { message: 'nickname is required' });
      return;
    }

    // ถ้าอยู่ห้องอื่นอยู่ → ออกก่อน
    const existingRoom = this.quizService.getPlayerRoom(client.id);
    if (existingRoom) {
      void client.leave(existingRoom);
      this.quizService.handleDisconnect(client.id);
    }

    const room = this.quizService.createRoom(client.id, nickname);
    void client.join(room.code);

    client.emit(QUIZ_EVENT.ROOM_CREATED, {
      code: room.code,
      players: this.quizService.getPlayerList(room),
    });
  }

  @SubscribeMessage(QUIZ_EVENT.JOIN_ROOM)
  handleJoinRoom(
    @MessageBody() payload: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const { code, nickname } = payload;

    if (!code || !nickname) {
      client.emit(QUIZ_EVENT.ERROR, {
        message: 'code and nickname are required',
      });
      return;
    }

    const result = this.quizService.joinRoom(client.id, code, nickname);

    if (result.error) {
      client.emit(QUIZ_EVENT.ERROR, { message: result.error });
      return;
    }

    void client.join(code);

    // Broadcast player joined ทั้งห้อง
    this.server.to(code).emit(QUIZ_EVENT.PLAYER_JOINED, {
      nickname,
      players: this.quizService.getPlayerList(result.room!),
    });
  }

  @SubscribeMessage(QUIZ_EVENT.START_GAME)
  handleStartGame(@ConnectedSocket() client: Socket): void {
    const result = this.quizService.startGame(client.id);

    if (result.error) {
      client.emit(QUIZ_EVENT.ERROR, { message: result.error });
    }

    // countdown + question flow จัดการใน service ผ่าน callbacks
  }

  @SubscribeMessage(QUIZ_EVENT.SUBMIT_ANSWER)
  handleSubmitAnswer(
    @MessageBody() payload: SubmitAnswerPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    if (payload.choiceIndex === undefined || payload.choiceIndex === null) {
      client.emit(QUIZ_EVENT.ERROR, { message: 'choiceIndex is required' });
      return;
    }

    const result = this.quizService.submitAnswer(
      client.id,
      payload.choiceIndex,
    );

    if (result.error) {
      client.emit(QUIZ_EVENT.ERROR, { message: result.error });
    }
  }

  @SubscribeMessage(QUIZ_EVENT.LEAVE_ROOM)
  handleLeaveRoom(@ConnectedSocket() client: Socket): void {
    const roomCode = this.quizService.getPlayerRoom(client.id);
    if (!roomCode) return;

    const result = this.quizService.handleDisconnect(client.id);
    if (!result) return;

    void client.leave(roomCode);

    if (!result.gameEnded) {
      this.server.to(roomCode).emit(QUIZ_EVENT.PLAYER_LEFT, {
        nickname: result.nickname,
      });

      const room = this.quizService.getRoom(roomCode);
      if (room) {
        this.server.to(roomCode).emit(QUIZ_EVENT.PLAYER_JOINED, {
          players: this.quizService.getPlayerList(room),
        });
      }
    }
  }
}
