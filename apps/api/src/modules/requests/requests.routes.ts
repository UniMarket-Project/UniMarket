import { Router } from 'express';
import { RequestsController } from './requests.controller.js';
import { authenticate } from '../../platform/middleware/authenticate.middleware.js';
import { optionalAuth } from '../../platform/middleware/optional-auth.middleware.js';
import { requireVerified } from '../../platform/middleware/require-verified.middleware.js';
import { validate } from '../../platform/middleware/validate.middleware.js';
import { asyncHandler } from '../../platform/http/async-handler.js';
import { createRequestSchema, updateRequestSchema, requestsQuerySchema } from '@unimarket/shared';

export const requestsRouter = Router();

// Public browse & view
requestsRouter.get(
  '/',
  optionalAuth,
  validate({ query: requestsQuerySchema }),
  asyncHandler(RequestsController.getRequests)
);

requestsRouter.get('/:id', asyncHandler(RequestsController.getRequestById));

// Verified creator operations
requestsRouter.post(
  '/',
  authenticate,
  requireVerified,
  validate({ body: createRequestSchema }),
  asyncHandler(RequestsController.createRequest)
);

requestsRouter.patch(
  '/:id',
  authenticate,
  validate({ body: updateRequestSchema }),
  asyncHandler(RequestsController.updateRequest)
);
