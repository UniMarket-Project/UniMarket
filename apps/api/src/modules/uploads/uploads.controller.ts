import fs from 'fs';
import path from 'path';
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
    const rawKey = req.params.key;
    if (!rawKey) {
      res.status(400).json({ error: 'Missing key parameter' });
      return;
    }

    const safeKey = path.normalize(rawKey).replace(/^(\.\.[\/\\])+/, '');
    const uploadDir = path.resolve(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, safeKey);

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, req.body);

    res.status(200).json({ success: true, message: 'File saved locally' });
  }
}
