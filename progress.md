# Progress — Learning Fullstack (Backend)

## Current Sprint: Socket.io Real-time

---

### Done
- [x] Project setup (NestJS 11, TypeScript strict, Prisma v7, Zod env validation)
- [x] Auth module — register, login, JWT + refresh token, guards (AuthGuard, RolesGuard)
- [x] Common layer — decorators (@Public, @Roles, @CurrentUser, @ResponseMessage), filters, interceptors, pipes
- [x] Shared services — SecurityModule (BcryptService, AppJwtService via OOP interfaces)
- [x] Database module — PrismaService (Prisma v7 + PrismaPg adapter)
- [x] Config module — TypedConfigService + Zod env validation
- [x] Swagger setup — non-production API docs
- [x] CORS setup — ALLOWED_ORIGINS from env
- [x] Documentation — claude.md

---

### Socket.io Feature Plan

> **3 Use Cases:** Real-time Chat, Stock Ticker, Mini Kahoot Quiz
> **All state in-memory** (no Prisma/DB needed) — Map/Set data structures
> **Namespaced gateways:** `/chat`, `/stock`, `/quiz`

---

#### Phase 0: Setup & Dependencies
- [ ] Install packages: `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
- [ ] Update `main.ts` — CORS config for WebSocket (ใช้ ALLOWED_ORIGINS เดิม)
- [ ] Update `env.validation.ts` — ถ้าต้องเพิ่ม env ใหม่ (อาจไม่จำเป็น)

#### Phase 1: Shared Constants & Types
- [ ] `src/modules/socket/constants/socket-event.constant.ts`
  - Chat events: `CHAT_JOIN_ROOM`, `CHAT_LEAVE_ROOM`, `CHAT_SEND_MESSAGE`, `CHAT_MESSAGE`, `CHAT_USER_JOINED`, `CHAT_USER_LEFT`, `CHAT_ROOM_USERS`
  - Stock events: `STOCK_SUBSCRIBE`, `STOCK_UNSUBSCRIBE`, `STOCK_UPDATE`
  - Quiz events: `QUIZ_CREATE_ROOM`, `QUIZ_JOIN_ROOM`, `QUIZ_START_GAME`, `QUIZ_SUBMIT_ANSWER`, `QUIZ_QUESTION`, `QUIZ_SCOREBOARD`, `QUIZ_GAME_END`, `QUIZ_COUNTDOWN`, `QUIZ_ANSWER_RESULT`
- [ ] `src/modules/socket/constants/socket-namespace.constant.ts`
  - `SOCKET_NAMESPACE = { CHAT: '/chat', STOCK: '/stock', QUIZ: '/quiz' } as const`
- [ ] `src/modules/socket/constants/quiz.constant.ts`
  - Mock questions (5-10 questions), time per question (15s), max players per room, score calculation formula
- [ ] `src/modules/socket/constants/stock.constant.ts`
  - Mock stocks (5-8 stocks), update interval (2s), price range, volatility config
- [ ] `src/modules/socket/types/chat.type.ts`
  - `ChatMessage`, `ChatRoom`, `ChatUser`
- [ ] `src/modules/socket/types/stock.type.ts`
  - `StockData`, `StockSubscription`
- [ ] `src/modules/socket/types/quiz.type.ts`
  - `QuizRoom`, `QuizPlayer`, `QuizQuestion`, `QuizAnswer`, `QuizScoreboard`, `GameState`

#### Phase 2: Chat Gateway
- [ ] `src/modules/socket/gateways/chat.gateway.ts` — namespace `/chat`
  - `@SubscribeMessage('join_room')` — join room + broadcast user_joined
  - `@SubscribeMessage('leave_room')` — leave room + broadcast user_left
  - `@SubscribeMessage('send_message')` — broadcast message to room
  - `handleConnection` — track connected users
  - `handleDisconnect` — cleanup rooms + broadcast user_left
  - In-memory: `Map<roomId, ChatRoom>` (room → users + messages)

#### Phase 3: Stock Gateway
- [ ] `src/modules/socket/gateways/stock.gateway.ts` — namespace `/stock`
  - `@SubscribeMessage('subscribe')` — subscribe client to stock updates
  - `@SubscribeMessage('unsubscribe')` — unsubscribe client
  - `handleConnection` / `handleDisconnect` — cleanup subscriptions
  - `setInterval` mock price generator — random walk algorithm
  - Broadcast updates only to subscribed clients (room-based)

#### Phase 4: Quiz Gateway
- [ ] `src/modules/socket/gateways/quiz.gateway.ts` — namespace `/quiz`
  - `@SubscribeMessage('create_room')` — host creates room, gets room code
  - `@SubscribeMessage('join_room')` — player joins with room code + nickname
  - `@SubscribeMessage('start_game')` — host starts, send first question + countdown
  - `@SubscribeMessage('submit_answer')` — player submits answer, calculate score (time bonus)
  - Question flow: countdown (3s) → question (15s) → answer_result → scoreboard → next question
  - Score formula: `baseScore * (timeRemaining / totalTime)` — faster = more points
  - `handleDisconnect` — remove player / end game if host leaves
  - In-memory: `Map<roomCode, QuizRoom>` (room → players, questions, scores, currentQuestion, gameState)

#### Phase 5: Socket Module
- [ ] `src/modules/socket/socket.module.ts` — register ChatGateway, StockGateway, QuizGateway
- [ ] Update `app.module.ts` — import SocketModule

#### Phase 6: Test & Polish
- [ ] Test Chat — connect 2 clients, join room, send messages
- [ ] Test Stock — subscribe/unsubscribe, verify price updates
- [ ] Test Quiz — create room, join players, play full game
- [ ] Error handling — invalid room code, duplicate nickname, room full
- [ ] `pnpm build` pass
- [ ] `pnpm lint` pass
- [ ] Update .md files (progress.md, claude.md ถ้าจำเป็น)

---

### Backlog (Priority Order)

- [ ] Payment module (Stripe integration — real payment flow)
- [ ] User module (profile, CRUD)
- [ ] Health check endpoint

---

## Reusable Files

| File | Path | Description |
|------|------|-------------|
| `GlobalFilter` | `src/common/exceptions/global.exception.filter.ts` | Catches all exceptions → structured JSON |
| `PrismaExceptionFilter` | `src/common/exceptions/prisma-exception.filter.ts` | Prisma error → ApplicationException |
| `TransformInterceptor` | `src/common/interceptors/transform.interceptor.ts` | Standardized success response |
| `GlobalValidationPipe` | `src/common/pipes/global-validation.pipe.ts` | class-validator pipe |
| `PaginationQueryDto` | `src/common/dto/pagination-query.dto.ts` | Reusable pagination (page, limit) |
| `ErrorTypes` | `src/common/types/error-types.type.ts` | Error code constants |
| `@Public()` | `src/common/decorators/public.decorator.ts` | Skip auth |
| `@Roles()` | `src/common/decorators/roles.decorator.ts` | Role-based access |
| `@CurrentUser()` | `src/common/decorators/current-user.decorator.ts` | Extract user from JWT |
| `@ResponseMessage()` | `src/common/decorators/response-message.decorator.ts` | Custom success message |
| `TypedConfigService` | `src/config/typed-config.service.ts` | Type-safe env access |
| `BcryptService` | `src/shared/security/bcrypt.service.ts` | IHashService implementation |
| `AppJwtService` | `src/shared/security/jwt.service.ts` | IAppJwtService implementation |
