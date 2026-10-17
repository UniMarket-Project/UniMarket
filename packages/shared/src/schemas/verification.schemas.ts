import { z } from 'zod';
import { VerificationStatus } from '../enums';

export const verificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['student_id', 'business_license', 'passport', 'other']),
  idNumberEncrypted: z.string(),
  idNumberHash: z.string().length(64),
  universityCode: z.string().optional(),
  businessName: z.string().optional(),
  businessCategory: z.string().optional(),
  documentUrl: z.string().url().optional(),
  status: z.nativeEnum(VerificationStatus),
  rejectionReason: z.string().optional(),
  submittedAt: z.string().datetime(),
  verifiedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const verificationCreationSchema = z.object({
  userId: z.string(),
  type: z.enum(['student_id', 'business_license', 'passport', 'other']),
  idNumberEncrypted: z.string(),
  idNumberHash: z.string().length(64),
  universityCode: z.string().optional(),
  businessName: z.string().optional(),
  businessCategory: z.string().optional(),
});