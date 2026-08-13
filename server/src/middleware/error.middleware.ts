import type { ErrorRequestHandler } from "express";
import { z } from "zod";

import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

const isMalformedJsonError = (error: unknown): boolean =>
  error instanceof SyntaxError &&
  "status" in error &&
  error.status === 400 &&
  "body" in error;

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  void _next;

  if (isMalformedJsonError(error)) {
    response.status(400).json({
      success: false,
      error: { message: "Invalid request data" },
    });
    return;
  }

  if (error instanceof z.ZodError) {
    response.status(400).json({
      success: false,
      error: {
        message: "Invalid request data",
        issues: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: { message: error.message },
    });
    return;
  }

  if (env.NODE_ENV === "development") {
    console.error("Unexpected request failure", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
  } else {
    console.error("Unexpected request failure");
  }

  response.status(500).json({
    success: false,
    error: { message: "Internal server error" },
  });
};
