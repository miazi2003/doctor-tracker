import "dotenv/config";

import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65_535).default(5_000),
  CLIENT_ORIGIN: z.url().default("http://localhost:3000"),
  MONGODB_URI: z.string().trim().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.enum(["15m", "1h", "8h", "1d", "7d"]).default("1d"),
  AUTH_COOKIE_NAME: z.string().regex(/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/u).default("doctor_tracker_auth"),
});

export const env = environmentSchema.parse(process.env);
