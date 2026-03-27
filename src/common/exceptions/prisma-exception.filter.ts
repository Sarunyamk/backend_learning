import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { Prisma } from 'src/database/generated/prisma/client';
import { ErrorTypes } from '../types/error-type';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    this.logger.error(`Prisma error [${exception.code}]: ${exception.message}`);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();

    const { statusCode, errorCode, message, details } =
      this.mapPrismaError(exception);

    response.status(statusCode).json({
      success: false,
      timestamp,
      statusCode,
      errorCode,
      message,
      details,
      path: request.url,
    });
  }

  private mapPrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    errorCode: string;
    message: string;
    details: unknown;
  } {
    switch (exception.code) {
      case 'P2002': {
        const target = (exception.meta?.target as string[]) ?? ['unknown'];
        return {
          statusCode: HttpStatus.CONFLICT,
          errorCode: ErrorTypes.DuplicateEntry,
          message: `Duplicate entry for field: ${target.join(', ')}`,
          details: { field: target },
        };
      }
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorTypes.RecordNotFound,
          message: 'Record not found',
          details: null,
        };
      case 'P2003': {
        const field = (exception.meta?.field_name as string) ?? 'unknown';
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorTypes.BadRequest,
          message: `Foreign key constraint failed on field: ${field}`,
          details: { field },
        };
      }
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: ErrorTypes.QueryExecutionError,
          message: 'Database error',
          details: null,
        };
    }
  }
}
