import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { IStorageProvider, PresignUploadResult } from './storage.interface.js';
import { config } from '../config/index.js';

export interface R2StorageOptions {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  publicUrl?: string;
  endpoint?: string;
  client?: S3Client;
}

export class R2StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl?: string;
  private accountId?: string;

  constructor(options?: R2StorageOptions) {
    const r2Config = config.storage.r2;

    this.accountId = options?.accountId ?? r2Config.accountId;
    const accessKeyId = options?.accessKeyId ?? r2Config.accessKeyId;
    const secretAccessKey = options?.secretAccessKey ?? r2Config.secretAccessKey;
    this.bucket = options?.bucketName ?? r2Config.bucketName;
    this.publicUrl = options?.publicUrl ?? r2Config.publicUrl;
    const customEndpoint = options?.endpoint ?? r2Config.endpoint;

    if (options?.client) {
      this.client = options.client;
      return;
    }

    const endpoint = customEndpoint || (this.accountId ? `https://${this.accountId}.r2.cloudflarestorage.com` : undefined);

    if (!endpoint) {
      throw new Error(
        'Cloudflare R2 configuration error: R2_ACCOUNT_ID (or R2_ENDPOINT) is required when using the R2 storage provider.'
      );
    }

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'Cloudflare R2 configuration error: R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are required.'
      );
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  public async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 300
  ): Promise<PresignUploadResult> {
    const cleanKey = key.replace(/^\/+/, '');

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: cleanKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });

    // In Cloudflare R2, files are accessed publicly via an R2 Public URL (r2.dev or a custom domain)
    const fileUrl = this.publicUrl
      ? `${this.publicUrl.replace(/\/+$/, '')}/${cleanKey}`
      : (this.accountId
          ? `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucket}/${cleanKey}`
          : uploadUrl.split('?')[0]);

    return {
      uploadUrl,
      fileUrl,
      expiresIn: expiresInSeconds,
      method: 'PUT',
    };
  }

  public async deleteFile(key: string): Promise<void> {
    const cleanKey = key.replace(/^\/+/, '');
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: cleanKey,
      })
    );
  }
}
