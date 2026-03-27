import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/modules/auth/types/jwt-payload.type';

export const ROLES_KEY = Symbol('roles');

export const Roles = (...roles: UserRole[]): MethodDecorator =>
  SetMetadata(ROLES_KEY, roles);
