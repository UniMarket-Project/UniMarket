import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import { paginationQuerySchema, uuidSchema } from "./common.schemas.js";

export const createRatingSchema = z.object({
  transactionId: uuidSchema,
  rating: z
    .number()
    .int()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating cannot exceed 5" }),
  comment: z.string().trim().max(LIMITS.REVIEW_COMMENT_MAX_LENGTH).optional(),
});

export const userRatingsQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(["newest", "highest", "lowest"]).default("newest"),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
export type UserRatingsQueryInput = z.infer<typeof userRatingsQuerySchema>;
