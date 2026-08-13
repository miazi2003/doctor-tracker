import type { RequestHandler } from "express";

import { AppError } from "../errors/app-error.js";
import {
  authenticateAdmin,
  getCurrentAdmin,
} from "../services/auth.service.js";
import { setAuthenticationCookie } from "../utils/auth-cookie.js";
import { createAdminToken } from "../utils/jwt.js";
import { loginSchema } from "../validation/auth.validation.js";

export const login: RequestHandler = async (request, response) => {
  const credentials = loginSchema.parse(request.body);
  const admin = await authenticateAdmin(credentials);
  const token = createAdminToken(admin.id);

  setAuthenticationCookie(response, token);
  response.status(200).json({
    success: true,
    data: { admin },
  });
};

export const getMe: RequestHandler = async (request, response) => {
  if (request.auth === undefined) {
    throw new AppError(401, "Unauthorized");
  }

  const admin = await getCurrentAdmin(request.auth.id);

  response.status(200).json({
    success: true,
    data: { admin },
  });
};
