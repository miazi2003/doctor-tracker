import type { Request, Response } from "express";
import { z } from "zod";

import { env } from "../config/env.js";

const EXPIRATION_MILLISECONDS = {
  "15m": 15 * 60 * 1_000,
  "1h": 60 * 60 * 1_000,
  "8h": 8 * 60 * 60 * 1_000,
  "1d": 24 * 60 * 60 * 1_000,
  "7d": 7 * 24 * 60 * 60 * 1_000,
} as const;

const cookieRecordSchema = z.record(z.string(), z.unknown());

export const getAuthenticationToken = (request: Request): string | undefined => {
  const cookiesResult = cookieRecordSchema.safeParse(request.cookies as unknown);

  if (!cookiesResult.success) {
    return undefined;
  }

  const token = cookiesResult.data[env.AUTH_COOKIE_NAME];
  return typeof token === "string" && token.length > 0 ? token : undefined;
};

export const setAuthenticationCookie = (
  response: Response,
  token: string,
): void => {
  const isProduction = env.NODE_ENV === "production";

  response.cookie(env.AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: EXPIRATION_MILLISECONDS[env.JWT_EXPIRES_IN],
    path: "/",
  });
};
