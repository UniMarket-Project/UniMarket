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
  } else if (mappedError instanceof Error) {
    message = mappedError.message;
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
