import type { RequestHandler, Response } from "express";

import { AdminModel } from "../models/admin.model.js";
import { getAuthenticationToken } from "../utils/auth-cookie.js";
import { verifyAdminToken } from "../utils/jwt.js";

const UNAUTHORIZED_RESPONSE = {
  success: false,
  error: { message: "Unauthorized" },
} as const;

export interface AuthIdentity {
  id: string;
  role: "admin";
}

const sendUnauthorized = (response: Response): void => {
  response.status(401).json(UNAUTHORIZED_RESPONSE);
};

export const requireAuthentication: RequestHandler = async (
  request,
  response,
  next,
) => {
  const token = getAuthenticationToken(request);

  if (token === undefined) {
    sendUnauthorized(response);
    return;
  }

  let identity: AuthIdentity;

  try {
    identity = verifyAdminToken(token);
  } catch {
    sendUnauthorized(response);
    return;
  }

  const adminExists = await AdminModel.exists({
    _id: identity.id,
    role: "admin",
  });

  if (adminExists === null) {
    sendUnauthorized(response);
    return;
  }

  request.auth = identity;
  next();
};
