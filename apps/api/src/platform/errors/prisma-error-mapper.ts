import { Prisma } from '@prisma/client';
import { ErrorCode } from '@unimarket/shared';
import { ConflictError, NotFoundError } from './http-errors.js';
import { AppError } from './app-error.js';

export function mapPrismaError(error: unknown): AppError | unknown {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[]) || [];
        const field = target[0] || 'field';
        let code: ErrorCode = ErrorCode.ALREADY_EXISTS;
        if (field.includes('email')) code = ErrorCode.EMAIL_TAKEN;
        if (field.includes('phone')) code = ErrorCode.PHONE_TAKEN;
        return new ConflictError(`A record with this ${field} already exists`, code, { field });
      }
      case 'P2025':
        return new NotFoundError('Record not found or already deleted');
      default:
        return new AppError(`Database operation failed (${error.code})`, 400, ErrorCode.INVALID_STATE);
    }
  }
  return error;
}
