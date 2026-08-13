import mongoose from "mongoose";

import { env } from "./env.js";

let connectionPromise: Promise<void> | undefined;

interface DatabaseErrorDetails {
  name: string;
  code?: string | number;
  message: string;
}

const sanitizeDatabaseErrorMessage = (message: string): string => {
  let sanitizedMessage = message;

  // Remove the configured value first, including malformed connection strings
  // that a driver error may echo back verbatim.
  if (env.MONGODB_URI.length > 0) {
    sanitizedMessage = sanitizedMessage.replaceAll(
      env.MONGODB_URI,
      "[REDACTED_MONGODB_URI]",
    );
  }

  return sanitizedMessage
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/giu, "[REDACTED_MONGODB_URI]")
    .replace(
      /\b(?:username|user|password|passwd|pwd)\s*[=:]\s*[^\s,;]+/giu,
      (match) => `${match.split(/[=:]/u, 1)[0] ?? "credential"}=[REDACTED]`,
    )
    .replace(/\/\/[^\s/@:]+:[^\s/@]+@/gu, "//[REDACTED_CREDENTIALS]@");
};

const getDatabaseErrorDetails = (error: unknown): DatabaseErrorDetails => {
  if (!(error instanceof Error)) {
    return {
      name: "UnknownError",
      message: "An unknown MongoDB connection error occurred",
    };
  }

  const errorWithCode = error as Error & { code?: unknown };
  const details: DatabaseErrorDetails = {
    name: error.name,
    message: sanitizeDatabaseErrorMessage(error.message),
  };

  if (
    typeof errorWithCode.code === "string" ||
    typeof errorWithCode.code === "number"
  ) {
    details.code = errorWithCode.code;
  }

  return details;
};

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    return;
  }

  connectionPromise ??= mongoose
    .connect(env.MONGODB_URI)
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((error: unknown) => {
      connectionPromise = undefined;
      if (env.NODE_ENV === "development") {
        console.error("MongoDB connection failed", getDatabaseErrorDetails(error));
      } else {
        console.error("MongoDB connection failed");
      }
      throw error;
    });

  await connectionPromise;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (
    mongoose.connection.readyState === mongoose.ConnectionStates.disconnected
  ) {
    return;
  }

  await mongoose.disconnect();
  connectionPromise = undefined;
};
