import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../../platform/middleware/validate.middleware.js";
import { asyncHandler } from "../../platform/http/async-handler.js";
import { authRateLimiter } from "../../platform/middleware/rate-limit.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "@unimarket/shared";

export const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(AuthController.register),
);

authRouter.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(AuthController.login),
);

authRouter.post(
  "/refresh",
  validate({ body: refreshTokenSchema }),
  asyncHandler(AuthController.refresh),
);

authRouter.post("/logout", asyncHandler(AuthController.logout));
