import { ErrorCode } from '@unimarket/shared';
import { AppError, type AppErrorDetails } from './app-error.js';

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: AppErrorDetails[] | Record<string, unknown>) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', errorCode: ErrorCode = ErrorCode.UNAUTHENTICATED) {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', errorCode: ErrorCode = ErrorCode.FORBIDDEN, details?: Record<string, unknown>) {
    super(message, 403, errorCode, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, ErrorCode.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', errorCode: ErrorCode = ErrorCode.ALREADY_EXISTS, details?: Record<string, unknown>) {
    super(message, 409, errorCode, details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Validation failed', details?: AppErrorDetails[]) {
    super(message, 422, ErrorCode.VALIDATION_ERROR, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, ErrorCode.RATE_LIMITED);
  }
}
