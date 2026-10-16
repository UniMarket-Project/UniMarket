import { z } from 'zod';
import { RequestType } from '../enums';

export const requestSummarySchema = z.object({
  id: z.string(),
  createdById: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(RequestType),
  status: z.enum(['open', 'matched', 'closed']),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  exchangeHave: z.string().optional(),
  exchangeWant: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const requestCreationSchema = z.object({
  createdById: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(RequestType),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  exchangeHave: z.string().optional(),
  exchangeWant: z.string().optional(),
});