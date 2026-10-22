import type { Request, Response } from "express";
import { NotificationsService } from "./notifications.service.js";
import { sendSuccess } from "../../platform/http/response.js";

export class NotificationsController {
  public static async getNotifications(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await NotificationsService.getNotifications(
      req.user!.userId,
      req.query as never,
    );
    sendSuccess(req, res, result);
  }

  public static async markAsRead(req: Request, res: Response): Promise<void> {
    const result = await NotificationsService.markAsRead(
      req.params.id,
      req.user!.userId,
    );
    sendSuccess(req, res, result);
  }

  public static async markAllAsRead(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await NotificationsService.markAllAsRead(req.user!.userId);
    sendSuccess(req, res, result);
  }
}
