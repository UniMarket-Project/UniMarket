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
    r2: {
      accountId: env.R2_ACCOUNT_ID,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      bucketName: env.R2_BUCKET_NAME,
      publicUrl: env.R2_PUBLIC_URL,
      endpoint: env.R2_ENDPOINT,
    },
    publicUrl: env.R2_PUBLIC_URL || `http://localhost:${env.PORT}/uploads`,
  },
} as const;

export * from './env.js';
