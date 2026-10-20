import { Router } from 'express';
import { ListingsController } from './listings.controller.js';
import { authenticate } from '../../platform/middleware/authenticate.middleware.js';
import { optionalAuth } from '../../platform/middleware/optional-auth.middleware.js';
import { requireVerified } from '../../platform/middleware/require-verified.middleware.js';
import { validate } from '../../platform/middleware/validate.middleware.js';
import { asyncHandler } from '../../platform/http/async-handler.js';
import { createListingSchema, updateListingSchema, listingsQuerySchema } from '@unimarket/shared';

export const listingsRouter = Router();

// Public browse & view
listingsRouter.get(
  '/',
  validate({ query: listingsQuerySchema }),
  asyncHandler(ListingsController.getListings)
);

listingsRouter.get('/:id', optionalAuth, asyncHandler(ListingsController.getListingById));

// Verified seller operations
listingsRouter.post(
  '/',
  authenticate,
  requireVerified,
  validate({ body: createListingSchema }),
  asyncHandler(ListingsController.createListing)
);

listingsRouter.patch(
  '/:id',
  authenticate,
  validate({ body: updateListingSchema }),
  asyncHandler(ListingsController.updateListing)
);

listingsRouter.delete('/:id', authenticate, asyncHandler(ListingsController.deleteListing));
