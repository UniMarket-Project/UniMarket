import { Router, raw } from 'express';
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

// Direct file upload to storage (R2 / Local) bypassing browser CORS restrictions
uploadsRouter.post(
  '/direct',
  authenticate,
  raw({ type: '*/*', limit: '10mb' }),
  asyncHandler(UploadsController.handleDirectUpload)
);

// Local dev upload direct handler
uploadsRouter.put(
  '/local/:key(*)',
  raw({ type: '*/*', limit: '10mb' }),
  asyncHandler(UploadsController.handleLocalUpload)
);

// Public file serving route (R2 streaming proxy / local fallback)
uploadsRouter.get(
  '/file/:key(*)',
  asyncHandler(UploadsController.handleServeFile)
);
