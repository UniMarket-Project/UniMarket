// Ensure required environment variables exist for isolated unit tests
process.env.NODE_ENV = 'test';
process.env.STORAGE_PROVIDER = 'local';
delete process.env.R2_ENDPOINT;
delete process.env.R2_ACCOUNT_ID;
delete process.env.R2_ACCESS_KEY_ID;
delete process.env.R2_SECRET_ACCESS_KEY;
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock_test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_jwt_access_secret_min_16_chars';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_jwt_refresh_secret_min_16_chars';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.HMAC_SECRET = process.env.HMAC_SECRET || 'test_hmac_secret_min_16_chars';

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStorageProvider } from '../../src/platform/storage/local.storage.js';
import { R2StorageProvider } from '../../src/platform/storage/r2.storage.js';
import { getStorageProvider } from '../../src/platform/storage/index.js';
import { config } from '../../src/platform/config/index.js';
import { S3Client } from '@aws-sdk/client-s3';

describe('Storage Providers', () => {
  describe('LocalStorageProvider', () => {
    it('generates local upload and file URLs', async () => {
      const provider = new LocalStorageProvider();
      const result = await provider.getPresignedUploadUrl('listings/item1.jpg', 'image/jpeg', 300);

      assert.equal(result.method, 'PUT');
      assert.equal(result.expiresIn, 300);
      assert.ok(result.uploadUrl.includes('/api/v1/uploads/local/listings/item1.jpg'));
      assert.ok(result.fileUrl.endsWith('/listings/item1.jpg'));
    });

    it('deleteFile completes gracefully', async () => {
      const provider = new LocalStorageProvider();
      await assert.doesNotReject(async () => {
        await provider.deleteFile('listings/item1.jpg');
      });
    });

    it('saves file buffer directly and returns file URL', async () => {
      const provider = new LocalStorageProvider();
      const buffer = Buffer.from('test-image-content');
      const fileUrl = await provider.uploadFile('test/direct-upload.jpg', buffer, 'image/jpeg');
      assert.ok(fileUrl.includes('test/direct-upload.jpg'));
    });

    it('retrieves saved file stream with getFile and returns null for non-existent', async () => {
      const provider = new LocalStorageProvider();
      const buffer = Buffer.from('stream-test-content');
      await provider.uploadFile('test/stream-test.jpg', buffer, 'image/jpeg');

      const fileResult = await provider.getFile('test/stream-test.jpg');
      assert.ok(fileResult);
      assert.ok(fileResult.body);

      const notFound = await provider.getFile('test/does-not-exist.jpg');
      assert.equal(notFound, null);
    });
  });

  describe('R2StorageProvider', () => {
    it('throws when missing accountId and endpoint', () => {
      assert.throws(
        () => {
          new R2StorageProvider({
            accountId: '',
            endpoint: '',
            accessKeyId: 'test-key',
            secretAccessKey: 'test-secret',
          });
        },
        /Cloudflare R2 configuration error/
      );
    });

    it('throws when missing accessKeyId or secretAccessKey', () => {
      assert.throws(
        () => {
          new R2StorageProvider({
            accountId: 'test-account-id',
            accessKeyId: '',
            secretAccessKey: '',
          });
        },
        /Cloudflare R2 configuration error/
      );
    });

    it('correctly generates presigned upload url and formats fileUrl with publicUrl', async () => {
      const provider = new R2StorageProvider({
        accountId: 'testaccountid123',
        accessKeyId: 'testaccesskey456',
        secretAccessKey: 'testsecretkey78901234567890123456789012',
        bucketName: 'test-bucket',
        publicUrl: 'https://pub-xyz.r2.dev/',
      });

      const result = await provider.getPresignedUploadUrl('/test-dir/sample.png', 'image/png', 600);

      assert.equal(result.method, 'PUT');
      assert.equal(result.expiresIn, 600);
      // Public URL should strip trailing slash and leading slash on key
      assert.equal(result.fileUrl, 'https://pub-xyz.r2.dev/test-dir/sample.png');
      // Presigned upload URL should point to R2 endpoint with signature params
      assert.ok(result.uploadUrl.startsWith('https://testaccountid123.r2.cloudflarestorage.com/test-bucket/test-dir/sample.png'));
      assert.ok(result.uploadUrl.includes('X-Amz-Signature='));
    });

    it('falls back to r2.cloudflarestorage.com when publicUrl is omitted', async () => {
      const provider = new R2StorageProvider({
        accountId: 'myacc123',
        accessKeyId: 'testaccesskey456',
        secretAccessKey: 'testsecretkey78901234567890123456789012',
        bucketName: 'media-bucket',
        publicUrl: '',
      });

      const result = await provider.getPresignedUploadUrl('uploads/doc.pdf', 'application/pdf');

      assert.equal(result.fileUrl, 'https://myacc123.r2.cloudflarestorage.com/media-bucket/uploads/doc.pdf');
    });

    it('deletes file with clean key', async () => {
      let sentCommand: any = null;
      const client = new S3Client({
        region: 'auto',
        endpoint: 'https://myacc123.r2.cloudflarestorage.com',
        credentials: {
          accessKeyId: 'testaccesskey456',
          secretAccessKey: 'testsecretkey78901234567890123456789012',
        },
      });
      client.send = async (cmd: any) => {
        sentCommand = cmd;
        return {} as any;
      };

      const provider = new R2StorageProvider({
        accountId: 'myacc123',
        accessKeyId: 'testaccesskey456',
        secretAccessKey: 'testsecretkey78901234567890123456789012',
        bucketName: 'media-bucket',
        client,
      });

      await provider.deleteFile('/folder/file.jpg');
      assert.ok(sentCommand);
      assert.equal(sentCommand.input.Key, 'folder/file.jpg');
      assert.equal(sentCommand.input.Bucket, 'media-bucket');
    });

    it('uploads file buffer directly with PutObjectCommand and returns file URL', async () => {
      let sentCommand: any = null;
      const client = new S3Client({
        region: 'auto',
        endpoint: 'https://myacc123.r2.cloudflarestorage.com',
        credentials: {
          accessKeyId: 'testaccesskey456',
          secretAccessKey: 'testsecretkey78901234567890123456789012',
        },
      });
      client.send = async (cmd: any) => {
        sentCommand = cmd;
        return {} as any;
      };

      const provider = new R2StorageProvider({
        accountId: 'myacc123',
        accessKeyId: 'testaccesskey456',
        secretAccessKey: 'testsecretkey78901234567890123456789012',
        bucketName: 'media-bucket',
        publicUrl: 'https://media.unimarket.com',
        client,
      });

      const buffer = Buffer.from('binary-image-data');
      const fileUrl = await provider.uploadFile('avatar/user1/pic.jpg', buffer, 'image/jpeg');

      assert.ok(sentCommand);
      assert.equal(sentCommand.input.Bucket, 'media-bucket');
      assert.equal(sentCommand.input.Key, 'avatar/user1/pic.jpg');
      assert.equal(sentCommand.input.ContentType, 'image/jpeg');
      assert.equal(fileUrl, 'https://media.unimarket.com/avatar/user1/pic.jpg');
    });

    it('retrieves file stream with getFile and handles 404 gracefully', async () => {
      let sentCommand: any = null;
      let shouldThrow404 = false;
      const client = new S3Client({
        region: 'auto',
        endpoint: 'https://myacc123.r2.cloudflarestorage.com',
        credentials: {
          accessKeyId: 'testaccesskey456',
          secretAccessKey: 'testsecretkey78901234567890123456789012',
        },
      });
      client.send = async (cmd: any) => {
        sentCommand = cmd;
        if (shouldThrow404) {
          const err: any = new Error('Not found');
          err.name = 'NoSuchKey';
          err.$metadata = { httpStatusCode: 404 };
          throw err;
        }
        return {
          Body: 'fake-stream',
          ContentType: 'image/jpeg',
          ContentLength: 100,
        } as any;
      };

      const provider = new R2StorageProvider({
        accountId: 'myacc123',
        accessKeyId: 'testaccesskey456',
        secretAccessKey: 'testsecretkey78901234567890123456789012',
        bucketName: 'media-bucket',
        client,
      });

      const result = await provider.getFile('avatar/user1/pic.jpg');
      assert.ok(result);
      assert.equal(result.contentType, 'image/jpeg');
      assert.equal(sentCommand.input.Key, 'avatar/user1/pic.jpg');

      shouldThrow404 = true;
      const nullResult = await provider.getFile('missing.jpg');
      assert.equal(nullResult, null);
    });
  });

  describe('Storage Factory', () => {
    it('returns LocalStorageProvider when STORAGE_PROVIDER is local', () => {
      (config.storage as any).provider = 'local';
      const provider = getStorageProvider();
      assert.ok(provider instanceof LocalStorageProvider);
    });

    it('returns R2StorageProvider when STORAGE_PROVIDER is r2', () => {
      const origProvider = (config.storage as any).provider;
      const origAccountId = (config.storage.r2 as any).accountId;
      const origAccessKey = (config.storage.r2 as any).accessKeyId;
      const origSecretKey = (config.storage.r2 as any).secretAccessKey;

      try {
        (config.storage as any).provider = 'r2';
        (config.storage.r2 as any).accountId = 'acc123';
        (config.storage.r2 as any).accessKeyId = 'key123';
        (config.storage.r2 as any).secretAccessKey = 'secret12345678901234567890123456';

        const provider = getStorageProvider();
        assert.ok(provider instanceof R2StorageProvider);
      } finally {
        (config.storage as any).provider = origProvider;
        (config.storage.r2 as any).accountId = origAccountId;
        (config.storage.r2 as any).accessKeyId = origAccessKey;
        (config.storage.r2 as any).secretAccessKey = origSecretKey;
      }
    });
  });
});
