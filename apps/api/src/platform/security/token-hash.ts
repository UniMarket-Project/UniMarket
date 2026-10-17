import crypto from 'crypto';

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateOpaqueToken(bytes = 40): string {
  return crypto.randomBytes(bytes).toString('hex');
}
