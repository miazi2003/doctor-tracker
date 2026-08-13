import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

interface AdminJwtPayload {
  id: string;
  role: "admin";
}

export const createAdminToken = (adminId: string): string =>
  jwt.sign(
    {
      id: adminId,
      role: "admin",
    } satisfies AdminJwtPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
