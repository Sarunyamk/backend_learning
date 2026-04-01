import { Injectable, Logger } from '@nestjs/common';

import type { ChatMessage, ChatRoom, ChatUser } from '../types/chat.type';

const MAX_MESSAGES_PER_ROOM = 100;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  // In-memory state
  // TODO: [DB persist] ย้ายไป Prisma — เพิ่ม ChatMessage model + ChatRepository
  private readonly rooms = new Map<string, ChatRoom>();
  private readonly socketToUser = new Map<
    string,
    { roomId: string; nickname: string }
  >();

  // ===== Room Management =====

  /**
   * เพิ่ม user เข้าห้อง — สร้างห้องใหม่ถ้ายังไม่มี
   * @returns list ของ users ในห้องหลัง join
   */
  joinRoom(
    socketId: string,
    roomId: string,
    nickname: string,
  ): { user: ChatUser; users: { id: string; nickname: string }[] } {
    // ถ้าอยู่ห้องอื่นอยู่ → ออกก่อน
    const existing = this.socketToUser.get(socketId);
    if (existing) {
      this.removeUser(socketId, existing.roomId);
    }

    // สร้างห้องถ้ายังไม่มี
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        messages: [],
        createdAt: new Date(),
      });
    }

    const room = this.rooms.get(roomId)!;

    const user: ChatUser = {
      id: socketId,
      nickname,
      joinedAt: new Date(),
    };

    room.users.set(socketId, user);
    this.socketToUser.set(socketId, { roomId, nickname });

    this.logger.log(`${nickname} joined room ${roomId}`);

    return { user, users: this.getRoomUsers(roomId) };
  }

  /**
   * ลบ user ออกจากห้อง — ลบห้องถ้าว่างเปล่า
   * @returns nickname ของ user ที่ออก (null ถ้าไม่เจอ)
   */
  leaveRoom(socketId: string, roomId: string): string | null {
    return this.removeUser(socketId, roomId);
  }

  /**
   * Handle disconnect — หา room ที่ user อยู่แล้ว remove
   * @returns { roomId, nickname } ของ user ที่ disconnect (null ถ้าไม่ได้อยู่ห้อง)
   */
  handleDisconnect(
    socketId: string,
  ): { roomId: string; nickname: string } | null {
    const userData = this.socketToUser.get(socketId);
    if (!userData) return null;

    this.removeUser(socketId, userData.roomId);
    return userData;
  }

  // ===== Message =====

  /**
   * สร้าง message + เก็บใน room (จำกัด MAX_MESSAGES_PER_ROOM)
   * @returns ChatMessage ที่สร้าง (null ถ้า user ไม่ได้อยู่ห้อง)
   */
  createMessage(
    socketId: string,
    roomId: string,
    content: string,
  ): ChatMessage | null {
    const userData = this.socketToUser.get(socketId);
    if (!userData || userData.roomId !== roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      roomId,
      userId: socketId,
      nickname: userData.nickname,
      content,
      timestamp: new Date(),
    };

    // TODO: [DB persist] save message แบบ async — ไม่ต้องรอ response
    // void this.chatRepository.saveMessage(message);
    room.messages.push(message);

    if (room.messages.length > MAX_MESSAGES_PER_ROOM) {
      room.messages.splice(0, room.messages.length - MAX_MESSAGES_PER_ROOM);
    }

    return message;
  }

  // ===== Queries =====

  getUserData(
    socketId: string,
  ): { roomId: string; nickname: string } | undefined {
    return this.socketToUser.get(socketId);
  }

  getRoomUsers(roomId: string): { id: string; nickname: string }[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.users.values()).map((u) => ({
      id: u.id,
      nickname: u.nickname,
    }));
  }

  // ===== Private =====

  private removeUser(socketId: string, roomId: string): string | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const user = room.users.get(socketId);
    if (!user) return null;

    room.users.delete(socketId);
    this.socketToUser.delete(socketId);

    this.logger.log(`${user.nickname} left room ${roomId}`);

    // ลบห้องถ้าไม่มีคนเหลือ
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
      this.logger.log(`Room ${roomId} deleted (empty)`);
    }

    return user.nickname;
  }
}
