import { Router } from "express";
import { VerificationController } from "./verification.controller.js";
import { authenticate } from "../../platform/middleware/authenticate.middleware.js";
import { validate } from "../../platform/middleware/validate.middleware.js";
import { asyncHandler } from "../../platform/http/async-handler.js";
import {
  submitStudentVerificationSchema,
  submitProviderVerificationSchema,
} from "@unimarket/shared";

export const verificationRouter = Router();

verificationRouter.use(authenticate);

verificationRouter.post(
  "/student/submit",
  validate({ body: submitStudentVerificationSchema }),
  asyncHandler(VerificationController.submitStudent),
);

verificationRouter.post(
  "/provider/submit",
  validate({ body: submitProviderVerificationSchema }),
  asyncHandler(VerificationController.submitProvider),
);

verificationRouter.get(
  "/status",
  asyncHandler(VerificationController.getStatus),
);
