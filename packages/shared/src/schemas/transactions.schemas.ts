import { z } from 'zod';
import { TransactionStatus } from '../enums';

export const transactionObjectSchema = z.object({
  id: z.string(),
  listingId: z.string().optional(),
  requestId: z.string().optional(),
  buyerId: z.string(),
  sellerId: z.string(),
  title: z.string().min(1),
  transactionType: z.enum(['sell', 'rent', 'lend', 'exchange', 'service', 'food', 'transport']),
  status: z.nativeEnum(TransactionStatus),
  amount: z.object({ amount: z.number(), currency: z.string().length(3).toUpperCase() }),
  quantity: z.number().int().positive().default(1),
  buyerConfirmed: z.boolean().default(false),
  sellerConfirmed: z.boolean().default(false),
  buyerConfirmedAt: z.string().datetime().optional(),
  sellerConfirmedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export const transactionCreationSchema = z.object({
  listingId: z.string().optional(),
  requestId: z.string().optional(),
  buyerId: z.string(),
  sellerId: z.string(),
  title: z.string().min(1),
  transactionType: z.enum(['sell', 'rent', 'lend', 'exchange', 'service', 'food', 'transport']),
});