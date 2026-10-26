import dotenv from 'dotenv';
import { z } from 'zod';
import { sanitizeDatabaseUrl } from '../database/db-url-sanitizer.js';

dotenv.config();

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = sanitizeDatabaseUrl(process.env.DATABASE_URL) || process.env.DATABASE_URL;
}
if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = sanitizeDatabaseUrl(process.env.DIRECT_URL) || process.env.DIRECT_URL;
}

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  CORS_ORIGIN: z
    .string()
    .default(process.env.FRONTEND_URL || "http://localhost:5173"),
  COOKIE_DOMAIN: z.string().optional(),
  
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
  HMAC_SECRET: z.string().min(16, 'HMAC_SECRET must be at least 16 characters'),
  
  STORAGE_PROVIDER: z.enum(['local', 'r2']).default('local'),

  // Cloudflare R2 Storage
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('unimarket-media'),
  R2_PUBLIC_URL: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
