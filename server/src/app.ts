import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import * as helmetModule from "helmet";

import { env } from "./config/env.js";
import { AppError } from "./errors/app-error.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { requireDatabaseConnection } from "./middleware/database.middleware.js";
import { verifyRequestOrigin } from "./middleware/origin.middleware.js";
import { authRouter } from "./routes/auth.route.js";
import { doctorRouter } from "./routes/doctor.route.js";
import { dashboardRouter } from "./routes/dashboard.route.js";
import { healthRouter } from "./routes/health.route.js";
import { patientRouter } from "./routes/patient.route.js";

export const app = express();

app.disable("x-powered-by");
if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use(helmetModule.default());
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
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(cookieParser());
app.use(verifyRequestOrigin);

app.get("/", (_request, response) => {
  response.status(200).json({ message: "Doctor Tracker API is running" });
});
app.use("/api/health", healthRouter);
app.use(requireDatabaseConnection);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/patients", patientRouter);

app.use(errorHandler);
