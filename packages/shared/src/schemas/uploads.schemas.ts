import { z } from 'zod';

export const uploadSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  filename: z.string(),
  size: z.number().int().positive(),
  mimeType: z.string().regex(/^image\//),
  createdAt: z.string().datetime(),
});

export const uploadCreationSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  size: z.number().int().positive(),
  mimeType: z.string().regex(/^image\//),
});