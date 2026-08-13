import type { Response } from "express";

import { env } from "../config/env.js";

const EXPIRATION_MILLISECONDS = {
  "15m": 15 * 60 * 1_000,
  "1h": 60 * 60 * 1_000,
  "8h": 8 * 60 * 60 * 1_000,
  "1d": 24 * 60 * 60 * 1_000,
  "7d": 7 * 24 * 60 * 60 * 1_000,
} as const;

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
