import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service.js';
import { sendSuccess } from '../../platform/http/response.js';

export class PaymentsController {
  public static async recordOffline(req: Request, res: Response): Promise<void> {
    const result = await PaymentsService.recordOfflinePayment(req.user!.userId, req.body);
    sendSuccess(req, res, result);
  }
}
