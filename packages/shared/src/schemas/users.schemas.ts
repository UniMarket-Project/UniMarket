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
