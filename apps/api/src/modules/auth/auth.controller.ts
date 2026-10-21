import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { sendCreated, sendSuccess } from "../../platform/http/response.js";
import { config } from "../../platform/config/index.js";

const REFRESH_COOKIE_NAME = "um_rt";
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.app.isProd,
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: COOKIE_MAX_AGE_MS,
    domain: config.security.cookieDomain || undefined,
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.app.isProd,
    sameSite: "lax",
    path: "/api/v1/auth",
    domain: config.security.cookieDomain || undefined,
  });
}

function isBodyTransportRequested(req: Request): boolean {
  return req.headers["x-token-transport"] === "body";
}

export class AuthController {
  // Methods to be added in next commit
}
