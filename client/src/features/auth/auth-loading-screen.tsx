"use client"

import { useEffect, useState } from "react"

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export function AuthLoadingScreen({
  message = "Verifying your secure session",
}: { message?: string }) {
  const [isTakingLonger, setIsTakingLonger] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsTakingLonger(true), 3_000)
    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <DashboardSkeleton
      notice={
        <div aria-busy="true" aria-live="polite" role="status">
          <span className="sr-only">{message}</span>
          {isTakingLonger && (
            <p className="rounded-xl border border-violet-300/10 bg-violet-400/[0.055] px-4 py-3 text-sm text-neutral-300">
              Starting the secure server… This may take a few seconds on the first visit.
            </p>
          )}
        </div>
      }
    />
  )
}
