import type { Request, Response } from 'express';
import { ReportsService } from './reports.service.js';
import { sendCreated } from '../../platform/http/response.js';

export class ReportsController {
  public static async createReport(req: Request, res: Response): Promise<void> {
    const result = await ReportsService.createReport(req.user!.userId, req.body);
    sendCreated(req, res, result);
  }
}
