import { Router } from "express";
import { RatingsController } from "./ratings.controller.js";
import { authenticate } from "../../platform/middleware/authenticate.middleware.js";
import { validate } from "../../platform/middleware/validate.middleware.js";
import { asyncHandler } from "../../platform/http/async-handler.js";
import { createRatingSchema, userRatingsQuerySchema } from "@unimarket/shared";

export const ratingsRouter = Router();

// Submit rating (authenticated)
ratingsRouter.post(
  "/",
  authenticate,
  validate({ body: createRatingSchema }),
  asyncHandler(RatingsController.createRating),
);

// Get user ratings (public)
ratingsRouter.get(
  "/users/:userId",
  validate({ query: userRatingsQuerySchema }),
  asyncHandler(RatingsController.getUserRatings),
);
