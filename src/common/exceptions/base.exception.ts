import { HttpException, type HttpStatus } from '@nestjs/common';
import { type ErrorType } from '../types/error-type';

export class BaseException extends HttpException {
  public readonly errorCode: ErrorType;

  constructor(message: string, statusCode: HttpStatus, errorCode: ErrorType) {
    super({ message, code: errorCode }, statusCode);
    this.errorCode = errorCode;
  }
}
