import type { Request, Response } from "express";
import { RatingsService } from "./ratings.service.js";
import { sendCreated, sendSuccess } from "../../platform/http/response.js";

export class RatingsController {
  public static async createRating(req: Request, res: Response): Promise<void> {
    const result = await RatingsService.createRating(
      req.user!.userId,
      req.body,
    );
    sendCreated(req, res, result);
  }

  public static async getUserRatings(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await RatingsService.getUserRatings(
      req.params.userId,
      req.query as never,
    );
    sendSuccess(req, res, result);
  }
}
