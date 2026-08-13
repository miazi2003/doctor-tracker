import { Router } from "express";

import { getMe, login, logout } from "../controllers/auth.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuthentication, getMe);
