// ===== Quiz Question =====
export type QuizQuestion = {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
};

// ===== Quiz Player =====
export type QuizPlayer = {
  id: string;
  socketId: string;
  nickname: string;
  score: number;
  currentAnswer: number | null;
  answeredAt: number | null;
};

// ===== Game State =====
export const GAME_STATE = {
  LOBBY: 'LOBBY',
  COUNTDOWN: 'COUNTDOWN',
  QUESTION: 'QUESTION',
  ANSWER_REVEAL: 'ANSWER_REVEAL',
  SCOREBOARD: 'SCOREBOARD',
  FINISHED: 'FINISHED',
} as const;

export type GameState = (typeof GAME_STATE)[keyof typeof GAME_STATE];

// ===== Quiz Room (in-memory) =====
export type QuizRoom = {
  code: string;
  hostSocketId: string;
  players: Map<string, QuizPlayer>;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  gameState: GameState;
  questionStartedAt: number | null;
  createdAt: Date;
};

// ===== Client → Server Payloads =====
export type CreateRoomPayload = {
  nickname: string;
};

export type JoinRoomPayload = {
  code: string;
  nickname: string;
};

export type SubmitAnswerPayload = {
  choiceIndex: number;
};

// ===== Server → Client Payloads =====
export type QuestionPayload = {
  index: number;
  total: number;
  question: string;
  choices: string[];
  timeLimit: number;
};

export type AnswerResultPayload = {
  correctIndex: number;
  players: PlayerResult[];
};

export type PlayerResult = {
  nickname: string;
  choiceIndex: number | null;
  isCorrect: boolean;
  scoreGained: number;
  totalScore: number;
};

export type ScoreboardEntry = {
  nickname: string;
  score: number;
  rank: number;
};
