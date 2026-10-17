import { z } from 'zod';

export const paymentSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  method: z.enum(['cash', 'transfer', 'other']),
  status: z.enum(['recorded', 'pending', 'processing', 'completed', 'failed', 'refunded']),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const paymentCreationSchema = z.object({
  transactionId: z.string(),
  method: z.enum(['cash', 'transfer', 'other']),
});