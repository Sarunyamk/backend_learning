# NestJS Template

A production-ready NestJS template with authentication, role-based access control, Prisma ORM, and standardized API responses.

## Tech Stack

- **NestJS 11** + TypeScript
- **Prisma 7** + PostgreSQL (driver adapter)
- **JWT** authentication + role-based guards
- **Zod** environment validation
- **Swagger** API documentation (non-production)
- **pnpm** package manager

## Getting Started

### 1. Clone

```bash
git clone <repo-url> my-project
cd my-project
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
API_PORT=4000
NODE_ENV=development

DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

JWT_SECRET="generate-secure-random-string-min-32-chars"
JWT_ACCESS_TTL=900          # seconds (900 = 15 minutes)
JWT_REFRESH_TTL=604800      # seconds (604800 = 7 days)
SALT_ROUNDS=10

ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 4. Setup database

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

### 5. Run

```bash
pnpm start:dev
```

- API: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/api-docs`

## Project Structure

```
src/
├── main.ts                          # Bootstrap
├── app.module.ts                    # Root module
├── @types/                          # Type augmentation
├── common/
│   ├── decorators/                  # @Public, @Roles, @CurrentUser, @ResponseMessage
│   ├── dto/                         # PaginationQueryDto, PaginatedResponseDto
│   ├── exceptions/                  # GlobalFilter, PrismaExceptionFilter, BaseException
│   ├── interceptors/                # TransformInterceptor (standardized response)
│   ├── pipes/                       # GlobalValidationPipe
│   └── types/                       # ErrorTypes
├── config/                          # ConfigModule + Zod env validation
├── database/                        # Prisma module + service
├── modules/
│   └── auth/
│       ├── guards/                  # AuthGuard (JWT), RolesGuard
│       └── types/                   # JwtPayload, UserRole
└── shared/
    └── security/                    # BcryptService, AppJwtService (via interfaces)
```

## Built-in Decorators

### `@Public()`

Skip authentication for a route.

### `@Roles(...roles)`

Restrict access by role. `SUPER_ADMIN` bypasses all role checks.

### `@CurrentUser()`

Extract the authenticated user (or a specific field) from the request.

### `@ResponseMessage(message)`

Set a custom success message in the response.

## Example Module

Here's how to create a new module using the built-in features:

### 1. Generate module

```bash
nest g module modules/users
nest g controller modules/users
nest g service modules/users
```

### 2. Controller example

```typescript

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Public route - no authentication required
  @Public()
  @Get('count')
  getTotalCount() {
    return this.usersService.count();
  }

  // Authenticated - any logged-in user
  @Get('me')
  @ResponseMessage('Profile retrieved')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.sub);
  }

  // Authenticated - extract specific field
  @Get('my-email')
  getEmail(@CurrentUser('email') email: string) {
    return { email };
  }

  // Paginated list - any authenticated user
  @Get()
  @ResponseMessage('Users retrieved')
  async findAll(@Query() query: PaginationQueryDto) {
    const { data, total } = await this.usersService.findAll(query);
    return new PaginatedResponseDto(data, total, query.page, query.limit);
  }

  // Admin only
  @Roles(UserRole.ADMIN)
  @Post()
  @ResponseMessage('User created successfully')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

## API Response Format

### Success

```json
{
  "success": true,
  "data": { ... },
  "message": "Success",
  "path": "/api/v1/users",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Paginated

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "message": "Success",
  "path": "/api/v1/users",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Error

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "The provided data is invalid",
  "details": {
    "email": ["email must be an email"]
  },
  "path": "/api/v1/users",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm start:dev` | Development with watch mode |
| `pnpm start:prod` | Production mode |
| `pnpm build` | Build for production |
| `pnpm lint` | Lint and fix |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run e2e tests |
| `pnpm test:cov` | Test coverage |
