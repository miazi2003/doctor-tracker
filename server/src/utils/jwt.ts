import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../config/env.js";

interface AdminJwtPayload {
  id: string;
  role: "admin";
}

const adminJwtPayloadSchema = z
  .object({
    id: z.string().regex(/^[a-f\d]{24}$/iu),
    role: z.literal("admin"),
    iat: z.number().int(),
    exp: z.number().int(),
  })
  .strict()
  .transform(({ id, role }) => ({ id, role }));

export const createAdminToken = (adminId: string): string =>
  jwt.sign(
    {
      id: adminId,
      role: "admin",
    } satisfies AdminJwtPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

export const verifyAdminToken = (token: string): AdminJwtPayload => {
  const decodedToken: unknown = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  });
  return adminJwtPayloadSchema.parse(decodedToken);
};
