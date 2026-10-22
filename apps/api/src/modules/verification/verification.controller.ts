import type { Request, Response } from "express";
import { VerificationService } from "./verification.service.js";
import { sendCreated, sendSuccess } from "../../platform/http/response.js";

export class VerificationController {
  public static async submitStudent(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await VerificationService.submitStudent(
      req.user!.userId,
      req.body,
    );
    sendCreated(req, res, result);
  }

  public static async submitProvider(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await VerificationService.submitProvider(
      req.user!.userId,
      req.body,
    );
    sendCreated(req, res, result);
  }

  public static async getStatus(req: Request, res: Response): Promise<void> {
    const result = await VerificationService.getStatus(req.user!.userId);
    sendSuccess(req, res, result);
  }
}
