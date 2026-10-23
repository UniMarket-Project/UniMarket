import { createApp } from './app.js';
import { config } from './platform/config/index.js';
import { logger } from './platform/logger/logger.js';
import { prisma } from './platform/database/prisma.client.js';
import { startBackgroundJobs } from './platform/jobs/scheduler.js';

async function bootstrap() {
  const app = createApp();

  // Test database connection
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL successfully');
  } catch (err) {
    logger.error({ err }, 'Failed to connect to PostgreSQL on startup');
  }

  // Start background cron jobs
  startBackgroundJobs();

  const server = app.listen(config.app.port, () => {
    logger.info(`UniMarket API running on port ${config.app.port} [${config.app.env}]`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed.');
      await prisma.$disconnect();
      logger.info('Prisma disconnected.');
      process.exit(0);
    });

    // Force shutdown after 10s
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal error bootstrapping API application');
  process.exit(1);
});
