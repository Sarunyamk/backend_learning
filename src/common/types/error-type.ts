export const ErrorTypes = {
  // Auth
  InvalidCredentials: 'INVALID_CREDENTIALS',
  InvalidToken: 'INVALID_TOKEN',
  TokenExpired: 'TOKEN_EXPIRED',
  TokenRequired: 'TOKEN_REQUIRED',

  // CRUD
  RecordNotFound: 'RECORD_NOT_FOUND',
  DuplicateEntry: 'DUPLICATE_ENTRY',
  ValidationError: 'VALIDATION_ERROR',
  BadRequest: 'BAD_REQUEST',
  Forbidden: 'FORBIDDEN',

  // Email
  EmailSendFailed: 'EMAIL_SEND_FAILED',

  // Upload
  FileTooLarge: 'FILE_TOO_LARGE',
  InvalidFileType: 'INVALID_FILE_TYPE',
  UploadFailed: 'UPLOAD_FAILED',

  // System
  QueryExecutionError: 'QUERY_EXECUTION_ERROR',
  InternalServerError: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorType = (typeof ErrorTypes)[keyof typeof ErrorTypes];
