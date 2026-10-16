import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  content: z.string().min(1),
  listingId: z.string().optional(),
  requestId: z.string().optional(),
  transactionId: z.string().optional(),
  isRead: z.boolean().default(false),
  readAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export const messageCreationSchema = z.object({
  senderId: z.string(),
  recipientId: z.string(),
  content: z.string().min(1),
  listingId: z.string().optional(),
  requestId: z.string().optional(),
  transactionId: z.string().optional(),
});