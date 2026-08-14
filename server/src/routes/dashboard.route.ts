import { Router } from "express";

import { getStats } from "../controllers/dashboard.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuthentication);
dashboardRouter.get("/stats", getStats);
