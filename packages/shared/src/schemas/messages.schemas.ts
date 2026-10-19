import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import { paginationQuerySchema, uuidSchema } from "./common.schemas.js";

export const sendMessageSchema = z
  .object({
    recipientId: uuidSchema,
    content: z.string().trim().min(1).max(LIMITS.MESSAGE_MAX_LENGTH),
    listingId: uuidSchema.optional(),
    requestId: uuidSchema.optional(),
    transactionId: uuidSchema.optional(),
  })
  .refine(
    (data) => {
      const contexts = [
        data.listingId,
        data.requestId,
        data.transactionId,
      ].filter(Boolean);
      return contexts.length <= 1;
    },
    {
      message:
        "At most one context ID (listingId, requestId, or transactionId) is allowed",
      path: ["listingId"],
    },
  );

export const conversationThreadQuerySchema = paginationQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  after: z.string().datetime().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ConversationThreadQueryInput = z.infer<
  typeof conversationThreadQuerySchema
>;
