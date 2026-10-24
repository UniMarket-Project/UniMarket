import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import { REGEX } from "../constants/regex.js";

export const uuidSchema = z.string().uuid({ message: "Must be a valid UUID" });

export const ethiopianPhoneSchema = z.string().regex(REGEX.PHONE_ET, {
  message: "Please enter a valid Ethiopian phone number starting with +251 (e.g. +251911223344)",
});

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  address: z.string().max(255).nullable().optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(LIMITS.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(LIMITS.MAX_PAGE_SIZE)
    .default(LIMITS.DEFAULT_PAGE_SIZE),
});

export type LocationInput = z.infer<typeof locationSchema>;
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
