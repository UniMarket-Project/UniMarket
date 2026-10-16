import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const uuidSchema = z.string();

// Use uuidSchema where UUID validation is needed: uuidSchema.refine(s => /^[0-9a-f-]{36}$/.test(s))

export const moneySchema = z.object({
  amount: z.number().min(0),
  currency: z.string().length(3).toUpperCase(),
});

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});