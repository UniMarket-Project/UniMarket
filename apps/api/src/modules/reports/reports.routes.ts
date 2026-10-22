import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { authenticate } from '../../platform/middleware/authenticate.middleware.js';
import { validate } from '../../platform/middleware/validate.middleware.js';
import { reportsRateLimiter } from '../../platform/middleware/rate-limit.middleware.js';
import { asyncHandler } from '../../platform/http/async-handler.js';
import { createReportSchema } from '@unimarket/shared';

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.post(
  '/',
  reportsRateLimiter,
  validate({ body: createReportSchema }),
  asyncHandler(ReportsController.createReport)
);
