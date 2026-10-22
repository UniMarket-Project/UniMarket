import type { Request, Response } from 'express';
import { MessagesService } from './messages.service.js';
import { sendCreated, sendSuccess } from '../../platform/http/response.js';

export class MessagesController {
  public static async sendMessage(req: Request, res: Response): Promise<void> {
    const result = await MessagesService.sendMessage(req.user!.userId, req.body);
    sendCreated(req, res, result);
  }

  public static async listConversations(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await MessagesService.listConversations(req.user!.userId, page, limit);
    sendSuccess(req, res, result);
  }

  public static async getThread(req: Request, res: Response): Promise<void> {
    const result = await MessagesService.getThread(req.user!.userId, req.params.userId, req.query as never);
    sendSuccess(req, res, result);
  }

  public static async getUnreadCount(req: Request, res: Response): Promise<void> {
    const result = await MessagesService.getUnreadCount(req.user!.userId);
    sendSuccess(req, res, result);
  }
}
