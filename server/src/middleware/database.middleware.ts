import type { RequestHandler } from "express";

import { connectDatabase } from "../config/database.js";
import { AppError } from "../errors/app-error.js";

export const requireDatabaseConnection: RequestHandler = async (
  _request,
  _response,
  next,
) => {
  try {
    await connectDatabase({ silent: true });
    next();
  } catch {
    next(new AppError(503, "Service temporarily unavailable"));
  }
};
