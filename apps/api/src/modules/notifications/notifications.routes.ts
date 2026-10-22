import { Router } from "express";
import { NotificationsController } from "./notifications.controller.js";
import { authenticate } from "../../platform/middleware/authenticate.middleware.js";
import { validate } from "../../platform/middleware/validate.middleware.js";
import { asyncHandler } from "../../platform/http/async-handler.js";
import { notificationsQuerySchema } from "@unimarket/shared";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get(
  "/",
  validate({ query: notificationsQuerySchema }),
  asyncHandler(NotificationsController.getNotifications),
);

notificationsRouter.patch(
  "/:id/read",
  asyncHandler(NotificationsController.markAsRead),
);
notificationsRouter.post(
  "/read-all",
  asyncHandler(NotificationsController.markAllAsRead),
);
