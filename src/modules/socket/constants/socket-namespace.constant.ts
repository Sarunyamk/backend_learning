export const SOCKET_NAMESPACE = {
  CHAT: '/chat',
  STOCK: '/stock',
  QUIZ: '/quiz',
} as const;

export type SocketNamespace =
  (typeof SOCKET_NAMESPACE)[keyof typeof SOCKET_NAMESPACE];
