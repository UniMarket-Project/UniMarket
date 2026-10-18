import rateLimit from 'express-rate-limit';
import { ErrorCode } from '@unimarket/shared';

function createRateLimiter(windowMs: number, max: number, message = 'Too many requests, please try again later.') {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: ErrorCode.RATE_LIMITED,
          message,
        },
        meta: {
          timestamp: new Date().toISOString(),
          ...(req.requestId ? { requestId: req.requestId } : {}),
        },
      });
    },
  });
}

// 5000 requests per 15 min
export const globalRateLimiter = createRateLimiter(15 * 60 * 1000, 5000);

// 5 failed auth requests per 15 min
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  10, // 10 attempts allowed in dev/mvp
  'Too many login/registration attempts. Please try again after 15 minutes.'
);

// 30 messages per minute
export const messagesRateLimiter = createRateLimiter(60 * 1000, 30, 'You are sending messages too quickly.');

// 10 reports per hour
export const reportsRateLimiter = createRateLimiter(60 * 60 * 1000, 10, 'Too many reports submitted. Please wait.');
