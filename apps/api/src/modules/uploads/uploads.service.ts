import crypto from 'crypto';
import path from 'path';
import { storage } from '../../platform/storage/index.js';
import type { PresignUploadInput } from '@unimarket/shared';

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};

export class UploadsService {
  public static async getPresignedUpload(userId: string, input: PresignUploadInput) {
    const ext = EXTENSION_MAP[input.contentType] || 'bin';
    const randomId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const key = `${input.purpose}/${userId}/${Date.now()}-${randomId}.${ext}`;

    const presigned = await storage.getPresignedUploadUrl(key, input.contentType, 300);

    return {
      uploadUrl: presigned.uploadUrl,
      fileUrl: presigned.fileUrl,
      expiresIn: presigned.expiresIn,
      method: presigned.method,
    };
  }
}
