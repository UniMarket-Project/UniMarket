import { z } from 'zod';
import { UserType, Role, VerificationStatus } from '../enums';

export const userSummarySchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  userType: z.nativeEnum(UserType),
  role: z.nativeEnum(Role),
  isActive: z.boolean().default(true),
});

export const userProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  availabilityStatus: z.enum(['available', 'busy', 'unavailable']),
  averageRating: z.number().min(0).max(5).default(0),
  totalRatings: z.number().int().default(0),
  totalTransactions: z.number().int().default(0),
  totalReviews: z.number().int().default(0),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});