import type { RequestHandler } from "express";

import { getDashboardStats } from "../services/dashboard.service.js";
import { dashboardStatsQuerySchema } from "../validation/dashboard.validation.js";

export const getStats: RequestHandler = async (request, response) => {
  const query = dashboardStatsQuerySchema.parse(request.query);
  const stats = await getDashboardStats(query);
  response.status(200).json({ success: true, data: { stats } });
};
