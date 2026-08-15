"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { dashboardStatsQueryOptions } from "@/features/dashboard/dashboard.queries"

import { AuthErrorScreen } from "./auth-error-screen"
import { AuthLoadingScreen } from "./auth-loading-screen"
import { useCurrentAdmin } from "./use-current-admin"

export function RootAccess() {
  const router = useRouter()
  const auth = useCurrentAdmin()
  const dashboardQuery = useQuery({
    ...dashboardStatsQueryOptions(30),
    enabled: auth.status === "authenticated",
  })

  useEffect(() => {
    if (auth.status === "authenticated" && !dashboardQuery.isPending) {
      router.replace("/dashboard")
    }
    if (auth.status === "unauthenticated") router.replace("/login")
  }, [auth.status, dashboardQuery.isPending, router])

  if (auth.status === "network-error" || auth.status === "unexpected-error") {
    return (
      <AuthErrorScreen
        isNetworkError={auth.status === "network-error"}
        isRetrying={auth.isRetrying}
        onRetry={auth.retry}
      />
    )
  }

  return <AuthLoadingScreen />
}
