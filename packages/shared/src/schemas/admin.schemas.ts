import { z } from "zod";
import { VerificationStatus } from "../enums/user.enums.js";
import { paginationQuerySchema } from "./common.schemas.js";

export const reviewVerificationSchema = z
  .object({
    status: z.enum([
      VerificationStatus.VERIFIED,
      VerificationStatus.UNVERIFIED,
    ]), // 'verified' (approved) or 'unverified' (rejected)
    rejectionReason: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => {
      if (
        data.status === VerificationStatus.UNVERIFIED &&
        !data.rejectionReason
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Rejection reason is required when rejecting a verification",
      path: ["rejectionReason"],
    },
  );

export const adminVerificationsQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(VerificationStatus).default(VerificationStatus.PENDING),
});

export const suspendUserSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, { message: "Suspension reason is required" })
    .max(500),
  suspensionDays: z.number().int().min(1).optional(),
});

export const unsuspendUserSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const adminUsersQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type ReviewVerificationInput = z.infer<typeof reviewVerificationSchema>;
export type AdminVerificationsQueryInput = z.infer<
  typeof adminVerificationsQuerySchema
>;
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type UnsuspendUserInput = z.infer<typeof unsuspendUserSchema>;
export type AdminUsersQueryInput = z.infer<typeof adminUsersQuerySchema>;
