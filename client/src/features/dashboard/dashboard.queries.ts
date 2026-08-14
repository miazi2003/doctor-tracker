import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { getDashboardStats } from "./dashboard.api"
import type { DashboardDays } from "./dashboard.schema"

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  stats: (days: DashboardDays) => ["dashboard", "stats", days] as const,
}

export const dashboardStatsQueryOptions = (days: DashboardDays) => queryOptions({
  queryKey: dashboardQueryKeys.stats(days),
  queryFn: ({ signal }) => getDashboardStats(days, signal),
  placeholderData: keepPreviousData,
  staleTime: 30_000,
})
