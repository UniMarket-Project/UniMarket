import type { Request, Response } from 'express';
import { TransactionsService } from './transactions.service.js';
import { sendCreated, sendSuccess } from '../../platform/http/response.js';

export class TransactionsController {
  public static async createTransaction(req: Request, res: Response): Promise<void> {
    const result = await TransactionsService.createTransaction(req.user!.userId, req.body);
    sendCreated(req, res, result);
  }

  public static async getTransactions(req: Request, res: Response): Promise<void> {
    const result = await TransactionsService.getTransactions(req.user!.userId, req.query as never);
    sendSuccess(req, res, result);
  }

  public static async getTransactionById(req: Request, res: Response): Promise<void> {
    const isAdmin = req.user!.role === 'admin';
    const result = await TransactionsService.getTransactionById(req.params.id, req.user!.userId, isAdmin);
    sendSuccess(req, res, result);
  }

  public static async acceptTransaction(req: Request, res: Response): Promise<void> {
    const result = await TransactionsService.acceptTransaction(req.params.id, req.user!.userId);
    sendSuccess(req, res, result);
  }

  public static async declineTransaction(req: Request, res: Response): Promise<void> {
    const result = await TransactionsService.declineTransaction(req.params.id, req.user!.userId, req.body.reason);
    sendSuccess(req, res, result);
  }

  public static async confirmTransaction(req: Request, res: Response): Promise<void> {
    const result = await TransactionsService.confirmTransaction(req.params.id, req.user!.userId);
    sendSuccess(req, res, result);
  }

  public static async cancelTransaction(req: Request, res: Response): Promise<void> {
    const result = await TransactionsService.cancelTransaction(req.params.id, req.user!.userId, req.body.reason);
    sendSuccess(req, res, result);
  }
}
