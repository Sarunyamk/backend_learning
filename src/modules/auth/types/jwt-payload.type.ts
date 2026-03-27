//? Mock UserRole
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole; //? fill role in database/generated/prisma/client
  iat?: number;
  exp?: number;
};
