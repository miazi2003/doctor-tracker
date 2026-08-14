import type { Server } from "node:http";
import { pathToFileURL } from "node:url";

import app from "./express-application.mjs";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const registerShutdownHandlers = (server: Server): void => {
  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`${signal} received; shutting down gracefully`);

    server.close((error) => {
      if (error) {
        console.error("Failed to close the HTTP server");
        process.exitCode = 1;
      }

      void disconnectDatabase()
        .catch(() => {
          console.error("Failed to disconnect from MongoDB");
          process.exitCode = 1;
        })
        .finally(() => {
          process.exit();
        });
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
};

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`Doctor Tracker API listening on port ${String(env.PORT)}`);
    });

    registerShutdownHandlers(server);
  } catch {
    process.exitCode = 1;
  }
};

const isDirectExecution =
  process.env.VERCEL !== "1" &&
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  void startServer();
}
