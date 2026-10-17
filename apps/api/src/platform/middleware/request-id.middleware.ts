import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const reqId = (req.headers['x-request-id'] as string) || `req_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  req.requestId = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
}
