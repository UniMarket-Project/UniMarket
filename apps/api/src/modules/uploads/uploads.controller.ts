import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';
import { UploadsService } from './uploads.service.js';
import { storage } from '../../platform/storage/index.js';
import { sendSuccess } from '../../platform/http/response.js';

export class UploadsController {
  public static async getPresignedUpload(req: Request, res: Response): Promise<void> {
    const result = await UploadsService.getPresignedUpload(req.user!.userId, req.body);
    sendSuccess(req, res, result);
  }

  // Direct file receiver (uploads directly to Cloudflare R2 / storage provider from server)
  public static async handleDirectUpload(req: Request, res: Response): Promise<void> {
    const purpose = (req.query.purpose as string) || (req.headers['x-purpose'] as string) || 'avatar';
    const contentType = req.headers['content-type'] || 'image/jpeg';
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');

    if (!buffer || buffer.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No file content received' },
      });
      return;
    }

    const result = await UploadsService.uploadDirect(
      req.user!.userId,
      purpose,
      buffer,
      contentType
    );
    sendSuccess(req, res, result, 201);
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

  // Public file server for storage assets
  public static async handleServeFile(req: Request, res: Response): Promise<void> {
    const rawKey = req.params.key;
    if (!rawKey) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Missing key parameter' },
      });
      return;
    }

    const file = await storage.getFile(rawKey);
    if (!file) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'File not found' },
      });
      return;
    }

    if (file.contentType) {
      res.setHeader('Content-Type', file.contentType);
    }
    if (file.contentLength) {
      res.setHeader('Content-Length', file.contentLength);
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    file.body.pipe(res);
  }
}
