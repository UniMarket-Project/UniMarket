import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticate } from '../../platform/middleware/authenticate.middleware.js';
import { validate } from '../../platform/middleware/validate.middleware.js';
import { asyncHandler } from '../../platform/http/async-handler.js';
import { recordOfflinePaymentSchema } from '@unimarket/shared';

export const paymentsRouter = Router();

paymentsRouter.use(authenticate);

paymentsRouter.post(
  '/record-offline',
  validate({ body: recordOfflinePaymentSchema }),
  asyncHandler(PaymentsController.recordOffline)
);
