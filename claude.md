# CLAUDE.md — [PROJECT NAME] from Nest

> **สำหรับ AI Agent:** อ่านไฟล์นี้ก่อนทำงานทุกครั้ง ไฟล์นี้คือ source of truth ของโปรเจค

---

## 0. Agent Workflow (ทำทุก session — ห้ามข้าม)

### Phase 1: Onboarding (อ่านตามลำดับก่อนเริ่มงาน)

```
1. CLAUDE.md   — spec, architecture, rules ทั้งหมด (ไฟล์นี้)
2. progress.md — task list + module status + reusable files
3. prisma.md   — current schema จริง (ถ้าไม่มีไฟล์นี้ ต้องแจ้ง developer ก่อน)
4. jest.md     — existing test coverage (ถ้ามี — เพื่อไม่ให้สร้าง test ซ้ำ)
5. product.md - business logic , detail
```

### Phase 2: Before Coding

```
1. ตรวจ progress.md → งานที่ค้างอยู่คืออะไร เริ่มจากตรงนั้น
2. ตรวจ Reusable Files ใน progress.md → ถ้ามีไฟล์ที่สร้างแล้ว ให้ใช้ ห้ามสร้างซ้ำ
3. ถ้า prisma.md ไม่มี → หยุด แจ้ง developer สร้าง prisma.md ก่อนเริ่มงาน
```

### Phase 3: Before Ending (ทำทุกข้อก่อนถือว่าจบงาน)

**Senior Code Review — ตรวจสอบ 3 เรื่อง:**
```
1. Security     — Secret leakage, SQL Injection, Unsafe API logic
2. Performance  — Prisma N+1 Query, unnecessary DB calls
3. Best Practice— Naming convention, Type safety, Layer violation
```

**Build / Lint / Test:**
```
pnpm build  → ต้องผ่าน 0 errors
pnpm lint   → ต้องผ่าน 0 errors
pnpm test   → ต้องผ่านทุก test
```

**Update .md files (อัปเดตทุกไฟล์ที่เกี่ยวข้อง):**
```
progress.md — tasks ที่ทำเสร็จ + reusable files ใหม่ + งานถัดไป
prisma.md   — ถ้า schema เปลี่ยน
jest.md     — ถ้าเพิ่ม/เปลี่ยน tests
```

---

## A. Agent Role & Engineering Philosophy

> **[FIXED]** — ใช้เหมือนกันทุก project

### A.1 User Context

```
ผู้ใช้งาน: Junior Programmer ที่กำลังเรียนรู้
Agent role: Senior Developer + Mentor (ไม่ใช่แค่ทำงานให้เสร็จ)
```

Agent ต้องทำดังนี้ทุกครั้ง:
- **อธิบาย Why** — เหตุผลของการตัดสินใจด้าน architecture ทุกครั้ง
- **ใช้ Technical Terminology** ที่ถูกต้อง พร้อม brief explanation เมื่อ concept ซับซ้อน
- **ชี้ Design Patterns** และลิงก์ Official Docs เมื่อเหมาะสม
- **เสนอ Trade-offs** — ข้อดี/ข้อเสีย/ความเสี่ยง ให้ developer ตัดสินใจเองได้

### A.2 Engineering Mindset

```
Priority: Safety > Maintainability > Performance > Brevity
```

- เลือก approach ที่ **ปลอดภัยที่สุด** ก่อนเสมอ
- เขียนโค้ดที่ **คนอื่นมาทำงานต่อได้** โดยไม่ต้องถาม
- คิดถึง **Long-term** — โค้ดนี้จะ maintain ได้ง่ายใน 6 เดือนไหม
- ถ้ามี shortcut ที่เสี่ยง → อธิบายความเสี่ยงก่อน อย่าทำแบบเงียบๆ

### A.3 Documentation = Source of Truth

```
.md files คือ Single Source of Truth ของ project
Agent ทุกตัวต้องอ่านก่อนทำงาน และอัปเดตเมื่อมีการเปลี่ยนแปลง
```

---

## 1. Project Overview

> **[FILL IN]** — เปลี่ยนทุกอย่างในส่วนนี้ตาม project จริง

### 1.1 Business Context
อยู่ใน product.md

---

## 2. Tech Stack

> **[FIXED]** — ใช้เหมือนกันทุก NestJS project

```
Package Manager : pnpm
Language        : TypeScript (strict mode — no `any`)
Framework       : NestJS
ORM             : Prisma
Database        : PostgreSQL
Auth            : JWT (@nestjs/jwt)
Validation      : class-validator + class-transformer
Upload          : Cloudinary (@nestjs/platform-express + multer)
Payment         : Stripe  [ลบออกถ้าไม่ใช้]
Email           : @nestjs-modules/mailer + Handlebars templates  [ลบออกถ้าไม่ใช้]
API Docs        : @nestjs/swagger
Testing         : Jest + @nestjs/testing
Config          : @nestjs/config + Zod validation version4
Security        : helmet (HTTP security headers)
```

---

## 3. Architecture Rules (บังคับ — ห้ามละเมิด)

> **[FIXED]** — ใช้เหมือนกันทุก NestJS project

### 3.1 Layer Responsibilities

| Layer | File | หน้าที่ |
|-------|------|---------|
| **Controller** | `*.controller.ts` | รับ HTTP request, เรียก Service, return response — **ห้ามมี logic** |
| **Service** | `*.service.ts` | Business logic, orchestration, throw exceptions |
| **Repository** | `*.repository.ts` | Prisma queries เท่านั้น — ห้ามมี business logic |
| **DTO** | `dtos/*.dto.ts` | Input/output shape + class-validator decorators |
| **Guard** | `guards/*.guard.ts` | ตรวจสอบ auth / role ก่อนเข้า endpoint |
| **Interceptor** | `interceptors/*.interceptor.ts` | Transform response / logging |
| **Filter** | `filters/*.filter.ts` | Handle exceptions ทุกประเภท |
| **Pipe** | `pipes/*.pipe.ts` | Transform / validate input |
| **Decorator** | `decorators/*.decorator.ts` | Reusable metadata / param extraction |

### 3.2 Dependency Chain (ห้ามข้าม layer)

```
Request → Controller → Service → Repository → PrismaService → Database
```

- Controller → Service เท่านั้น (ห้าม inject Repository หรือ PrismaService โดยตรง)
- Service → Repository เท่านั้น (ห้าม inject PrismaService โดยตรง)
- Repository → PrismaService เท่านั้น

**Cross-Module Repository Injection (✅ อนุญาต):**
```
Service สามารถ inject Repository จาก Module อื่นได้ — ยังคง Service → Repository chain
ตัวอย่าง: CartService ต้องการตรวจสอบ MenuItem → inject IMenuRepository จาก MenuModule

ข้อกำหนด:
- export TOKEN จาก source module: exports: [MENU_REPOSITORY]
- import source Module ใน consumer: imports: [MenuModule]
- inject ผ่าน interface: @Inject(MENU_REPOSITORY) private readonly menuRepository: IMenuRepository
```

### 3.3 TypeScript Rules

```typescript
// ✅ CORRECT — explicit type ทุก function
- ทุกอันมี type ชัดเจน แยกเป็น folder types ของแต่ละ feature หรือ section ถ้าเป็น type props
สามารถ เรียกใช้ที่ page นั้นได้ แต่ถ้าสามารถ reuse ได้ ก็ แยกไปเป็น file เพื่อ reuse
```

### 3.4 Database Rules

> ใช้กับทุก project ที่ใช้ Prisma + PostgreSQL

```
✅ Schema changes → ใช้ migration เท่านั้น: pnpm prisma migrate dev
✅ Logic/Access control → ใช้ Server-side (Service layer)
❌ ห้ามใช้ Row Level Security (RLS) — logic ต้องอยู่ใน Backend API layer
❌ ห้ามใช้ prisma db push ใน production
```

**[FILL IN] Seeding Policy:**
```
[เลือก 1 อย่าง:]
- ✅ อนุญาต: pnpm prisma db seed  (สำหรับ dev data)
- 🚫 ห้าม seeding ทุกกรณี
```

**[FILL IN] Production Database Policy:**
```
[ถ้า deploy production แล้ว:]
- 🚫 ห้าม Reset Database
- 🚫 ห้าม prisma migrate reset
- ✅ เพิ่ม Table/Column ด้วย Migration เท่านั้น

[ถ้ายังเป็น development:]
- ✅ Reset ได้: pnpm prisma migrate reset
```

### 3.5 Error Handling

**Services throw NestJS HTTP exceptions** โดยใช้ `ErrorTypes` constants เป็น `code` field:

```typescript
import { ErrorTypes } from '../common/types/error-types.type';

throw new ConflictException({ message: 'Email already exists', code: ErrorTypes.EmailAlreadyExists });
throw new NotFoundException({ message: 'User not found', code: ErrorTypes.RecordNotFound });
throw new UnauthorizedException({ message: 'Invalid credentials', code: ErrorTypes.InvalidCredentials });
throw new BadRequestException({ message: 'Invalid input', code: ErrorTypes.BadRequest });
throw new ForbiddenException({ message: 'Access denied', code: ErrorTypes.Forbidden });
```

**ErrorTypes** — ใช้ค่าเหล่านี้เท่านั้น (อยู่ใน `src/common/types/error-types.type.ts`):

```typescript
EmailAlreadyExists | InvalidCredentials | InvalidResetToken | TokenRequired | InvalidToken
RecordNotFound | DuplicateEntry | ValidationError | BadRequest | Forbidden
QueryExecutionError | InternalServerError
```

**Filter Architecture (2 filters):**

```
Exception thrown
      ↓
Prisma.PrismaClientKnownRequestError?
→ PrismaExceptionFilter → throws ApplicationException
                                    ↓
        GlobalFilter (@Catch()) catches ALL:
        - BaseException/ApplicationException → extract fields directly
        - HttpException (NestJS) → extract status + { message, code } from response body
        - Error → log + default 500
                                    ↓
                        JSON error response
```

**Prisma Error Mapping** (handled automatically by PrismaExceptionFilter):

| Prisma Code | Situation | HTTP | errorCode |
|-------------|-----------|------|-----------|
| P2002 | Unique constraint violation | 409 | `DUPLICATE_ENTRY` |
| P2025 | Record not found | 404 | `RECORD_NOT_FOUND` |
| P2003 | Foreign key constraint | 400 | `BAD_REQUEST` |
| (default) | Other DB error | 500 | `QUERY_EXECUTION_ERROR` |

**Note:** `ApplicationException` ใช้เฉพาะภายใน `PrismaExceptionFilter` เท่านั้น — Services ใช้ NestJS HTTP exceptions ตามปกติ

### 3.6 Pagination (บังคับทุก list endpoint)

> **[FIXED]** — ทุก findMany / list endpoint ต้องมี pagination

**Reusable Pagination DTO:**
```typescript
// src/common/dtos/pagination-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 20;
}
```

**Paginated Response Type:**
```typescript
// src/common/types/paginated.type.ts
export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**Repository Pattern:**
```typescript
// repository — ใช้ skip/take + count
async findAll(page: number, limit: number): Promise<PaginatedResult<User>> {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    this.prisma.user.count(),
  ]);
  return {
    items,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
```

**กฎ:**
```
❌ findMany() ไม่มี take → return ทุก row ใน table → OOM / slow
✅ ทุก findMany() ต้องมี take (limit) เสมอ — ยกเว้น internal lookup ที่รู้ว่า row น้อย
✅ Max limit = 100 → ป้องกัน client request 10,000 rows
✅ ใช้ Promise.all([findMany, count]) → 2 queries parallel แทน sequential
```

### 3.7 Transaction Pattern

> **[FIXED]** — ใช้เมื่อ business logic ต้องแก้หลาย table พร้อมกัน

```typescript
// Transaction อยู่ใน Repository layer (เพราะเป็น DB operation)
// Service เรียก method เดียว — ไม่ต้องรู้ว่าข้างในมี transaction

// ✅ CORRECT — Repository method ครอบ transaction
async createOrderWithItems(data: CreateOrderData): Promise<Order> {
  return await this.prisma.$transaction(async (tx) => {
    const order = await tx.order.create({ data: { userId: data.userId } });

    await tx.orderItem.createMany({
      data: data.items.map(item => ({ ...item, orderId: order.id })),
    });

    // ลด stock ใน transaction เดียวกัน
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return order;
  });
}

// ❌ WRONG — Service ทำ multi-step โดยไม่มี transaction
async createOrder(data: CreateOrderData): Promise<Order> {
  const order = await this.orderRepo.create(data);   // ถ้า step ถัดไป fail
  await this.itemRepo.createMany(data.items);          // → order มีแต่ไม่มี items
  await this.productRepo.decrementStock(data.items);   // → stock ไม่ลด
}
```

**กฎ:**
```
✅ Transaction method อยู่ใน Repository — Service เรียก method เดียว
✅ ใช้ interactive transaction: $transaction(async (tx) => { ... })
✅ ทุก query ใน transaction ต้องใช้ tx ไม่ใช่ this.prisma
❌ ห้าม sequential transaction: $transaction([query1, query2]) — ควบคุม error ยาก
❌ ห้าม Service orchestrate multi-repo calls โดยไม่มี transaction ครอบ
```

### 3.8 Prisma Query Performance

> **[FIXED]** — N+1 prevention + select vs include

**N+1 Problem:**
```typescript
// ❌ N+1 — findAll แล้ว loop query relation ทีละ row
const orders = await this.prisma.order.findMany();
for (const order of orders) {
  order.items = await this.prisma.orderItem.findMany({
    where: { orderId: order.id },  // N additional queries!
  });
}

// ✅ Single query with include
const orders = await this.prisma.order.findMany({
  include: { items: true },  // 1 query — Prisma JOIN ให้
});
```

**select vs include:**
```typescript
// ✅ Public API (list) → select เฉพาะ field ที่ต้องการ — เร็วกว่า, ปลอดภัยกว่า
const users = await this.prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // ไม่ดึง password, refreshToken, หรือ field ที่ไม่ใช้
  },
});

// ✅ Internal/Detail → include relation ได้ตามต้องการ
const order = await this.prisma.order.findUnique({
  where: { id },
  include: { items: true, user: { select: { id: true, name: true } } },
});
```

**กฎ:**
```
✅ List endpoints → ใช้ select เฉพาะ field ที่ client ต้องการ
✅ Detail endpoints → include relation ที่จำเป็น
❌ ห้าม return password, refreshToken, หรือ sensitive field ให้ client
❌ ห้าม include nested relation ลึกเกิน 2 ชั้น → performance degrade
❌ ห้าม findMany() + loop query → ใช้ include / select กับ relation แทน
```

---

## 4. Modules & Folder Structure

> **[FILL IN]** — เพิ่ม/ลบ feature modules ตาม project จริง
> **[FIXED]** — common/, config/, database/, shared/ โครงสร้างเหมือนกันทุก project

### 4.0 .md Files System (ต้องมีทุก project)

> **[FIXED]** — โครงสร้างไฟล์ที่ agent ใช้ track context ระหว่าง sessions

| ไฟล์ | หน้าที่ | อัปเดตเมื่อ |
|------|---------|------------|
| `CLAUDE.md` | Spec, architecture, rules — ไม่ค่อยเปลี่ยน | เปลี่ยน architecture หรือ add major feature |
| `progress.md` | Task list, module status, reusable files | ทุก session |
| `prisma.md` | Schema ปัจจุบัน (models, relations, enums) | เมื่อ schema เปลี่ยน |
| `jest.md` | Test coverage ทุก module (headings only) | เมื่อเพิ่ม/เปลี่ยน tests |

**กฎ:**
- Agent อ่านทุกไฟล์ข้างบน *ก่อนเริ่มงาน* ทุกครั้ง
- เมื่อโค้ดเปลี่ยน → อัปเดตไฟล์ที่ relevant ทันที ก่อนจบ session

**jest.md format:**
```markdown
## Module: Auth
- AuthService > register > should throw ConflictException if email exists
- AuthService > register > should hash password and return token
- AuthRepository > findByEmail > should return null if not found

## Module: User
- UserService > findById > ...
```

---

### 4.1 Feature Modules ของ project นี้

```
[แทนที่ด้วย modules จริงของ project เช่น:]
- AuthModule    — register, login, forgot/reset password
- UserModule    — profile, edit, history

```

### 4.2 Folder Structure

```
src/
├── @types/
│   └── express.d.ts               # extends Request with user: JwtPayload
│
├── common/                        # [FIXED] ใช้เหมือนกันทุก project
│   ├── decorators/
│   │   ├── current-user.decorator.ts      # @CurrentUser() → req.user
│   │   ├── public.decorator.ts            # @Public() → bypass AuthGuard
│   │   ├── roles.decorator.ts             # @Roles(Role.ADMIN)
│   │   └── response-message.decorator.ts  # @ResponseMessage('...')
│   ├── exceptions/
│   │   ├── base.exception.ts              # BaseException extends Error (message, errorCode, statusCode, details)
│   │   └── application.exception.ts       # ApplicationException extends BaseException (used in PrismaExceptionFilter)
│   ├── filters/
│   │   ├── global.filter.ts               # @Catch() — catches all exceptions → structured JSON response
│   │   └── prisma-exception.filter.ts     # @Catch(PrismaClientKnownRequestError) → throws ApplicationException
│   ├── guards/
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   ├── dtos/
│   │   └── pagination-query.dto.ts        # Reusable pagination DTO (page, limit)
│   ├── pipes/
│   │   └── global-validation.pipe.ts
│   └── types/
│       ├── error-types.type.ts            # ErrorTypes const + ErrorType union
│       └── paginated.type.ts              # PaginatedResult<T> generic type
│
├── config/                        # [FIXED]
│   ├── env.validation.ts          # Zod schema validate .env
│   └── typed-config.service.ts    # Type-safe ConfigService wrapper
│
├── database/                      # [FIXED]
│   └── database.module.ts         # Global PrismaService
│
├── auth/                          # [FILL IN] ปรับตาม project
│   ├── dtos/
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── types/
│   │   └── jwt-payload.type.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.repository.ts
│   └── auth.module.ts
│
├── [feature-module]/              # [FILL IN] ซ้ำ pattern นี้ต่อทุก module
│   ├── constants/                 # Error codes, magic strings
│   │   └── [module]-error.constant.ts
│   ├── dtos/
│   │   └── *.dto.ts
│   ├── interfaces/                # OOP Repository Interface + Token (บังคับ)
│   │   └── [module]-repository.interface.ts
│   ├── types/                     # TypeScript types สำหรับ complex Prisma return types
│   │   └── [module]-type.ts
│   ├── [module].controller.ts
│   ├── [module].service.ts
│   ├── [module].repository.ts
│   └── [module].module.ts
│
├── shared/                        # [FIXED]
│   ├── security/
│   │   ├── interfaces/                   # [FIXED] OOP interface pattern
│   │   │   ├── jwt.interface.ts          # APP_JWT_SERVICE token + IAppJwtService
│   │   │   └── hash.interface.ts         # HASH_SERVICE token + IHashService
│   │   ├── security.module.ts
│   │   ├── jwt.service.ts                # implements IAppJwtService
│   │   └── bcrypt.service.ts             # implements IHashService
│   └── upload/                    # [ลบออกถ้าไม่ใช้ Cloudinary]
│       ├── upload.module.ts
│       └── cloudinary.service.ts
│
├── app.module.ts
└── main.ts
```

---

## 5. Global Providers Setup

> **[FIXED]** — ใช้เหมือนกันทุก NestJS project

### main.ts

```typescript
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());  // Security headers (XSS, clickjacking, MIME sniffing)
  app.useGlobalPipes(new GlobalValidationPipe());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
    credentials: true,  // ถ้าใช้ cookie-based refresh token
  });
  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('[PROJECT NAME] API')
    .setDescription('[Description]')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer' })
    .addServer(`http://localhost:${process.env.PORT ?? 3000}`)
    .build();
  SwaggerModule.setup('api-docs', app, SwaggerModule.createDocument(app, config));

  const logger = new Logger('Bootstrap');
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Running on http://localhost:${process.env.PORT ?? 3000}/api`);
  logger.log(`Swagger at http://localhost:${process.env.PORT ?? 3000}/api-docs`);
}
```

### app.module.ts — providers

```typescript
providers: [
  { provide: APP_GUARD,       useClass: AuthGuard },
  { provide: APP_GUARD,       useClass: RolesGuard },
  { provide: APP_GUARD,       useClass: ThrottlerGuard },  // [Optional] rate limiting
  { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  { provide: APP_FILTER,      useClass: GlobalFilter },
  { provide: APP_FILTER,      useClass: PrismaExceptionFilter },
],
```

---

## 6. Standard Response Format

> **[FIXED]**

### Success (via TransformInterceptor)

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;    // จาก @ResponseMessage('...') decorator
  path: string;       // request URL
  timestamp: string;  // ISO 8601
}
```

### Error (via GlobalFilter)

```typescript
interface ErrorResponse {
  success: false;
  timestamp: string;       // ISO 8601
  statusCode: number;
  errorCode: string;       // จาก ErrorTypes — เช่น 'EMAIL_ALREADY_EXISTS'
  message: string;
  details: unknown | null; // extra context เช่น { field: 'User' } จาก Prisma P2002
  path: string;
}
```

---

## 7. Auth & Authorization

> **[FIXED]** pattern — **[FILL IN]** roles ตาม project

### JwtPayload type

```typescript
// ปรับ role ตาม project จริง
type JwtPayload = {
  sub: string;      // userId
  email: string;
  role: Role;       // [FILL IN] enum ของ project
  iat?: number;
  exp?: number;
};
```

### Decorator Usage

```typescript
// Public endpoint — ไม่ต้อง auth
@Public()
@Get('products')
async getAll(): Promise<ProductDto[]> { ... }

// Protected — ดึง user จาก token
@Get('me')
async getProfile(@CurrentUser() user: JwtPayload): Promise<UserDto> { ... }

// Admin only
@Roles(Role.ADMIN)
@Delete(':id')
async delete(@Param('id') id: string): Promise<void> { ... }

// Response message
@ResponseMessage('Login successful')
@Post('login')
async login(@Body() dto: LoginDto): Promise<AuthResponseDto> { ... }
```

### Refresh Token Pattern

> **[FIXED]** — Production auth ต้องมี refresh token

**Flow:**
```
1. POST /auth/login → return { accessToken, refreshToken }
2. Access token หมดอายุ (15m) → client ส่ง refresh token
3. POST /auth/refresh → verify refresh token → issue new pair (access + refresh)
4. POST /auth/logout → invalidate refresh token ใน DB
```

**Storage Strategy:**
```
Access Token  : client memory / Authorization header (short-lived: 15m)
Refresh Token : HttpOnly cookie (preferred) หรือ DB field (long-lived: 7d)
```

**Implementation Guideline:**
```typescript
// auth.service.ts
async login(dto: LoginDto): Promise<AuthResponseDto> {
  // ... validate credentials
  const accessToken = await this.jwtService.signToken(payload);
  const refreshToken = crypto.randomUUID();  // opaque token ไม่ใช่ JWT
  const hashedRefresh = await this.hashService.hashPassword(refreshToken);

  await this.authRepository.updateRefreshToken(user.id, hashedRefresh);
  return { accessToken, refreshToken };
}

async refresh(refreshToken: string, userId: string): Promise<AuthResponseDto> {
  const user = await this.authRepository.findById(userId);
  if (!user?.refreshToken) throw new UnauthorizedException({ message: 'Invalid refresh token', code: ErrorTypes.InvalidToken });

  const isValid = await this.hashService.comparePassword(refreshToken, user.refreshToken);
  if (!isValid) throw new UnauthorizedException({ message: 'Invalid refresh token', code: ErrorTypes.InvalidToken });

  // Token Rotation — issue new pair, invalidate old
  const newAccessToken = await this.jwtService.signToken(payload);
  const newRefreshToken = crypto.randomUUID();
  await this.authRepository.updateRefreshToken(user.id, await this.hashService.hashPassword(newRefreshToken));

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async logout(userId: string): Promise<void> {
  await this.authRepository.updateRefreshToken(userId, null);  // invalidate
}
```

**กฎ:**
```
✅ Refresh token เป็น opaque string (UUID) — ไม่ใช่ JWT (เพื่อ revoke ได้)
✅ Hash refresh token ก่อน store ใน DB (เหมือน password)
✅ Token Rotation — ออก refresh token ใหม่ทุกครั้งที่ refresh
✅ Logout → set refreshToken = null ใน DB
❌ ห้าม store refresh token เป็น plain text ใน DB
❌ ห้ามใช้ JWT เป็น refresh token (revoke ไม่ได้จนกว่าจะหมดอายุ)
```

---

## 8. Swagger Convention

> **[FIXED]** — บังคับทุก endpoint

```typescript
@ApiTags('auth')              // ใส่ที่ Controller class
@Controller('auth')
export class AuthController {

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> { ... }

  @ApiBearerAuth()            // ใส่ทุก protected route
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'User retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserDto> { ... }
}
```

---

## 9. DTO Convention

> **[FIXED]** — pattern เหมือนกันทุก project

```typescript
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  firstname: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  address?: string;
}
```

---

## 10. Email Module

> **[FIXED]** setup — **[FILL IN]** templates ตาม project — ลบ section นี้ถ้าไม่ใช้ email

ใช้ `@nestjs-modules/mailer` — ห้ามใช้ plain Nodemailer

```typescript
// email.module.ts
MailerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [TypedConfigService],
  useFactory: (config: TypedConfigService): MailerOptions => ({
    transport: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.get('EMAIL_ADMIN'),
        pass: config.get('EMAIL_PASS'),
      },
    },
    defaults: { from: '"[App Name]" <noreply@example.com>' },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: { strict: true },
    },
  }),
}),
```

```typescript
// email.service.ts
async sendWelcomeEmail(to: string, name: string): Promise<void> {
  await this.mailerService.sendMail({
    to,
    subject: 'Welcome!',
    template: './welcome',          // templates/welcome.hbs
    context: { name },
  });
}
```

---

## 11. Prisma Schema

> **[FILL IN]** — เปลี่ยน models ตาม domain ของ project จริง

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/database/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}

// [FILL IN] เพิ่ม models ตาม domain
// model Product { ... }
// model Order { ... }
```

> **PostgreSQL rules:**
> - `String @id @default(uuid())` — ใช้ UUID ไม่ใช่ autoincrement สำหรับ User
> - ไม่ต้องใช้ `@db.Timestamp(0)` — ใช้ `DateTime` เฉยๆ
> - cascade: `onDelete: Cascade` สำหรับ child records

---

## 12. Endpoint Map

> **[FILL IN]** — map ทุก endpoint ที่ project ต้องการ

---

## 13. Environment Variables

> **[FILL IN]** — เพิ่ม/ลบ ตาม services ที่ project ใช้จริง

```env
# Server
API_PORT=4000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:database_password@localhost:5432/database_name"

# Auth (JWT)
JWT_SECRET="generate-secure-random-string-min-32-chars"
JWT_ACCESS_TTL="15m"
JWT_REFRESH_TTL="7d"
SALT_ROUNDS=10

ALLOWED_ORIGINS="http://localhost:3000"  # comma-separated: "http://localhost:3000,https://example.com"

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

SEED_ADMIN_EMAIL=""
SEED_ADMIN_PASSWORD=""

```

---

## 13.1 File Storage Strategy

### Option A: Cloudinary

```bash
pnpm add cloudinary multer
pnpm add -D @types/multer
```

เหมาะกับ: image-heavy projects, ต้องการ image transformation (resize, crop, format)

### Option B: DigitalOcean Spaces (S3 Compatible) ⭐ แนะนำสำหรับ production

```bash
pnpm add @aws-sdk/client-s3 multer
pnpm add -D @types/multer
```

เหมาะกับ: general file storage, large files, ต้องการ S3-compatible API

**กฎเลือก Storage:**
```
- รูปภาพ + ต้อง transform (resize, crop, webp) → Cloudinary
- ไฟล์ทั่วไป / production scale → DigitalOcean Spaces / S3
- ห้าม store file ใน local disk (server stateless)
- ห้าม store binary ใน database
```

---

## 15. Coding Conventions

> **[FIXED]**

| สิ่ง | Convention | ตัวอย่าง |
|-----|-----------|---------|
| ไฟล์ | kebab-case | `user-profile.service.ts` |
| Class | PascalCase | `UserProfileService` |
| Method/Variable | camelCase | `findUserById()` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Error code | SCREAMING_SNAKE_CASE | `'USER_NOT_FOUND'` |
| Enum value | SCREAMING_SNAKE_CASE | `Role.ADMIN` |

**Logger — ห้ามใช้ console.log:**
```typescript
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async findById(id: string): Promise<User> {
    this.logger.log(`Finding user: ${id}`);
    // ...
    this.logger.error(`User not found: ${id}`);
  }
}
```

---

## 16. OOP Interface Pattern (บังคับทุก Repository และ Shared Service)

> **[FIXED]** — ใช้เหมือนกันทุก NestJS project สำหรับ **ทุก Repository และ Shared Service**

**หลักการ:** Interface ชื่อตาม *role* ไม่ใช่ *implementation*
ตัวอย่าง: `IHashService` (ไม่ใช่ `IBcryptService`), `ICartRepository` (ไม่ใช่ `IPrismaCartRepository`)
→ swap implementation ได้โดยไม่แตะ consumer

**ทำไม Repository ต้องมี Interface ด้วย?**
- Unit test: mock `IMenuRepository` ง่ายกว่า mock concrete class
- Cross-module injection: CartService inject `IMenuRepository` จาก MenuModule ผ่าน token
- เปลี่ยน ORM: สร้าง `TypeOrmMenuRepository implements IMenuRepository` แก้แค่ module เดียว

### Interface + Token file pattern

```typescript
// shared/security/interfaces/hash.interface.ts
export const HASH_SERVICE = 'HASH_SERVICE';

export interface IHashService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}
```

```typescript
// shared/security/interfaces/jwt.interface.ts
import { JwtPayload } from '../../../auth/types/jwt-payload.type';

export const APP_JWT_SERVICE = 'APP_JWT_SERVICE';

export interface IAppJwtService {
  signToken(payload: JwtPayload): Promise<string>;   // ต้อง async เสมอ
  verifyToken(token: string): Promise<JwtPayload>;   // ต้อง async เสมอ
}
```

### Concrete service implements interface

```typescript
// shared/security/bcrypt.service.ts
@Injectable()
export class BcryptService implements IHashService {
  private readonly saltRounds: number;

  constructor(private readonly config: TypedConfigService) {
    this.saltRounds = config.get('SALT_ROUNDS'); // ✅ Zod coerce.number() → ไม่ต้อง parseInt
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

```typescript
// shared/security/jwt.service.ts
@Injectable()
export class AppJwtService implements IAppJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);   // ✅ async ไม่ใช่ sync
  }
}
```

### Module registration

```typescript
// shared/security/security.module.ts
@Module({
  providers: [
    TypedConfigService,
    { provide: APP_JWT_SERVICE, useClass: AppJwtService },
    { provide: HASH_SERVICE, useClass: BcryptService },
    // ถ้าเปลี่ยน → { provide: HASH_SERVICE, useClass: ArgonHashService }
  ],
  exports: [TypedConfigService, APP_JWT_SERVICE, HASH_SERVICE],
  //        ↑ export TOKEN ไม่ใช่ class — ต้อง match กับ provide
})
export class SecurityModule {}
```

### Consumer injection

```typescript
// auth.service.ts
constructor(
  @Inject(HASH_SERVICE) private readonly hashService: IHashService,
  @Inject(APP_JWT_SERVICE) private readonly jwtService: IAppJwtService,
) {}

async register(...) {
  const hashed = await this.hashService.hashPassword(dto.password);  // ✅ await
  const token = await this.jwtService.signToken(payload);            // ✅ await ทุกครั้ง
}
```

### Guard injection

```typescript
// auth.guard.ts
constructor(
  @Inject(APP_JWT_SERVICE) private readonly appJwtService: IAppJwtService,
  private readonly reflector: Reflector,
) {}

async canActivate(...): Promise<boolean> {
  const payload = await this.appJwtService.verifyToken(token);  // ผ่าน abstraction
}
```

---

## 16.1 Common Mistakes (อย่าทำซ้ำ)

> **[FIXED]** — Lessons learned ที่เคยเกิดขึ้นจริง

```
❌ parseInt() กับ Zod coerce.number() value
   → Zod transform ให้เป็น number แล้ว, parseInt รับ string เท่านั้น (TypeScript strict error)
   ✅ this.saltRounds = config.get('SALT_ROUNDS')  // ไม่ต้อง parseInt

❌ JwtService.sign() / .verify() sync
   → Block Node.js event loop ใต้ load
   ✅ signAsync() / verifyAsync() เสมอ

❌ Guard inject JwtService จาก @nestjs/jwt โดยตรง
   → Bypass abstraction layer, ยาก test
   ✅ @Inject(APP_JWT_SERVICE) private readonly appJwtService: IAppJwtService

❌ ลืม await หลังเปลี่ยน signToken เป็น async
   → accessToken = Promise<string> object → serialize เป็น {} ใน JSON (silent bug!)
   ✅ const token = await this.jwtService.signToken(payload)

❌ exports: [ConcreteClass] แทนที่จะเป็น exports: [TOKEN]
   → NestJS หา provider ด้วย token แต่ export ด้วย class name → ไม่เจอ
   ✅ exports: [HASH_SERVICE, APP_JWT_SERVICE]

❌ @prisma/client/runtime/library (Prisma v7 ลบแล้ว)
   ✅ import { Decimal } from '@prisma/client/runtime/client'

❌ import { Role } from '@prisma/client' ใน Prisma v7
   → ไม่มี export จาก @prisma/client อีกต่อไป
   ✅ import { Role } from '../database/generated/prisma/client'

❌ Service inject PrismaService โดยตรงเพื่อ query model จาก domain อื่น
   → ละเมิด Dependency Chain: Service ต้องไม่รู้จัก PrismaService
   ✅ เพิ่ม method ใน Repository domain นั้น แล้ว inject ผ่าน Interface token
   ✅ ตัวอย่าง: CartService ต้องการ menuItem
      → MenuRepository.findById() + @Inject(MENU_REPOSITORY) IMenuRepository

❌ exports: [CartRepository]  ← export concrete class
   → module อื่นที่ inject ด้วย token จะหาไม่เจอ
   ✅ exports: [CART_REPOSITORY]  ← export TOKEN เสมอ

❌ @nestjs/jwt v11: expiresIn รับ number | StringValue ไม่ใช่ plain string
   → TypeScript error เมื่อส่ง string จาก env
   ✅ expiresIn: this.accessTtl as unknown as number  // cast workaround

❌ Route /me อยู่หลัง /:id → NestJS match 'me' เป็น id parameter
   → GET /users/me ส่งกลับ 404 (หา user ด้วย id = 'me')
   ✅ ประกาศ @Patch('me') / @Get('me') ก่อน @Get(':id') เสมอ

❌ Prisma include เปลี่ยน return type → interface Promise<Model[]> ไม่ match
   → ESLint: "Unsafe return of a value of type error"
   ✅ สร้าง custom type: type ModelWithRelation = Model & { relation: {...} }
   ✅ ใช้ type นี้ใน interface แทน plain Model

❌ ลืม async/await ใน repository methods ที่ return Prisma promise
   → ESLint: "Async method has no 'await' expression"
   ✅ ใส่ async + return await this.prisma.model.method()

❌ DELETE = hard delete → ข้อมูลหายถาวร
   → ส่วนใหญ่ production ต้องการ soft delete
   ✅ DELETE endpoint → update isActive: false (soft delete)
   ✅ findAll() → where: { isActive: true } เป็น default

❌ ให้ user เปลี่ยน isActive/role ของตัวเอง
   → อันตราย: admin lock ตัวเองออกจากระบบ
   ✅ PATCH /me → strip isActive, role ออก (throw BadRequestException)
   ✅ DELETE /users/:id → ห้าม id === currentUser.sub

❌ GlobalFilter let errorCode = ErrorTypes.InternalServerError (literal type)
   → TypeScript infer เป็น literal 'INTERNAL_SERVER_ERROR' → ไม่ยอม assign string อื่น
   ✅ let errorCode: string = ErrorTypes.InternalServerError

❌ bootstrap() floating promise
   → ESLint: no-floating-promises
   ✅ void bootstrap()

❌ findMany() ไม่มี take/skip → return ทุก row ใน table
   → Production: table มี 100k rows → OOM / slow response
   ✅ ทุก findMany() ต้องมี take (limit) เสมอ

❌ Circular dependency: ModuleA imports ModuleB ↔ ModuleB imports ModuleA
   → NestJS resolve ไม่ได้ → runtime error
   ✅ ใช้ forwardRef(() => ModuleX) หรือ refactor ให้มี SharedModule

❌ DTO class ไม่มี @ApiProperty → Swagger แสดง empty body
   ✅ ทุก field ใน DTO ต้องมี @ApiProperty หรือ @ApiPropertyOptional

❌ Prisma enum เปลี่ยนแล้วไม่ run prisma generate
   → TypeScript ยัง cache type เดิม → build ผ่านแต่ runtime fail
   ✅ แก้ schema.prisma → pnpm prisma generate ทุกครั้ง

❌ Multi-table update ไม่ครอบ $transaction
   → step แรกสำเร็จ step ที่สอง fail → data inconsistency
   ✅ ใช้ $transaction(async (tx) => { ... }) ครอบทุก multi-table operation

❌ Refresh token store เป็น plain text ใน DB
   → ถ้า DB leak → attacker ใช้ refresh token ได้ทันที
   ✅ Hash refresh token ก่อน store (เหมือน password)

❌ findMany() + loop query relation → N+1 Problem
   → 1 + N queries → response ช้ามากเมื่อ data เยอะ
   ✅ ใช้ include หรือ select กับ relation ใน query เดียว
```

---

## 17. Prisma v7 Setup

> **[FIXED]** — แตกต่างจาก Prisma v5 อย่างมีนัยสำคัญ

### schema.prisma generator

```prisma
generator client {
  provider     = "prisma-client"      // ← v7: ไม่ใช่ "prisma-client-js"
  output       = "../src/database/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
  // ไม่ต้อง url = env("DATABASE_URL") — ใช้ adapter แทน
}
```

### PrismaService

```typescript
// src/database/prisma.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { TypedConfigService } from '../config/typed-config.service';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(typeConfigService: TypedConfigService) {
    const adapter = new PrismaPg({
      connectionString: typeConfigService.get('DATABASE_URL'),
    });
    super({ adapter });
    // ไม่ต้อง OnModuleInit/OnModuleDestroy — adapter จัดการ connection เอง
  }
}
```

### DatabaseModule

```typescript
@Global()
@Module({
  providers: [PrismaService, TypedConfigService],  // ← TypedConfigService ต้องอยู่ใน providers
  exports: [PrismaService],
})
export class DatabaseModule {}
```

### Import paths ใน Prisma v7

```typescript
// ✅ CORRECT — import จาก generated path
import { Role, User, MenuItem, Prisma } from '../database/generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

// ❌ WRONG — Prisma v7 ไม่ export จาก @prisma/client โดยตรง
import { Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
```

```bash
# Install
pnpm add @prisma/client @prisma/adapter-pg pg
pnpm add -D prisma

# Generate client (ทำหลัง schema เปลี่ยนทุกครั้ง)
pnpm prisma generate

# Migrate
pnpm prisma migrate dev
```

---

## 18. Key Packages

> **[FIXED]** base — เพิ่มตาม project

```bash
# Core
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express rxjs reflect-metadata helmet

# Config + Validation
pnpm add @nestjs/config zod class-validator class-transformer

# Database (Prisma v7)
pnpm add @prisma/client @prisma/adapter-pg pg
pnpm add -D prisma

# Auth
pnpm add @nestjs/jwt bcrypt
pnpm add -D @types/bcrypt

# Swagger
pnpm add @nestjs/swagger

# [Optional] Rate Limiting
pnpm add @nestjs/throttler

# Testing
pnpm add -D jest @nestjs/testing @types/jest ts-jest

# [Optional] Upload — Option A: Cloudinary
pnpm add cloudinary multer
pnpm add -D @types/multer

# [Optional] Upload — Option B: DigitalOcean Spaces
pnpm add @aws-sdk/client-s3 multer
pnpm add -D @types/multer

# [Optional] Email
pnpm add @nestjs-modules/mailer nodemailer handlebars
pnpm add -D @types/nodemailer

# [Optional] Payment
pnpm add stripe
```

---

## 19. Optional Patterns (เพิ่มตาม project)

> **[OPTIONAL]** — เลือกใช้ตามความต้องการของ project

### 19.1 API Versioning

```typescript
// main.ts
app.setGlobalPrefix('api');
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',    // → /api/v1/...
});
```

### 19.2 Rate Limiting (@nestjs/throttler)

```bash
pnpm add @nestjs/throttler
```

```typescript
// app.module.ts
ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),

// providers
{ provide: APP_GUARD, useClass: ThrottlerGuard },

// Per-endpoint override (เช่น contact form)
@Throttle({ default: { ttl: 60000, limit: 5 } })
@Post()
async submitInquiry() { ... }
```

### 19.3 Admin Audit Log (Interceptor Pattern)

> auto-log ทุก POST/PATCH/DELETE โดยไม่ต้องแก้ module เดิม

```
Design:
1. AdminLogInterceptor (global) → intercept ทุก mutation request
2. AdminLogService.createLog() → fire-and-forget (try/catch, ไม่กระทบ response)
3. @SkipAdminLog() decorator → skip endpoints ที่ไม่ต้อง log (เช่น auth/login)
4. AdminLog model → stores adminId, action, module, targetId, oldData, newData
```

```typescript
// interceptor สกัด module name จาก URL path
const moduleName = request.url.split('/').filter(Boolean)[2] ?? 'unknown';
// action จาก HTTP method
const action = { POST: 'CREATE', PATCH: 'UPDATE', DELETE: 'DELETE' }[method];
```

**Access Control for Admin Logs:**
```
SUPER_ADMIN: เห็น log ทั้งหมด + filter by adminId
ADMIN: เห็น log ของ ADMIN ทุกคน แต่ไม่เห็น log ของ SUPER_ADMIN
→ where.admin = { role: { not: UserRole.SUPER_ADMIN } }
```


### 19.5 Soft Delete Pattern

> ใช้เมื่อข้อมูลห้ามหายถาวร (users, orders, products)

```typescript
// Prisma model — เพิ่ม isActive field
model User {
  id       String   @id @default(uuid())
  isActive Boolean  @default(true)
  // ...
}

// Repository — findAll filter isActive by default
async findAll(page: number, limit: number): Promise<PaginatedResult<User>> {
  const where = { isActive: true };
  const [items, total] = await Promise.all([
    this.prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit }),
    this.prisma.user.count({ where }),
  ]);
  return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

// Repository — soft delete
async softDelete(id: string): Promise<User> {
  return await this.prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
}
```

**กฎ:**
```
✅ DELETE endpoint → update isActive: false (soft delete)
✅ findAll() → where: { isActive: true } เป็น default
✅ findById() ที่ public ใช้ → where: { id, isActive: true }
❌ ห้าม hard delete (prisma.delete) ยกเว้น data retention policy กำหนดไว้
```

### 19.6 Health Check Endpoint

> **[FIXED]** — Production deployment ต้องมี health check สำหรับ load balancer / container orchestration

```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check(): Promise<{ status: string; timestamp: string }> {
    // ตรวจ DB connection
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

**กฎ:**
```
✅ ต้องเป็น @Public() — ไม่ต้อง auth
✅ ตรวจ DB connection ด้วย — ไม่ใช่แค่ return 200
✅ ใช้สำหรับ: Docker HEALTHCHECK, K8s liveness/readiness probe, Load balancer
```

### 19.7 Role-Based GET Filtering

> ใช้เมื่อ role ต่างกันเห็นข้อมูลต่างกัน

```typescript
// Service — filter data based on role
async findAll(user: JwtPayload, query: PaginationQueryDto): Promise<PaginatedResult<Order>> {
  // ADMIN เห็นเฉพาะ orders ของตัวเอง, SUPER_ADMIN เห็นทั้งหมด
  const where: Prisma.OrderWhereInput = {
    isActive: true,
    ...(user.role !== Role.SUPER_ADMIN && { userId: user.sub }),
  };

  return this.orderRepository.findAll(where, query.page, query.limit);
}
```

**กฎ:**
```
✅ Filter logic อยู่ใน Service layer — ไม่ใช่ Controller หรือ Repository
✅ SUPER_ADMIN เห็นทั้งหมด, ADMIN เห็นเฉพาะ scope ของตัวเอง
✅ ใช้ spread + conditional → สร้าง where clause แบบ clean
❌ ห้าม trust client-sent userId — ใช้ @CurrentUser() จาก JWT เสมอ
```

### 19.8 Prisma Include Type Safety

```typescript
// เมื่อใช้ include → return type เปลี่ยน → ต้องสร้าง custom type
export type AdminLogWithAdmin = AdminLog & {
  admin: { id: string; name: string; email: string; role: UserRole } | null;
};

// ใช้ใน interface แทน plain AdminLog
export interface IAdminLogRepository {
  findAll(params: {...}): Promise<AdminLogWithAdmin[]>;
}
```

---



## Build / Test / Lint

| Command | Status | วันที่รัน | ผลลัพธ์ |
|---------|--------|----------|---------|
| pnpm build | - | - | - |
| pnpm lint  | - | - | - |
| pnpm test  | - | - | - |

---

## Notes / Decisions

(บันทึก architecture decisions, trade-offs, ปัญหาที่เจอ และวิธีแก้)
````
