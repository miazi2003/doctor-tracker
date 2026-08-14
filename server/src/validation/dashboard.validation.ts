import { z } from "zod";

export const dashboardStatsQuerySchema = z
  .object({
    days: z
      .enum(["7", "30", "90"], {
        error: "days must be one of 7, 30, or 90",
      })
      .default("30")
      .transform((value): 7 | 30 | 90 => Number(value) as 7 | 30 | 90),
  })
  .strict();

export type DashboardStatsQuery = z.infer<typeof dashboardStatsQuerySchema>;
