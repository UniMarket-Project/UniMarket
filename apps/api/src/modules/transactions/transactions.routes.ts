import { Router } from 'express';
import { TransactionsController } from './transactions.controller.js';
import { authenticate } from '../../platform/middleware/authenticate.middleware.js';
import { requireVerified } from '../../platform/middleware/require-verified.middleware.js';
import { validate } from '../../platform/middleware/validate.middleware.js';
import { asyncHandler } from '../../platform/http/async-handler.js';
import {
  createTransactionSchema,
  transactionsQuerySchema,
  declineTransactionSchema,
  confirmTransactionSchema,
  cancelTransactionSchema,
} from '@unimarket/shared';

export const transactionsRouter = Router();

transactionsRouter.use(authenticate);

transactionsRouter.post(
  '/',
  requireVerified,
  validate({ body: createTransactionSchema }),
  asyncHandler(TransactionsController.createTransaction)
);

transactionsRouter.get(
  '/',
  validate({ query: transactionsQuerySchema }),
  asyncHandler(TransactionsController.getTransactions)
);

transactionsRouter.get('/:id', asyncHandler(TransactionsController.getTransactionById));

transactionsRouter.post('/:id/accept', asyncHandler(TransactionsController.acceptTransaction));
transactionsRouter.patch('/:id/accept', asyncHandler(TransactionsController.acceptTransaction));

transactionsRouter.post(
  '/:id/decline',
  validate({ body: declineTransactionSchema }),
  asyncHandler(TransactionsController.declineTransaction)
);
transactionsRouter.patch(
  '/:id/decline',
  validate({ body: declineTransactionSchema }),
  asyncHandler(TransactionsController.declineTransaction)
);

transactionsRouter.post(
  '/:id/confirm',
  validate({ body: confirmTransactionSchema }),
  asyncHandler(TransactionsController.confirmTransaction)
);
transactionsRouter.patch(
  '/:id/confirm',
  validate({ body: confirmTransactionSchema }),
  asyncHandler(TransactionsController.confirmTransaction)
);

transactionsRouter.post(
  '/:id/cancel',
  validate({ body: cancelTransactionSchema }),
  asyncHandler(TransactionsController.cancelTransaction)
);
transactionsRouter.patch(
  '/:id/cancel',
  validate({ body: cancelTransactionSchema }),
  asyncHandler(TransactionsController.cancelTransaction)
);
