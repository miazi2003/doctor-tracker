import type { AuthIdentity } from "../middleware/auth.middleware.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthIdentity;
    }
  }
}

export {};
