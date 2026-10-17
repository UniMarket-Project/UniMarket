import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { IStorageProvider, PresignUploadResult } from './storage.interface.js';
import { config } from '../config/index.js';

export class S3StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = config.storage.bucket;
    this.client = new S3Client({
      region: config.storage.region,
      endpoint: config.storage.endpoint || undefined,
      credentials:
        config.storage.accessKey && config.storage.secretKey
          ? {
              accessKeyId: config.storage.accessKey,
              secretAccessKey: config.storage.secretKey,
            }
          : undefined,
      forcePathStyle: !!config.storage.endpoint,
    });
  }

  public async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 300
  ): Promise<PresignUploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    const fileUrl = config.storage.publicUrl
      ? `${config.storage.publicUrl}/${key}`
      : `https://${this.bucket}.s3.${config.storage.region}.amazonaws.com/${key}`;

    return {
      uploadUrl,
      fileUrl,
      expiresIn: expiresInSeconds,
      method: 'PUT',
    };
  }

  public async deleteFile(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }
}
