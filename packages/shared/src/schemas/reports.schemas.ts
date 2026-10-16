import { z } from 'zod';

export const reportSchema = z.object({
  id: z.string(),
  reporterId: z.string(),
  reportType: z.enum(['user', 'listing', 'transaction']),
  targetId: z.string(),
  category: z.enum(['fraud', 'harassment', 'counterfeit', 'spam', 'prohibited_item', 'other']),
  description: z.string().min(1),
  status: z.enum(['submitted', 'under_review', 'resolved', 'dismissed']),
  action: z.string().optional(),
  adminNotes: z.string().optional(),
  resolvedAt: z.string().datetime().optional(),
});

export const reportCreationSchema = z.object({
  reporterId: z.string(),
  reportType: z.enum(['user', 'listing', 'transaction']),
  targetId: z.string(),
  category: z.enum(['fraud', 'harassment', 'counterfeit', 'spam', 'prohibited_item', 'other']),
  description: z.string().min(1),
});