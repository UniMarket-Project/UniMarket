import { z } from "zod";
import { PaymentMethod } from "../enums/transaction.enums.js";
import { uuidSchema } from "./common.schemas.js";

export const recordOfflinePaymentSchema = z.object({
  transactionId: uuidSchema,
  method: z.nativeEnum(PaymentMethod),
  notes: z.string().trim().max(500).optional(),
});

export type RecordOfflinePaymentInput = z.infer<
  typeof recordOfflinePaymentSchema
>;
