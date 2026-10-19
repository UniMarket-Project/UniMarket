import { Router } from 'express';
import { UploadsController } from './uploads.controller.js';
import { authenticate } from '../../platform/middleware/authenticate.middleware.js';
import { validate } from '../../platform/middleware/validate.middleware.js';
import { asyncHandler } from '../../platform/http/async-handler.js';
import { presignUploadSchema } from '@unimarket/shared';

export const uploadsRouter = Router();

uploadsRouter.post(
  '/presign',
  authenticate,
  validate({ body: presignUploadSchema }),
  asyncHandler(UploadsController.getPresignedUpload)
);

// Local dev upload direct handler
uploadsRouter.put('/local/:key(*)', asyncHandler(UploadsController.handleLocalUpload));
