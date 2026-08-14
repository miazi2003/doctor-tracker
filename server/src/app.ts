import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { AppError } from "./errors/app-error.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { verifyRequestOrigin } from "./middleware/origin.middleware.js";
import { authRouter } from "./routes/auth.route.js";
import { doctorRouter } from "./routes/doctor.route.js";
import { healthRouter } from "./routes/health.route.js";

export const app = express();

app.disable("x-powered-by");
if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (origin === undefined || origin === env.CLIENT_URL) {
        callback(null, true);
        return;
      }

      callback(new AppError(403, "Forbidden"));
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(cookieParser());
app.use(verifyRequestOrigin);

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/doctors", doctorRouter);

app.use(errorHandler);
