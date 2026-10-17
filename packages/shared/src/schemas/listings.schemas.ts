import { z } from 'zod';
import { ListingType } from '../enums';

export const listingSummarySchema = z.object({
  id: z.string(),
  createdById: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  transactionType: z.nativeEnum(ListingType),
  price: z.object({ amount: z.number(), currency: z.string().length(3).toUpperCase() }).optional(),
  quantityAvailable: z.number().int().positive().default(1),
  images: z.array(z.string().url()).max(5),
  availabilityStatus: z.enum(['active', 'hidden', 'removed']),
  createdAt: z.string().datetime(),
});

export const listingCreationSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  transactionType: z.nativeEnum(ListingType),
  price: z.object({ amount: z.number(), currency: z.string().length(3).toUpperCase() }).optional(),
  quantityAvailable: z.number().int().positive().default(1),
  images: z.array(z.string().url()).max(5),
  category: z.string().optional(),
});