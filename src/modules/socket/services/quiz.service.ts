import { Injectable, Logger } from '@nestjs/common';

import { MOCK_QUESTIONS, QUIZ_CONFIG } from '../constants/quiz.constant';
import type {
  AnswerResultPayload,
  PlayerResult,
  QuestionPayload,
  QuizPlayer,
  QuizRoom,
  ScoreboardEntry,
} from '../types/quiz.type';
import { GAME_STATE } from '../types/quiz.type';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  // In-memory state
  private readonly rooms = new Map<string, QuizRoom>();
  private readonly socketToRoom = new Map<string, string>();

  // Callbacks — gateway จะ set เพื่อ emit events
  private onEmitToRoom:
    | ((roomCode: string, event: string, data: unknown) => void)
    | null = null;

  private onEmitToSocket:
    | ((socketId: string, event: string, data: unknown) => void)
    | null = null;

  // ===== Callback Registration =====

  setEmitCallbacks(
    toRoom: (roomCode: string, event: string, data: unknown) => void,
    toSocket: (socketId: string, event: string, data: unknown) => void,
  ): void {
    this.onEmitToRoom = toRoom;
    this.onEmitToSocket = toSocket;
  }

  // ===== Room Management =====

  createRoom(hostSocketId: string, nickname: string): QuizRoom {
    const code = this.generateRoomCode();

    const host: QuizPlayer = {
      id: hostSocketId,
      socketId: hostSocketId,
      nickname,
      score: 0,
      currentAnswer: null,
      answeredAt: null,
    };

    const room: QuizRoom = {
      code,
      hostSocketId,
      players: new Map([[hostSocketId, host]]),
      questions: this.shuffleQuestions(),
      currentQuestionIndex: -1,
      gameState: GAME_STATE.LOBBY,
      questionStartedAt: null,
      createdAt: new Date(),
    };

    this.rooms.set(code, room);
    this.socketToRoom.set(hostSocketId, code);

    this.logger.log(`Room ${code} created by ${nickname}`);
    return room;
  }

  joinRoom(
    socketId: string,
    code: string,
    nickname: string,
  ): { error?: string; room?: QuizRoom } {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };

    if (room.gameState !== GAME_STATE.LOBBY) {
      return { error: 'Game already started' };
    }

    if (room.players.size >= QUIZ_CONFIG.MAX_PLAYERS) {
      return { error: 'Room is full' };
    }

    // เช็คชื่อซ้ำ
    for (const player of room.players.values()) {
      if (player.nickname === nickname) {
        return { error: 'Nickname already taken' };
      }
    }

    const player: QuizPlayer = {
      id: socketId,
      socketId,
      nickname,
      score: 0,
      currentAnswer: null,
      answeredAt: null,
    };

    room.players.set(socketId, player);
    this.socketToRoom.set(socketId, code);

    this.logger.log(`${nickname} joined room ${code}`);
    return { room };
  }

  // ===== Game Flow =====

  startGame(socketId: string): { error?: string } {
    const code = this.socketToRoom.get(socketId);
    if (!code) return { error: 'You are not in a room' };

    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };

    if (room.hostSocketId !== socketId) {
      return { error: 'Only host can start the game' };
    }

    if (room.players.size < 2) {
      return { error: 'Need at least 2 players' };
    }

    if (room.gameState !== GAME_STATE.LOBBY) {
      return { error: 'Game already started' };
    }

    // เริ่ม countdown
    room.gameState = GAME_STATE.COUNTDOWN;
    this.logger.log(`Game starting in room ${code}`);

    this.startCountdown(code);
    return {};
  }

  submitAnswer(socketId: string, choiceIndex: number): { error?: string } {
    const code = this.socketToRoom.get(socketId);
    if (!code) return { error: 'You are not in a room' };

    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found' };

    if (room.gameState !== GAME_STATE.QUESTION) {
      return { error: 'Not in question phase' };
    }

    const player = room.players.get(socketId);
    if (!player) return { error: 'Player not found' };

    // ตอบซ้ำ → ignore
    if (player.currentAnswer !== null) {
      return { error: 'Already answered' };
    }

    player.currentAnswer = choiceIndex;
    player.answeredAt = Date.now();

    // เช็คว่าทุกคนตอบแล้วหรือยัง
    if (this.allPlayersAnswered(room)) {
      this.endQuestion(code);
    }

    return {};
  }

  // ===== Disconnect =====

  handleDisconnect(socketId: string): {
    roomCode: string;
    nickname: string;
    isHost: boolean;
    gameEnded: boolean;
  } | null {
    const code = this.socketToRoom.get(socketId);
    if (!code) return null;

    const room = this.rooms.get(code);
    if (!room) return null;

    const player = room.players.get(socketId);
    if (!player) return null;

    const isHost = room.hostSocketId === socketId;
    const nickname = player.nickname;

    room.players.delete(socketId);
    this.socketToRoom.delete(socketId);

    this.logger.log(`${nickname} left room ${code} (disconnect)`);

    // Host ออก → จบเกม, ลบห้อง
    if (isHost) {
      this.cleanupRoom(code);
      return { roomCode: code, nickname, isHost: true, gameEnded: true };
    }

    // ไม่มีคนเหลือ → ลบห้อง
    if (room.players.size === 0) {
      this.cleanupRoom(code);
      return { roomCode: code, nickname, isHost: false, gameEnded: true };
    }

    // ระหว่างเกม — เช็คว่าทุกคนที่เหลือตอบแล้วหรือยัง
    if (
      room.gameState === GAME_STATE.QUESTION &&
      this.allPlayersAnswered(room)
    ) {
      this.endQuestion(code);
    }

    return { roomCode: code, nickname, isHost: false, gameEnded: false };
  }

  // ===== Queries =====

  getRoom(code: string): QuizRoom | undefined {
    return this.rooms.get(code);
  }

  getPlayerRoom(socketId: string): string | undefined {
    return this.socketToRoom.get(socketId);
  }

  getPlayerList(room: QuizRoom): { nickname: string; isHost: boolean }[] {
    return Array.from(room.players.values()).map((p) => ({
      nickname: p.nickname,
      isHost: p.socketId === room.hostSocketId,
    }));
  }

  getScoreboard(room: QuizRoom): ScoreboardEntry[] {
    return Array.from(room.players.values())
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({
        nickname: p.nickname,
        score: p.score,
        rank: i + 1,
      }));
  }

  // ===== Private: Game Flow =====

  private startCountdown(code: string): void {
    let seconds = QUIZ_CONFIG.COUNTDOWN_BEFORE_START_SEC;

    const interval = setInterval(() => {
      const room = this.rooms.get(code);
      if (!room) {
        clearInterval(interval);
        return;
      }

      this.onEmitToRoom?.(code, 'quiz:countdown', { seconds });

      seconds--;
      if (seconds < 0) {
        clearInterval(interval);
        this.sendNextQuestion(code);
      }
    }, 1000);
  }

  private sendNextQuestion(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.currentQuestionIndex++;

    // คำถามหมด → จบเกม
    if (room.currentQuestionIndex >= room.questions.length) {
      this.endGame(code);
      return;
    }

    // Reset คำตอบทุกคน
    for (const player of room.players.values()) {
      player.currentAnswer = null;
      player.answeredAt = null;
    }

    room.gameState = GAME_STATE.QUESTION;
    room.questionStartedAt = Date.now();

    const question = room.questions[room.currentQuestionIndex];
    const payload: QuestionPayload = {
      index: room.currentQuestionIndex,
      total: room.questions.length,
      question: question.question,
      choices: question.choices,
      timeLimit: QUIZ_CONFIG.TIME_PER_QUESTION_SEC,
    };

    this.onEmitToRoom?.(code, 'quiz:question', payload);

    // Auto-end เมื่อหมดเวลา
    setTimeout(() => {
      const currentRoom = this.rooms.get(code);
      if (
        currentRoom &&
        currentRoom.gameState === GAME_STATE.QUESTION &&
        currentRoom.currentQuestionIndex === room.currentQuestionIndex
      ) {
        this.endQuestion(code);
      }
    }, QUIZ_CONFIG.TIME_PER_QUESTION_SEC * 1000);
  }

  private endQuestion(code: string): void {
    const room = this.rooms.get(code);
    if (!room || room.gameState !== GAME_STATE.QUESTION) return;

    room.gameState = GAME_STATE.ANSWER_REVEAL;

    const question = room.questions[room.currentQuestionIndex];
    const results: PlayerResult[] = [];

    // คำนวณคะแนน
    for (const player of room.players.values()) {
      const isCorrect = player.currentAnswer === question.correctIndex;
      let scoreGained = 0;

      if (isCorrect && player.answeredAt && room.questionStartedAt) {
        const timeUsedMs = player.answeredAt - room.questionStartedAt;
        const timeUsedSec = timeUsedMs / 1000;
        const timeRemaining = QUIZ_CONFIG.TIME_PER_QUESTION_SEC - timeUsedSec;
        scoreGained = Math.round(
          QUIZ_CONFIG.BASE_SCORE *
            (timeRemaining / QUIZ_CONFIG.TIME_PER_QUESTION_SEC),
        );
      }

      player.score += scoreGained;

      results.push({
        nickname: player.nickname,
        choiceIndex: player.currentAnswer,
        isCorrect,
        scoreGained,
        totalScore: player.score,
      });
    }

    const answerResult: AnswerResultPayload = {
      correctIndex: question.correctIndex,
      players: results,
    };

    this.onEmitToRoom?.(code, 'quiz:answer_result', answerResult);

    // ส่ง scoreboard หลังจาก 2 วิ → คำถามถัดไปหลังจาก 5 วิ
    setTimeout(() => {
      const currentRoom = this.rooms.get(code);
      if (!currentRoom) return;

      currentRoom.gameState = GAME_STATE.SCOREBOARD;
      this.onEmitToRoom?.(
        code,
        'quiz:scoreboard',
        this.getScoreboard(currentRoom),
      );

      setTimeout(() => {
        this.sendNextQuestion(code);
      }, 3000);
    }, 2000);
  }

  private endGame(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.gameState = GAME_STATE.FINISHED;

    const scoreboard = this.getScoreboard(room);
    this.onEmitToRoom?.(code, 'quiz:game_end', {
      scoreboard,
      winner: scoreboard[0] ?? null,
    });

    this.logger.log(`Game ended in room ${code}`);

    // ลบห้องหลัง 10 วิ
    setTimeout(() => {
      this.cleanupRoom(code);
    }, 10000);
  }

  // ===== Private: Helpers =====

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ไม่มี I,O,0,1 กันสับสน
    let code: string;
    do {
      code = Array.from(
        { length: QUIZ_CONFIG.ROOM_CODE_LENGTH },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join('');
    } while (this.rooms.has(code));
    return code;
  }

  private shuffleQuestions() {
    const questions = [...MOCK_QUESTIONS];
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    return questions;
  }

  private allPlayersAnswered(room: QuizRoom): boolean {
    for (const player of room.players.values()) {
      if (player.currentAnswer === null) return false;
    }
    return true;
  }

  private cleanupRoom(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    for (const socketId of room.players.keys()) {
      this.socketToRoom.delete(socketId);
    }
    this.rooms.delete(code);
    this.logger.log(`Room ${code} cleaned up`);
  }
}
