import fs from 'fs';
import path from 'path';
import type { IStorageProvider, PresignUploadResult, StorageFileResult } from './storage.interface.js';
import { config } from '../config/index.js';

export class LocalStorageProvider implements IStorageProvider {
  public async getPresignedUploadUrl(
    key: string,
    _contentType: string,
    expiresInSeconds = 300
  ): Promise<PresignUploadResult> {
    const baseUrl = process.env.API_URL || `http://localhost:${config.app.port}`;
    const uploadUrl = `${baseUrl}/api/v1/uploads/local/${key}`;
    const fileUrl = `${config.storage.publicUrl}/${key}`;

    return {
      uploadUrl,
      fileUrl,
      expiresIn: expiresInSeconds,
      method: 'PUT',
    };
  }

  public async uploadFile(
    key: string,
    buffer: Buffer,
    _contentType: string
  ): Promise<string> {
    const safeKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
    const uploadDir = path.resolve(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, safeKey);

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, buffer);

    const baseUrl = config.storage.publicUrl;
    return `${baseUrl}/${safeKey}`;
  }

  public async getFile(key: string): Promise<StorageFileResult | null> {
    const safeKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
    const uploadDir = path.resolve(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, safeKey);

    try {
      await fs.promises.access(filePath);
      const stream = fs.createReadStream(filePath);
      const stats = await fs.promises.stat(filePath);
      return {
        body: stream,
        contentLength: stats.size,
      };
    } catch {
      return null;
    }
  }

  public async deleteFile(_key: string): Promise<void> {
    // Local no-op for dev
  }
}
