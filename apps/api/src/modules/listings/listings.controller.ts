import type { Request, Response } from 'express';
import { ListingsService } from './listings.service.js';
import { sendCreated, sendSuccess, sendNoContent } from '../../platform/http/response.js';

export class ListingsController {
  public static async createListing(req: Request, res: Response): Promise<void> {
    const result = await ListingsService.createListing(req.user!.userId, req.body);
    sendCreated(req, res, result);
  }

  public static async getListings(req: Request, res: Response): Promise<void> {
    const result = await ListingsService.getListings(req.query as never);
    sendSuccess(req, res, result);
  }

  public static async getListingById(req: Request, res: Response): Promise<void> {
    const callerId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';
    const result = await ListingsService.getListingById(req.params.id, callerId, isAdmin);
    sendSuccess(req, res, result);
  }

  public static async updateListing(req: Request, res: Response): Promise<void> {
    const callerId = req.user!.userId;
    const isAdmin = req.user!.role === 'admin';
    const result = await ListingsService.updateListing(req.params.id, callerId, isAdmin, req.body);
    sendSuccess(req, res, result);
  }

  public static async deleteListing(req: Request, res: Response): Promise<void> {
    const callerId = req.user!.userId;
    const isAdmin = req.user!.role === 'admin';
    await ListingsService.deleteListing(req.params.id, callerId, isAdmin);
    sendNoContent(res);
  }
}
