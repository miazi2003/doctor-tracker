import "dotenv/config";

import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65_535).default(5_000),
  CLIENT_ORIGIN: z.url().default("http://localhost:3000"),
  MONGODB_URI: z.string().trim().min(1, "MONGODB_URI is required"),
});

export const env = environmentSchema.parse(process.env);
