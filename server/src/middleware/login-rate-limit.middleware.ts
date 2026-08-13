import { rateLimit } from "express-rate-limit";

import { env } from "../config/env.js";

export const loginRateLimit = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({
      success: false,
      error: { message: "Too many login attempts. Please try again later." },
    });
  },
  
});
