import { PrismaClient } from '@prisma/client';
import { logger } from '../logger/logger.js';
import { env } from '../config/env.js';

export const prisma = new PrismaClient({
  log:
    env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
});

if (env.NODE_ENV === 'development') {
  prisma.$on('error' as never, (e: { message: string }) => {
    logger.error({ err: e }, 'Prisma Database Error');
  });
}
