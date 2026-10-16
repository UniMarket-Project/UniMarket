import { z } from 'zod';

export const ratingReviewSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  reviewerId: z.string(),
  revieweeId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const ratingCreationSchema = z.object({
  transactionId: z.string(),
  revieweeId: z.string(),
  rating: z.number().int().min(1).max(5),
});