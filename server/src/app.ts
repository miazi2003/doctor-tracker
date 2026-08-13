import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { authRouter } from "./routes/auth.route.js";
import { healthRouter } from "./routes/health.route.js";

export const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);
