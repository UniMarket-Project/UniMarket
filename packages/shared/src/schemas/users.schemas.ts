import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import { AvailabilityStatus } from "../enums/user.enums.js";
import { locationSchema, paginationQuerySchema } from "./common.schemas.js";

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(100).optional(),
  lastName: z.string().trim().min(2).max(100).optional(),
  bio: z.string().trim().max(LIMITS.BIO_MAX_LENGTH).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  availabilityStatus: z.nativeEnum(AvailabilityStatus).optional(),
  location: locationSchema.nullable().optional(),
});

export const userListingsQuerySchema = paginationQuerySchema;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const submitProfileChangeRequestSchema = z.object({
  firstName: z.string().trim().min(2).max(100).optional(),
  lastName: z.string().trim().min(2).max(100).optional(),
  bio: z.string().trim().max(LIMITS.BIO_MAX_LENGTH).nullable().optional(),
  address: z.string().trim().max(255).optional(),
  reason: z.string().trim().min(5, "Please provide a reason (at least 5 characters)"),
  evidenceUrl: z.string().url("A valid evidence document or photo URL is required"),
});

export type SubmitProfileChangeRequestInput = z.infer<typeof submitProfileChangeRequestSchema>;

export const reviewProfileChangeRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().trim().optional(),
});

export type ReviewProfileChangeRequestInput = z.infer<typeof reviewProfileChangeRequestSchema>;
