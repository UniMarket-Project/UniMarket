import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import {
  ReportCategory,
  ReportStatus,
  ReportType,
} from "../enums/report.enums.js";
import { paginationQuerySchema, uuidSchema } from "./common.schemas.js";

export const createReportSchema = z.object({
  reportType: z.nativeEnum(ReportType),
  targetId: uuidSchema,
  category: z.nativeEnum(ReportCategory),
  description: z
    .string()
    .trim()
    .min(LIMITS.REPORT_DESCRIPTION_MIN_LENGTH, {
      message: `Report description must be at least ${LIMITS.REPORT_DESCRIPTION_MIN_LENGTH} characters`,
    })
    .max(LIMITS.REPORT_DESCRIPTION_MAX_LENGTH, {
      message: `Report description cannot exceed ${LIMITS.REPORT_DESCRIPTION_MAX_LENGTH} characters`,
    }),
});

export const adminReportsQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(ReportStatus).optional(),
  reportType: z.nativeEnum(ReportType).optional(),
  category: z.nativeEnum(ReportCategory).optional(),
});

export const resolveReportSchema = z.object({
  status: z.nativeEnum(ReportStatus),
  action: z
    .enum([
      "none",
      "remove_listing",
      "restore_listing",
      "warn_user",
      "suspend_user",
    ])
    .default("none"),
  adminNotes: z.string().trim().max(1000).optional(),
  suspensionDays: z.number().int().min(1).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type AdminReportsQueryInput = z.infer<typeof adminReportsQuerySchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
