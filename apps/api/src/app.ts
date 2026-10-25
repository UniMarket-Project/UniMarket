import express, { Express } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { logger } from './platform/logger/logger.js';
import { REDACTED_PATHS } from './platform/logger/redact.js';
import { corsMiddleware, helmetMiddleware } from './platform/middleware/security.middleware.js';
import { requestIdMiddleware } from './platform/middleware/request-id.middleware.js';
import { globalRateLimiter } from './platform/middleware/rate-limit.middleware.js';
import { notFoundMiddleware } from './platform/middleware/not-found.middleware.js';
import { errorHandlerMiddleware } from './platform/middleware/error-handler.middleware.js';
import { healthRouter } from './modules/health/health.routes.js';
import { apiV1Router } from './routes.js';
import { registerNotificationSubscribers } from './modules/notifications/notifications.subscribers.js';

export function createApp(): Express {
  const app = express();

  // Trust reverse proxy for real client IP rate limiting
  app.set('trust proxy', 1);

  // Security headers and CORS
  app.use(helmetMiddleware);
  app.use(corsMiddleware);

  // Parse cookies and JSON bodies
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Correlation ID
  app.use(requestIdMiddleware);

  // Request logging
  app.use(
    pinoHttp({
      logger,
      genReqId: (req: any) => req.requestId || 'req_unknown',
      redact: REDACTED_PATHS,
      autoLogging: {
        ignore: (req) => req.url === '/health' || req.url === '/ready',
      },
    })
  );

  // Health and operational endpoints (outside rate limiter and /api/v1 prefix)
  app.use('/', healthRouter);

  // Serve locally stored uploads
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // Global rate limiter applied to API routes
  app.use('/api/v1', globalRateLimiter);

  // Register domain event subscribers
  registerNotificationSubscribers();

  // Mount API v1 router
  app.use('/api/v1', apiV1Router);

  // 404 handler
  app.use(notFoundMiddleware);

  // Centralized error handler
  app.use(errorHandlerMiddleware);

  return app;
}
