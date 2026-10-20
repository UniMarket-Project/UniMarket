import type { Request, Response } from 'express';
import { prisma } from '../../platform/database/prisma.client.js';

export class HealthController {
  public static getLiveness(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  public static async getReadiness(_req: Request, res: Response): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: 'ready',
        db: 'up',
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({
        status: 'unavailable',
        db: 'down',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
