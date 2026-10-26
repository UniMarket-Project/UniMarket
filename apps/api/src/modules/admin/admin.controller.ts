import type { Request, Response } from "express";
import { AdminService } from "./admin.service.js";
import { sendSuccess } from "../../platform/http/response.js";

export class AdminController {
  public static async getStats(req: Request, res: Response): Promise<void> {
    const result = await AdminService.getStats();
    sendSuccess(req, res, result);
  }

  public static async getProfileChangeRequests(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await AdminService.getProfileChangeRequests(
      req.query.status as string | undefined,
    );
    sendSuccess(req, res, result);
  }

  public static async reviewProfileChangeRequest(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await AdminService.reviewProfileChangeRequest(
      req.user!.userId,
      req.params.id,
      req.body,
    );
    sendSuccess(req, res, result);
  }

  public static async getVerifications(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await AdminService.getVerifications(req.query as never);
    sendSuccess(req, res, result);
  }

  public static async reviewVerification(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await AdminService.reviewVerification(
      req.user!.userId,
      req.params.id,
      req.body,
    );
    sendSuccess(req, res, result);
  }

  public static async getReports(req: Request, res: Response): Promise<void> {
    const result = await AdminService.getReports(req.query as never);
    sendSuccess(req, res, result);
  }

  public static async resolveReport(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await AdminService.resolveReport(
      req.user!.userId,
      req.params.id,
      req.body,
    );
    sendSuccess(req, res, result);
  }

  public static async suspendUser(req: Request, res: Response): Promise<void> {
    const result = await AdminService.suspendUser(
      req.user!.userId,
      req.params.userId,
      req.body,
    );
    sendSuccess(req, res, result);
  }

  public static async unsuspendUser(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await AdminService.unsuspendUser(
      req.user!.userId,
      req.params.userId,
      req.body,
    );
    sendSuccess(req, res, result);
  }

  public static async listUsers(req: Request, res: Response): Promise<void> {
    const result = await AdminService.listUsers(req.query as never);
    sendSuccess(req, res, result);
  }
}
