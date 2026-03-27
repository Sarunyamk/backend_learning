import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Request } from 'express';
import { ROLES_KEY } from 'src/common/decorators/role.decorator';
import { ErrorTypes } from 'src/common/types/error-type';
import { UserRole } from '../types/jwt-payload.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      UserRole[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // ไม่มี @Roles() → ผ่านได้ทุก authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        message: 'Access denied',
        code: ErrorTypes.Forbidden,
      });
    }

    // SUPER_ADMIN มีสิทธิ์ทำได้ทุกอย่าง
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.includes(user.role as UserRole);
    if (!hasRole) {
      throw new ForbiddenException({
        message: 'Access denied — insufficient role',
        code: ErrorTypes.Forbidden,
      });
    }

    return true;
  }
}
