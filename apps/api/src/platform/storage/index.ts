import { config } from '../config/index.js';
import type { IStorageProvider } from './storage.interface.js';
import { LocalStorageProvider } from './local.storage.js';
import { S3StorageProvider } from './s3.storage.js';

export function getStorageProvider(): IStorageProvider {
  if (config.storage.provider === 's3' && config.storage.bucket) {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}

export const storage = getStorageProvider();
export * from './storage.interface.js';
