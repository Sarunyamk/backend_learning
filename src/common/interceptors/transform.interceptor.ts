import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Request } from 'express';
import { type Observable, map } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
  path: string;
  timestamp: string;
}

interface PaginatedApiResponse<T> {
  success: true;
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  message: string;
  path: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | PaginatedApiResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | PaginatedApiResponse<T>> {
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ??
      'Success';

    const request = context.switchToHttp().getRequest<Request>();
    const path = request.url;
    const timestamp = new Date().toISOString();

    return next.handle().pipe(
      map((data) => {
        if (data instanceof PaginatedResponseDto) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
            message,
            path,
            timestamp,
          };
        }

        return {
          success: true,
          data,
          message,
          path,
          timestamp,
        };
      }),
    );
  }
}
