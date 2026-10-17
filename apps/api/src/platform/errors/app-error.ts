import { ErrorCode } from '@unimarket/shared';

export interface AppErrorDetails {
  field?: string;
  code?: string;
  message?: string;
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly details?: AppErrorDetails[] | Record<string, unknown>;

  constructor(
    message: string,
    statusCode = 400,
    errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
    details?: AppErrorDetails[] | Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
