import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = Symbol('responseMessage');

export const ResponseMessage = (message: string): MethodDecorator =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
