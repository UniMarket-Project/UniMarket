import { env } from './env.js';

export const config = {
  app: {
    port: env.PORT,
    env: env.NODE_ENV,
    isDev: env.NODE_ENV === 'development',
    isProd: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  db: {
    url: env.DATABASE_URL,
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  security: {
    corsOrigin: env.CORS_ORIGIN,
    cookieDomain: env.COOKIE_DOMAIN,
    encryptionKey: env.ENCRYPTION_KEY,
    hmacSecret: env.HMAC_SECRET,
  },
  storage: {
    provider: env.STORAGE_PROVIDER,
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    bucket: env.S3_BUCKET,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
    publicUrl: env.S3_PUBLIC_URL,
  },
} as const;

export * from './env.js';
