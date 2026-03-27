import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { ApplicationException } from '../exceptions/application.exception';
import { BaseException } from '../exceptions/base.exception';
import { ErrorTypes } from '../types/error-type';

interface ErrorResponseBody {
  success: false;
  timestamp: string;
  statusCode: number;
  errorCode: string;
  message: string;
  details: unknown;
  path: string;
}

@Catch()
export class GlobalFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = this.buildErrorResponse(exception, request.url);

    if (body.statusCode >= 500) {
      this.logger.error(
        `[${body.errorCode}] ${body.message}`,
        (exception as Error)?.stack,
      );
    } else {
      this.logger.warn(`[${body.errorCode}] ${body.message}`);
    }

    response.status(body.statusCode).json(body);
  }

  private buildErrorResponse(
    exception: unknown,
    path: string,
  ): ErrorResponseBody {
    const timestamp = new Date().toISOString();

    if (exception instanceof ApplicationException) {
      return {
        success: false,
        timestamp,
        statusCode: exception.getStatus(),
        errorCode: exception.errorCode,
        message: exception.message,
        details: exception.details,
        path,
      };
    }

    if (exception instanceof BaseException) {
      return {
        success: false,
        timestamp,
        statusCode: exception.getStatus(),
        errorCode: exception.errorCode,
        message: exception.message,
        details: null,
        path,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message = exception.message;
      let errorCode: string = ErrorTypes.InternalServerError;
      let details: unknown = null;

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        if (typeof resp.message === 'string') message = resp.message;
        if (Array.isArray(resp.message)) message = resp.message.join(', ');
        if (typeof resp.code === 'string') errorCode = resp.code;
        if (resp.details !== undefined) details = resp.details;
      }

      return {
        success: false,
        timestamp,
        statusCode: status,
        errorCode,
        message,
        details,
        path,
      };
    }

    return {
      success: false,
      timestamp,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorTypes.InternalServerError,
      message: 'Internal server error',
      details: null,
      path,
    };
  }
}
