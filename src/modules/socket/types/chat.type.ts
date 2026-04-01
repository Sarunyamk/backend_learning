// ===== Chat User =====
export type ChatUser = {
  id: string;
  nickname: string;
  joinedAt: Date;
};

// ===== Chat Message =====
export type ChatMessage = {
  id: string;
  roomId: string;
  userId: string;
  nickname: string;
  content: string;
  timestamp: Date;
};

// ===== Chat Room (in-memory) =====
export type ChatRoom = {
  id: string;
  users: Map<string, ChatUser>;
  messages: ChatMessage[];
  createdAt: Date;
};

// ===== Client → Server Payloads =====
export type JoinRoomPayload = {
  roomId: string;
  nickname: string;
};

export type LeaveRoomPayload = {
  roomId: string;
};

export type SendMessagePayload = {
  roomId: string;
  content: string;
};
