import type { Metadata } from "next"
import { Suspense } from "react"

import { Dashboard } from "@/components/dashboard/dashboard"
import { DashboardContentSkeleton } from "@/components/dashboard/dashboard-skeleton"

export const metadata: Metadata = {
  title: "Dashboard | Doctor Tracker",
}

export default function DashboardPage() {
  return <Suspense fallback={<DashboardContentSkeleton />}><Dashboard /></Suspense>
}
