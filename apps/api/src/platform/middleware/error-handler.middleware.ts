import type { Request, Response, NextFunction } from 'express';
import { ErrorCode, type ApiError } from '@unimarket/shared';
import { AppError } from '../errors/app-error.js';
import { mapPrismaError } from '../errors/prisma-error-mapper.js';
import { logger } from '../logger/logger.js';

export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const mappedError = mapPrismaError(err);
  let statusCode = 500;
  let errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR;
  let message = 'An unexpected server error occurred';
  let details: unknown = undefined;

  if (mappedError instanceof AppError) {
    statusCode = mappedError.statusCode;
    errorCode = mappedError.errorCode;
    message = mappedError.message;
    details = mappedError.details;
  } else if ((mappedError as any)?.name === 'ZodError') {
    statusCode = 422;
    errorCode = ErrorCode.VALIDATION_ERROR;
    const issues = (mappedError as any).errors || (mappedError as any).issues || [];
    const fieldErrors = issues.map((issue: any) => ({
      field: Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path || ''),
      code: String(issue.code || 'VALIDATION_ERROR').toUpperCase(),
      message: issue.message || 'Invalid value',
    }));
    details = fieldErrors;
    message = fieldErrors.map((f: any) => f.message).filter(Boolean).join('. ') || 'Validation failed';
  } else if (mappedError instanceof Error) {
    const rawMessage = mappedError.message || '';
    const trimmed = rawMessage.trim();

    // Catch JSON stringified error messages (e.g. raw Zod issues serialized into Error.message)
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.message) {
          statusCode = 422;
          errorCode = ErrorCode.VALIDATION_ERROR;
          details = parsed.map((item: any) => ({
            field: Array.isArray(item.path) ? item.path.join('.') : String(item.path || ''),
            code: String(item.code || 'VALIDATION_ERROR').toUpperCase(),
            message: item.message || 'Invalid value',
          }));
          message = parsed.map((item: any) => item.message).filter(Boolean).join('. ');
        } else {
          message = rawMessage;
        }
      } catch {
        message = rawMessage;
      }
    } else {
      message = rawMessage;
    }
  }

  if (statusCode >= 500) {
    logger.error(
      {
        err,
        method: req.method,
        url: req.originalUrl,
        requestId: req.requestId,
      },
      'Unhandled internal server error'
    );
  }

  const responseBody: ApiError = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details ? { details: details as ApiError['error']['details'] } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...(req.requestId ? { requestId: req.requestId } : {}),
    },
  };

  res.status(statusCode).json(responseBody);
}
