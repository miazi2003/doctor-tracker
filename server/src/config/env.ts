import "dotenv/config";

import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65_535).default(5_000),
  CLIENT_URL: z.url().refine((url) => !url.endsWith("/"), {
    message: "CLIENT_URL must not end with a slash",
  }),
  MONGODB_URI: z.string().trim().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.enum(["15m", "1h", "8h", "1d", "7d"]).default("1d"),
  AUTH_COOKIE_NAME: z.string().regex(/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/u).default("doctor_tracker_auth"),
  JSON_BODY_LIMIT: z.string().regex(/^\d+(?:kb|mb)$/u).default("16kb"),
  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .min(60_000)
    .max(3_600_000)
    .default(15 * 60 * 1_000),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(100).default(10),
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export const env = environmentSchema.parse(process.env);
