// ===== Chat Events =====
export const CHAT_EVENT = {
  JOIN_ROOM: 'chat:join_room',
  LEAVE_ROOM: 'chat:leave_room',
  SEND_MESSAGE: 'chat:send_message',
  MESSAGE: 'chat:message',
  USER_JOINED: 'chat:user_joined',
  USER_LEFT: 'chat:user_left',
  ROOM_USERS: 'chat:room_users',
  ERROR: 'chat:error',
} as const;

export type ChatEvent = (typeof CHAT_EVENT)[keyof typeof CHAT_EVENT];

// ===== Stock Events =====
export const STOCK_EVENT = {
  SUBSCRIBE: 'stock:subscribe',
  UNSUBSCRIBE: 'stock:unsubscribe',
  UPDATE: 'stock:update',
  SNAPSHOT: 'stock:snapshot',
  ERROR: 'stock:error',
} as const;

export type StockEvent = (typeof STOCK_EVENT)[keyof typeof STOCK_EVENT];

// ===== Quiz Events =====
export const QUIZ_EVENT = {
  CREATE_ROOM: 'quiz:create_room',
  JOIN_ROOM: 'quiz:join_room',
  LEAVE_ROOM: 'quiz:leave_room',
  START_GAME: 'quiz:start_game',
  SUBMIT_ANSWER: 'quiz:submit_answer',
  QUESTION: 'quiz:question',
  COUNTDOWN: 'quiz:countdown',
  ANSWER_RESULT: 'quiz:answer_result',
  SCOREBOARD: 'quiz:scoreboard',
  GAME_END: 'quiz:game_end',
  PLAYER_JOINED: 'quiz:player_joined',
  PLAYER_LEFT: 'quiz:player_left',
  ROOM_CREATED: 'quiz:room_created',
  ERROR: 'quiz:error',
} as const;

export type QuizEvent = (typeof QUIZ_EVENT)[keyof typeof QUIZ_EVENT];
