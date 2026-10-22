import { Router } from 'express';
import { authRouter } from './modules/auth/index.js';
import { usersRouter } from './modules/users/users.routes.js';
import { verificationRouter } from './modules/verification/verification.routes.js';
import { uploadsRouter } from './modules/uploads/uploads.routes.js';
import { listingsRouter } from './modules/listings/listings.routes.js';
import { requestsRouter } from './modules/requests/requests.routes.js';
import { messagesRouter } from './modules/messages/messages.routes.js';
import { transactionsRouter } from './modules/transactions/transactions.routes.js';
import { ratingsRouter } from './modules/ratings/ratings.routes.js';
import { reportsRouter } from './modules/reports/reports.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';

export const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/users', usersRouter);
apiV1Router.use('/verification', verificationRouter);
apiV1Router.use('/uploads', uploadsRouter);
apiV1Router.use('/listings', listingsRouter);
apiV1Router.use('/requests', requestsRouter);
apiV1Router.use('/messages', messagesRouter);
apiV1Router.use('/transactions', transactionsRouter);
apiV1Router.use('/ratings', ratingsRouter);
apiV1Router.use('/reports', reportsRouter);
apiV1Router.use('/notifications', notificationsRouter);
