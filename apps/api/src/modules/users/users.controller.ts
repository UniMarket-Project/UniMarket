import type { Request, Response } from "express";
import { UsersService } from "./users.service.js";
import { sendSuccess } from "../../platform/http/response.js";

export class UsersController {
  public static async getMe(req: Request, res: Response): Promise<void> {
    const result = await UsersService.getMe(req.user!.userId);
    sendSuccess(req, res, result);
  }

  public static async updateMe(req: Request, res: Response): Promise<void> {
    const result = await UsersService.updateMe(req.user!.userId, req.body);
    sendSuccess(req, res, result);
  }

  public static async getPublicProfile(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await UsersService.getPublicProfile(req.params.userId);
    sendSuccess(req, res, result);
  }

  public static async getUserListings(
    req: Request,
    res: Response,
  ): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const isOwner = req.user?.userId === req.params.userId;
    const isAdmin = req.user?.role === "admin";
    const result = await UsersService.getUserListings(
      req.params.userId,
      page,
      limit,
      isOwner || isAdmin,
    );
    sendSuccess(req, res, {
      listings: result.items,
      pagination: result.pagination,
    });
  }
}
