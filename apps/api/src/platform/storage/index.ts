import { config } from '../config/index.js';
import type { IStorageProvider } from './storage.interface.js';
import { LocalStorageProvider } from './local.storage.js';
import { R2StorageProvider } from './r2.storage.js';

export function getStorageProvider(): IStorageProvider {
  if (config.storage.provider === 'r2') {
    return new R2StorageProvider();
  }
  return new LocalStorageProvider();
}

export const storage = getStorageProvider();
export * from './storage.interface.js';
export * from './local.storage.js';
export * from './r2.storage.js';
