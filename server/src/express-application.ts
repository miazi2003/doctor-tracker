import { createRequire } from "node:module";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type RequestHandler } from "express";

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

const require = createRequire(import.meta.url);
const helmetModule: unknown = require("helmet");

const isZeroArgumentFactory = (value: unknown): value is () => unknown =>
  typeof value === "function" && value.length === 0;

const isRequestHandler = (value: unknown): value is RequestHandler =>
  typeof value === "function";

if (!isZeroArgumentFactory(helmetModule)) {
  throw new TypeError("Security middleware could not be initialized");
}

const helmetMiddleware: unknown = helmetModule();

if (!isRequestHandler(helmetMiddleware)) {
  throw new TypeError("Security middleware could not be initialized");
}

const app = express();

app.disable("x-powered-by");
if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use(helmetMiddleware);
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

export default app;
