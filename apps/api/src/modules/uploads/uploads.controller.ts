import type { Request, Response } from 'express';
import { UploadsService } from './uploads.service.js';
import { sendSuccess } from '../../platform/http/response.js';

export class UploadsController {
  public static async getPresignedUpload(req: Request, res: Response): Promise<void> {
    const result = await UploadsService.getPresignedUpload(req.user!.userId, req.body);
    sendSuccess(req, res, result);
  }

  // Local development file receiver
  public static async handleLocalUpload(req: Request, res: Response): Promise<void> {
    // In local dev, accept the raw payload and acknowledge
    res.status(200).json({ success: true, message: 'File received locally' });
  }
}
