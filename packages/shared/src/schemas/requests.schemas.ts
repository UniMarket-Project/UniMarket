import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import { RequestStatus, RequestType } from "../enums/request.enums.js";
import { locationSchema, paginationQuerySchema } from "./common.schemas.js";

export const createRequestSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(LIMITS.TITLE_MIN_LENGTH)
      .max(LIMITS.TITLE_MAX_LENGTH),
    description: z
      .string()
      .trim()
      .min(LIMITS.DESCRIPTION_MIN_LENGTH)
      .max(LIMITS.DESCRIPTION_MAX_LENGTH),
    category: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .transform((val) => val.toLowerCase()),
    type: z.nativeEnum(RequestType),
    budgetMin: z.number().min(0).nullable().optional(),
    budgetMax: z.number().min(0).nullable().optional(),
    exchangeHave: z.string().trim().max(1000).nullable().optional(),
    exchangeWant: z.string().trim().max(1000).nullable().optional(),
    location: locationSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      if (
        data.budgetMin !== null &&
        data.budgetMin !== undefined &&
        data.budgetMax !== null &&
        data.budgetMax !== undefined
      ) {
        return data.budgetMin <= data.budgetMax;
      }
      return true;
    },
    {
      message: "budgetMin cannot be greater than budgetMax",
      path: ["budgetMin"],
    },
  )
  .refine(
    (data) => {
      if (data.type === RequestType.EXCHANGE) {
        return !!data.exchangeHave && !!data.exchangeWant;
      }
      return true;
    },
    {
      message:
        "Both exchangeHave and exchangeWant are required for exchange requests",
      path: ["exchangeHave"],
    },
  );

export const updateRequestSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(LIMITS.TITLE_MIN_LENGTH)
      .max(LIMITS.TITLE_MAX_LENGTH)
      .optional(),
    description: z
      .string()
      .trim()
      .min(LIMITS.DESCRIPTION_MIN_LENGTH)
      .max(LIMITS.DESCRIPTION_MAX_LENGTH)
      .optional(),
    category: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .transform((val) => val.toLowerCase())
      .optional(),
    type: z.nativeEnum(RequestType).optional(),
    status: z.nativeEnum(RequestStatus).optional(),
    budgetMin: z.number().min(0).nullable().optional(),
    budgetMax: z.number().min(0).nullable().optional(),
    exchangeHave: z.string().trim().max(1000).nullable().optional(),
    exchangeWant: z.string().trim().max(1000).nullable().optional(),
    location: locationSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      if (
        data.budgetMin !== null &&
        data.budgetMin !== undefined &&
        data.budgetMax !== null &&
        data.budgetMax !== undefined
      ) {
        return data.budgetMin <= data.budgetMax;
      }
      return true;
    },
    {
      message: "budgetMin cannot be greater than budgetMax",
      path: ["budgetMin"],
    },
  );

export const requestsQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  type: z.nativeEnum(RequestType).optional(),
  status: z.nativeEnum(RequestStatus).default(RequestStatus.OPEN),
  mine: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type RequestsQueryInput = z.infer<typeof requestsQuerySchema>;
