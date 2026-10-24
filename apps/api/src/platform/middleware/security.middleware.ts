import helmet from 'helmet';
import cors from 'cors';
import type { RequestHandler } from 'express';
import { config } from '../config/index.js';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: config.app.isProd ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

export const corsMiddleware: RequestHandler = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowed = config.security.corsOrigin.split(',').map((o) => o.trim());
    if (allowed.includes(origin) || !config.app.isProd) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-ID', 'X-Token-Transport'],
  exposedHeaders: ['X-Request-ID', 'Retry-After'],
  maxAge: 600,
});
