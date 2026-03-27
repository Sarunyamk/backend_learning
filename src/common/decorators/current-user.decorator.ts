import {
  createParamDecorator,
  type ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { type Request } from 'express';
import { type JwtPayload } from 'src/modules/auth/types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user;
    if (!user) {
      throw new InternalServerErrorException(
        'CurrentUser cannot be used without authentication',
      );
    }
    return data ? user[data] : user;
  },
);
