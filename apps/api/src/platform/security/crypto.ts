import crypto from 'crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  return Buffer.from(config.security.encryptionKey.slice(0, 64), 'hex');
}

export function encryptIdNumber(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combined format: iv:authTag:encrypted (base64)
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decryptIdNumber(cipherText: string): string {
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted ID format');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const encrypted = Buffer.from(parts[2], 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

export function hashIdNumber(idNumber: string): string {
  return crypto.createHmac('sha256', config.security.hmacSecret).update(idNumber.trim().toUpperCase()).digest('hex');
}
