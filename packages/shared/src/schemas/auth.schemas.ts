import { z } from "zod";
import { REGEX } from "../constants/regex.js";
import { UserType } from "../enums/user.enums.js";
import { ethiopianPhoneSchema } from "./common.schemas.js";

export const registerSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  phone: ethiopianPhoneSchema,
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(REGEX.PASSWORD, {
      message:
        "Password must contain at least 1 uppercase letter, 1 number, and 1 special character",
    }),
  firstName: z
    .string()
    .trim()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(100),
  lastName: z
    .string()
    .trim()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(100),
  userType: z.nativeEnum(UserType, {
    errorMap: () => ({ message: "Invalid user type" }),
  }),
  universityCode: z.string().min(2).max(20).optional().default('AAU'),
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
