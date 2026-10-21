import type { Request, Response } from 'express';
import { RequestsService } from './requests.service.js';
import { sendCreated, sendSuccess } from '../../platform/http/response.js';

export class RequestsController {
  public static async createRequest(req: Request, res: Response): Promise<void> {
    const result = await RequestsService.createRequest(req.user!.userId, req.body);
    sendCreated(req, res, result);
  }

  public static async getRequests(req: Request, res: Response): Promise<void> {
    const callerId = req.user?.userId;
    const result = await RequestsService.getRequests(req.query as never, callerId);
    sendSuccess(req, res, result);
  }

  public static async getRequestById(req: Request, res: Response): Promise<void> {
    const result = await RequestsService.getRequestById(req.params.id);
    sendSuccess(req, res, result);
  }

  public static async updateRequest(req: Request, res: Response): Promise<void> {
    const callerId = req.user!.userId;
    const isAdmin = req.user!.role === 'admin';
    const result = await RequestsService.updateRequest(req.params.id, callerId, isAdmin, req.body);
    sendSuccess(req, res, result);
  }
}
