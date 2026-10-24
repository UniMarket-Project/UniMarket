import { Router } from 'express';
import { MessagesController } from './messages.controller.js';
import { authenticate } from '../../platform/middleware/authenticate.middleware.js';
import { validate } from '../../platform/middleware/validate.middleware.js';
import { messagesRateLimiter } from '../../platform/middleware/rate-limit.middleware.js';
import { asyncHandler } from '../../platform/http/async-handler.js';
import { sendMessageSchema, conversationThreadQuerySchema } from '@unimarket/shared';

export const messagesRouter = Router();

messagesRouter.use(authenticate);

messagesRouter.post(
  '/',
  messagesRateLimiter,
  validate({ body: sendMessageSchema }),
  asyncHandler(MessagesController.sendMessage)
);

messagesRouter.get('/', asyncHandler(MessagesController.listConversations));
messagesRouter.get('/conversations', asyncHandler(MessagesController.listConversations));
messagesRouter.get('/unread-count', asyncHandler(MessagesController.getUnreadCount));
messagesRouter.get(
  '/conversations/:userId',
  validate({ query: conversationThreadQuerySchema }),
  asyncHandler(MessagesController.getThread)
);
messagesRouter.get(
  '/thread/:userId',
  validate({ query: conversationThreadQuerySchema }),
  asyncHandler(MessagesController.getThread)
);
