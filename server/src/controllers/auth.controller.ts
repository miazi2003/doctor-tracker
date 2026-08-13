import type { RequestHandler } from "express";

import { authenticateAdmin } from "../services/auth.service.js";
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
