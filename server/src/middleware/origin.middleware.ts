import type { RequestHandler } from "express";

import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { getAuthenticationToken } from "../utils/auth-cookie.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const verifyRequestOrigin: RequestHandler = (
  request,
  _response,
  next,
) => {
  if (
    SAFE_METHODS.has(request.method) ||
    getAuthenticationToken(request) === undefined
  ) {
    next();
    return;
  }

  const origin = request.get("origin");

  // Non-browser development/test clients may omit Origin. Browsers provide it
  // for the cross-origin state-changing requests protected by this middleware.
  if (origin === undefined || origin === env.CLIENT_URL) {
    next();
    return;
  }

  next(new AppError(403, "Forbidden"));
};
