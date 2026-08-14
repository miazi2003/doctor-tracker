import { z } from "zod"

import { ApiClientError, apiRequest, type ApiResponse } from "@/lib/api-client"

import { dashboardStatsSchema, type DashboardDays, type DashboardStats } from "./dashboard.schema"

const dashboardResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ stats: dashboardStatsSchema }).strict(),
}).strict()

export type DashboardApiErrorKind = "network" | "unexpected"

export class DashboardApiError extends Error {
  public constructor(public readonly kind: DashboardApiErrorKind) {
    super(kind)
    this.name = "DashboardApiError"
  }
}

export async function getDashboardStats(days: DashboardDays, signal?: AbortSignal): Promise<DashboardStats> {
  let response: ApiResponse
  try {
    response = await apiRequest(`/api/dashboard/stats?days=${String(days)}`, signal === undefined ? undefined : { signal })
  } catch (error: unknown) {
    throw error instanceof ApiClientError && error.kind === "network"
      ? new DashboardApiError("network")
      : new DashboardApiError("unexpected")
  }
  if (!response.response.ok) throw new DashboardApiError("unexpected")
  const result = dashboardResponseSchema.safeParse(response.payload)
  if (!result.success) throw new DashboardApiError("unexpected")
  return result.data.data.stats
}
