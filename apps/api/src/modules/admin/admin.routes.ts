import { Router } from "express";
import { AdminController } from "./admin.controller.js";
import { authenticate } from "../../platform/middleware/authenticate.middleware.js";
import { requireRole } from "../../platform/middleware/require-role.middleware.js";
import { validate } from "../../platform/middleware/validate.middleware.js";
import { asyncHandler } from "../../platform/http/async-handler.js";
import { Role } from "@unimarket/shared";
import {
  adminVerificationsQuerySchema,
  reviewVerificationSchema,
  adminReportsQuerySchema,
  resolveReportSchema,
  suspendUserSchema,
  unsuspendUserSchema,
  adminUsersQuerySchema,
} from "@unimarket/shared";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole(Role.ADMIN));

adminRouter.get("/stats", asyncHandler(AdminController.getStats));

// Verifications
adminRouter.get(
  "/verifications",
  validate({ query: adminVerificationsQuerySchema }),
  asyncHandler(AdminController.getVerifications),
);
adminRouter.patch(
  "/verifications/:id",
  validate({ body: reviewVerificationSchema }),
  asyncHandler(AdminController.reviewVerification),
);

// Reports
adminRouter.get(
  "/reports",
  validate({ query: adminReportsQuerySchema }),
  asyncHandler(AdminController.getReports),
);
adminRouter.patch(
  "/reports/:id",
  validate({ body: resolveReportSchema }),
  asyncHandler(AdminController.resolveReport),
);

// Users management
adminRouter.get(
  "/users",
  validate({ query: adminUsersQuerySchema }),
  asyncHandler(AdminController.listUsers),
);
adminRouter.post(
  "/users/:userId/suspend",
  validate({ body: suspendUserSchema }),
  asyncHandler(AdminController.suspendUser),
);
adminRouter.post(
  "/users/:userId/unsuspend",
  validate({ body: unsuspendUserSchema }),
  asyncHandler(AdminController.unsuspendUser),
);
