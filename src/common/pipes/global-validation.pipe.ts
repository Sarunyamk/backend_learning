import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ErrorTypes } from '../types/error-type';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      exceptionFactory(errors) {
        const formattedError = errors.reduce<Record<string, string[]>>(
          (acc, el) => {
            if (el.constraints) {
              acc[el.property] = Object.values(el.constraints);
            }
            return acc;
          },
          {},
        );
        throw new BadRequestException({
          message: 'The provided data is invalid',
          code: ErrorTypes.ValidationError,
          details: formattedError,
        });
      },
    });
  }
}
