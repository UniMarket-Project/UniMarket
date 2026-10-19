import { z } from "zod";
import { paginationQuerySchema } from "./common.schemas.js";

export const notificationsQuerySchema = paginationQuerySchema.extend({
  unreadOnly: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type NotificationsQueryInput = z.infer<typeof notificationsQuerySchema>;
