import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { sendCreated, sendSuccess } from "../../platform/http/response.js";
import { config } from "../../platform/config/index.js";

const REFRESH_COOKIE_NAME = "um_rt";
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function setRefreshCookie(res: Response, token: string): void {
  const isCrossSite = config.app.isProd && !config.security.cookieDomain;
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.app.isProd,
    sameSite: isCrossSite ? "none" : "lax",
    path: "/api/v1/auth",
    maxAge: COOKIE_MAX_AGE_MS,
    domain: config.security.cookieDomain || undefined,
  });
}

function clearRefreshCookie(res: Response): void {
  const isCrossSite = config.app.isProd && !config.security.cookieDomain;
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.app.isProd,
    sameSite: isCrossSite ? "none" : "lax",
    path: "/api/v1/auth",
    domain: config.security.cookieDomain || undefined,
  });
}

function isBodyTransportRequested(req: Request): boolean {
  return req.headers["x-token-transport"] === "body";
}

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    const result = await AuthService.register(req.body);
    const wantsBody = isBodyTransportRequested(req);

    setRefreshCookie(res, result.refreshToken);

    const responseData = {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      ...(wantsBody ? { refreshToken: result.refreshToken } : {}),
    };

    sendCreated(req, res, responseData);
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const result = await AuthService.login(req.body);
    const wantsBody = isBodyTransportRequested(req);

    setRefreshCookie(res, result.refreshToken);

    const responseData = {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      ...(wantsBody ? { refreshToken: result.refreshToken } : {}),
    };

    sendSuccess(req, res, responseData);
  }

  public static async refresh(req: Request, res: Response): Promise<void> {
    const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const bodyToken = req.body?.refreshToken;
    const rawToken = cookieToken || bodyToken;

    const result = await AuthService.refresh(rawToken);
    const wantsBody = isBodyTransportRequested(req);

    setRefreshCookie(res, result.refreshToken);

    const responseData = {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      ...(wantsBody ? { refreshToken: result.refreshToken } : {}),
    };

    sendSuccess(req, res, responseData);
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    const rawToken =
      req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
    await AuthService.logout(rawToken);

    clearRefreshCookie(res);
    sendSuccess(req, res, { message: "Logged out successfully" });
  }
}
