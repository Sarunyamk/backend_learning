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
- [x] Install packages: `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
- [x] `src/config/socket-io.adapter.ts` — SocketIoAdapter ใช้ CORS จาก TypeConfigService
- [x] Update `main.ts` — `app.useWebSocketAdapter(new SocketIoAdapter(app))`
- [x] Gateway ไม่ต้องใส่ cors เอง — adapter จัดการให้ทุก namespace

#### Phase 1: Shared Constants & Types
- [x] `src/modules/socket/constants/socket-event.constant.ts` — `CHAT_EVENT`, `STOCK_EVENT`, `QUIZ_EVENT` (as const + derived type)
- [x] `src/modules/socket/constants/socket-namespace.constant.ts` — `SOCKET_NAMESPACE` (`/chat`, `/stock`, `/quiz`)
- [x] `src/modules/socket/constants/quiz.constant.ts` — `QUIZ_CONFIG` + `MOCK_QUESTIONS` (10 questions)
- [x] `src/modules/socket/constants/stock.constant.ts` — `MOCK_STOCKS` (6 stocks) + interval/history config
- [x] `src/modules/socket/types/chat.type.ts` — `ChatUser`, `ChatMessage`, `ChatRoom`, client payloads
- [x] `src/modules/socket/types/stock.type.ts` — `StockConfig`, `StockData`, client payloads
- [x] `src/modules/socket/types/quiz.type.ts` — `QuizRoom`, `QuizPlayer`, `QuizQuestion`, `GameState`, client/server payloads

#### Phase 2: Chat Gateway
- [x] `src/modules/socket/gateways/chat.gateway.ts` — thin layer (เหมือน Controller)
  - `@SubscribeMessage('join_room')` — เรียก service → broadcast user_joined + room_users
  - `@SubscribeMessage('leave_room')` — เรียก service → broadcast user_left
  - `@SubscribeMessage('send_message')` — เรียก service → broadcast message
  - `handleDisconnect` — เรียก service → broadcast user_left
- [x] `src/modules/socket/services/chat.service.ts` — business logic
  - `joinRoom()` — สร้างห้อง, เพิ่ม user, return user list
  - `leaveRoom()` — ลบ user, ลบห้องถ้าว่าง
  - `createMessage()` — สร้าง message, จำกัด 100 ต่อห้อง
  - `handleDisconnect()` — cleanup user data
  - In-memory: `Map<roomId, ChatRoom>` + `Map<socketId, userData>`
  - TODO comments สำหรับ DB persist (save message, load history)

#### Phase 3: Stock Gateway
- [x] `src/modules/socket/gateways/stock.gateway.ts` — thin layer (เหมือน Controller)
  - `@SubscribeMessage('subscribe')` — validate symbols → join rooms → ส่ง snapshot
  - `@SubscribeMessage('unsubscribe')` — leave rooms
  - `onModuleInit` — register callback จาก service เพื่อ broadcast price updates
  - `handleDisconnect` — Socket.io rooms cleanup อัตโนมัติ
- [x] `src/modules/socket/services/stock.service.ts` — business logic
  - `onModuleInit` — initialize prices + start setInterval (random walk)
  - `onModuleDestroy` — clear interval
  - `getSnapshot()` — ราคาปัจจุบันของ symbols ที่ขอ
  - `setOnPriceUpdate()` — callback pattern ให้ gateway broadcast
  - In-memory: `Map<symbol, StockData>`, random walk algorithm (volatility per stock)
- [x] Register `StockGateway` + `StockService` ใน `socket.module.ts`

#### Phase 4: Quiz Gateway
- [x] `src/modules/socket/gateways/quiz.gateway.ts` — thin layer (เหมือน Controller)
  - `@SubscribeMessage('create_room')` — สร้างห้อง → ส่ง room code + player list
  - `@SubscribeMessage('join_room')` — validate + join → broadcast player_joined
  - `@SubscribeMessage('start_game')` — เช็ค host + min players → เริ่ม countdown
  - `@SubscribeMessage('submit_answer')` — ส่งคำตอบ → auto-advance ถ้าทุกคนตอบ
  - `@SubscribeMessage('leave_room')` — ออกจากห้อง → broadcast player_left
  - `handleDisconnect` — host ออก = จบเกม, player ออก = broadcast
- [x] `src/modules/socket/services/quiz.service.ts` — business logic
  - `createRoom()` — สร้างห้อง, generate room code (6 ตัว, ไม่มี I/O/0/1)
  - `joinRoom()` — validate (ชื่อซ้ำ, ห้องเต็ม, เกมเริ่มแล้ว)
  - `startGame()` — countdown 3s → ส่งคำถาม → auto-end 15s timeout
  - `submitAnswer()` — บันทึกคำตอบ + เวลา, auto-advance ถ้าทุกคนตอบ
  - `handleDisconnect()` — cleanup, host ออก = จบเกม
  - Score: `BASE_SCORE * (timeRemaining / timeLimit)` — ตอบเร็ว = คะแนนเยอะ
  - Game flow: countdown → question → answer_result → scoreboard → next (วนจนหมด)
  - In-memory: `Map<roomCode, QuizRoom>` + `Map<socketId, roomCode>`
- [x] Register `QuizGateway` + `QuizService` ใน `socket.module.ts`

#### Phase 5: Socket Module
- [x] `src/modules/socket/socket.module.ts` — register providers (เพิ่ม gateway/service ทุกครั้งที่สร้างใหม่)
- [x] Update `app.module.ts` — import SocketModule

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
| `TypeConfigService` | `src/config/type-config.service.ts` | Type-safe env access |
| `SocketIoAdapter` | `src/config/socket-io.adapter.ts` | WebSocket CORS adapter (ใช้ TypeConfigService) |
| `BcryptService` | `src/shared/security/bcrypt.service.ts` | IHashService implementation |
| `AppJwtService` | `src/shared/security/jwt.service.ts` | IAppJwtService implementation |
