import type { RequestHandler } from "express";

import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const verifyRequestOrigin: RequestHandler = (
  request,
  _response,
  next,
) => {
  if (SAFE_METHODS.has(request.method)) {
    next();
    return;
  }

  const origin = request.get("origin");

  if (origin === env.CLIENT_URL) {
    next();
    return;
  }

  next(new AppError(403, "Forbidden"));
};
