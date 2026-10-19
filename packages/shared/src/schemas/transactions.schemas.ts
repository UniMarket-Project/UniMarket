import { z } from "zod";
import {
  PaymentMethod,
  TransactionStatus,
} from "../enums/transaction.enums.js";
import { paginationQuerySchema, uuidSchema } from "./common.schemas.js";

export const createTransactionSchema = z
  .object({
    listingId: uuidSchema.optional(),
    requestId: uuidSchema.optional(),
    buyerId: uuidSchema.optional(), // required if requestId
    quantity: z.number().int().min(1).default(1),
    amount: z.number().min(0),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
    rentalStartDate: z.string().nullable().optional(),
    rentalEndDate: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).default({}),
    notes: z.string().trim().max(500).nullable().optional(),
  })
  .refine((data) => (data.listingId ? !data.requestId : !!data.requestId), {
    message: "Provide exactly one of listingId or requestId",
    path: ["listingId"],
  })
  .refine((data) => (!data.requestId ? true : !!data.buyerId), {
    message: "buyerId is required when initiating a deal from a request",
    path: ["buyerId"],
  })
  .refine(
    (data) => {
      if (data.rentalStartDate && data.rentalEndDate) {
        return new Date(data.rentalEndDate) >= new Date(data.rentalStartDate);
      }
      return true;
    },
    {
      message: "Rental end date must be on or after rental start date",
      path: ["rentalEndDate"],
    },
  );

export const declineTransactionSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const confirmTransactionSchema = z.object({
  confirmed: z.literal(true, {
    errorMap: () => ({ message: "confirmed must be true" }),
  }),
});

export const cancelTransactionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, { message: "Cancellation reason must be at least 5 characters" })
    .max(500, { message: "Cancellation reason cannot exceed 500 characters" }),
});

export const transactionsQuerySchema = paginationQuerySchema.extend({
  role: z.enum(["buyer", "seller"]).optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type DeclineTransactionInput = z.infer<typeof declineTransactionSchema>;
export type ConfirmTransactionInput = z.infer<typeof confirmTransactionSchema>;
export type CancelTransactionInput = z.infer<typeof cancelTransactionSchema>;
export type TransactionsQueryInput = z.infer<typeof transactionsQuerySchema>;
