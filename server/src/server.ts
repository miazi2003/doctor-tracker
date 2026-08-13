import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`Doctor Tracker API listening on port ${String(env.PORT)}`);
});

const shutdown = (signal: NodeJS.Signals): void => {
  console.log(`${signal} received; shutting down gracefully`);
  server.close((error) => {
    if (error) {
      console.error("Failed to close the HTTP server", error);
      process.exit(1);
    }

    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
