import { z } from "zod";
import { REGEX } from "../constants/regex.js";

export const submitStudentVerificationSchema = z.object({
  studentId: z
    .string()
    .trim()
    .min(4)
    .max(30)
    .regex(REGEX.STUDENT_ID, { message: "Invalid Student ID format" }),
  universityCode: z.string().trim().min(2).max(20),
  documentUrl: z.string().url().optional(),
});

export const submitProviderVerificationSchema = z.object({
  nationalId: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(REGEX.NATIONAL_ID, { message: "Invalid National ID format" }),
  businessName: z.string().trim().min(2).max(100),
  businessCategory: z.string().trim().min(2).max(100),
  documentUrl: z.string().url().optional(),
});

export type SubmitStudentVerificationInput = z.infer<
  typeof submitStudentVerificationSchema
>;
export type SubmitProviderVerificationInput = z.infer<
  typeof submitProviderVerificationSchema
>;
