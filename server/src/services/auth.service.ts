import bcrypt from "bcrypt";

import { AppError } from "../errors/app-error.js";
import { AdminModel } from "../models/admin.model.js";
import type { LoginInput } from "../validation/auth.validation.js";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";
// Cost 12 hash for a synthetic value; it is not derived from any credential.
const DUMMY_PASSWORD_HASH =
  "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxlYcN/rc8UmD4gZ2Cq7mN3qWqK";

export interface SafeAdmin {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

export const authenticateAdmin = async (
  credentials: LoginInput,
): Promise<SafeAdmin> => {
  const admin = await AdminModel.findOne({ email: credentials.email }).select(
    "+password",
  );

  if (admin === null) {
    await bcrypt.compare(credentials.password, DUMMY_PASSWORD_HASH);
    throw new AppError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  const passwordMatches = await bcrypt.compare(
    credentials.password,
    admin.password,
  );

  if (!passwordMatches) {
    throw new AppError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
};

export const getCurrentAdmin = async (adminId: string): Promise<SafeAdmin> => {
  const admin = await AdminModel.findById(adminId)
    .select({ _id: 1, name: 1, email: 1, role: 1 })
    .lean()
    .exec();

  if (admin === null) {
    throw new AppError(401, "Unauthorized");
  }

  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
};
