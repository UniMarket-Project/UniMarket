import { Router } from "express";
import { UsersController } from "./users.controller.js";
import { authenticate } from "../../platform/middleware/authenticate.middleware.js";
import { optionalAuth } from "../../platform/middleware/optional-auth.middleware.js";
import { validate } from "../../platform/middleware/validate.middleware.js";
import { asyncHandler } from "../../platform/http/async-handler.js";
import {
  updateProfileSchema,
  userListingsQuerySchema,
} from "@unimarket/shared";

export const usersRouter = Router();

// Authenticated routes
usersRouter.get("/me", authenticate, asyncHandler(UsersController.getMe));
usersRouter.patch(
  "/me",
  authenticate,
  validate({ body: updateProfileSchema }),
  asyncHandler(UsersController.updateMe),
);

// Public routes
usersRouter.get("/:userId", asyncHandler(UsersController.getPublicProfile));
usersRouter.get(
  "/:userId/listings",
  optionalAuth,
  validate({ query: userListingsQuerySchema }),
  asyncHandler(UsersController.getUserListings),
);
