import type { IStorageProvider, PresignUploadResult } from './storage.interface.js';
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

  public async deleteFile(_key: string): Promise<void> {
    // Local no-op for dev
  }
}
