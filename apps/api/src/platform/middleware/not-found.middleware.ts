import type { Request, Response } from 'express';
import { ErrorCode } from '@unimarket/shared';

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...(req.requestId ? { requestId: req.requestId } : {}),
    },
  });
}
