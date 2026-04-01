import type { QuizQuestion } from '../types/quiz.type';

// ===== Quiz Config =====
export const QUIZ_CONFIG = {
  TIME_PER_QUESTION_SEC: 15,
  COUNTDOWN_BEFORE_START_SEC: 3,
  BASE_SCORE: 1000,
  MAX_PLAYERS: 8,
  ROOM_CODE_LENGTH: 6,
} as const;

// ===== Mock Questions =====
export const MOCK_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'q1',
    question: 'JavaScript เป็นภาษาประเภทใด?',
    choices: ['Compiled', 'Interpreted', 'Assembly', 'Markup'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    question: 'NestJS ใช้ภาษาอะไรเป็นหลัก?',
    choices: ['JavaScript', 'Python', 'TypeScript', 'Go'],
    correctIndex: 2,
  },
  {
    id: 'q3',
    question: 'HTTP status code 404 หมายถึงอะไร?',
    choices: ['Server Error', 'Unauthorized', 'Not Found', 'Bad Request'],
    correctIndex: 2,
  },
  {
    id: 'q4',
    question: 'React ใช้ concept ใดในการ render UI?',
    choices: ['MVC', 'Virtual DOM', 'Shadow DOM', 'Web Components'],
    correctIndex: 1,
  },
  {
    id: 'q5',
    question: 'SQL ย่อมาจากอะไร?',
    choices: [
      'Structured Query Language',
      'Simple Question Language',
      'Server Query Logic',
      'Standard Query Library',
    ],
    correctIndex: 0,
  },
  {
    id: 'q6',
    question: 'WebSocket ต่างจาก HTTP อย่างไร?',
    choices: [
      'เร็วกว่า HTTP',
      'Full-duplex communication',
      'ใช้ port อื่น',
      'ไม่ต้อง handshake',
    ],
    correctIndex: 1,
  },
  {
    id: 'q7',
    question: 'Git command ใดใช้สร้าง branch ใหม่?',
    choices: ['git new', 'git branch', 'git create', 'git init'],
    correctIndex: 1,
  },
  {
    id: 'q8',
    question: 'CSS Flexbox property ใดใช้จัดเรียงแนวหลัก?',
    choices: ['align-items', 'flex-wrap', 'justify-content', 'flex-direction'],
    correctIndex: 2,
  },
  {
    id: 'q9',
    question: 'JWT ย่อมาจากอะไร?',
    choices: [
      'Java Web Token',
      'JSON Web Token',
      'JavaScript Web Transfer',
      'JSON Web Transport',
    ],
    correctIndex: 1,
  },
  {
    id: 'q10',
    question: 'Docker container ต่างจาก VM อย่างไร?',
    choices: [
      'เร็วกว่า VM',
      'ไม่ต้องใช้ OS',
      'Share host OS kernel',
      'ใช้ RAM น้อยกว่า',
    ],
    correctIndex: 2,
  },
];
