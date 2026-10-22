import { Router } from 'express';
import { HealthController } from './health.controller.js';
import { asyncHandler } from '../../platform/http/async-handler.js';

export const healthRouter = Router();

healthRouter.get('/health', HealthController.getLiveness);
healthRouter.get('/ready', asyncHandler(HealthController.getReadiness));
