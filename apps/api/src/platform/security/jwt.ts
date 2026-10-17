import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { Role, UserType, VerificationStatus } from '@unimarket/shared';

export interface JwtAccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  userType: UserType;
  verificationStatus: VerificationStatus;
}

export function signAccessToken(payload: JwtAccessTokenPayload): { accessToken: string; expiresIn: number } {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
  };
  const token = jwt.sign(payload, config.jwt.accessSecret, options);
  // Default to 3600 seconds (1 hour)
  return { accessToken: token, expiresIn: 3600 };
}

export function verifyAccessToken(token: string): JwtAccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret, {
    algorithms: ['HS256'],
  }) as JwtAccessTokenPayload;
}
