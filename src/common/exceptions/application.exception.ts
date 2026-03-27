import { type HttpStatus } from '@nestjs/common';
import { type ErrorType } from '../types/error-type';
import { BaseException } from './base.exception';

export class ApplicationException extends BaseException {
  public readonly details: unknown;

  constructor(
    message: string,
    statusCode: HttpStatus,
    errorCode: ErrorType,
    details?: unknown,
  ) {
    super(message, statusCode, errorCode);
    this.details = details ?? null;
  }
}
