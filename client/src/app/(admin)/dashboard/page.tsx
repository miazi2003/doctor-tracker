import type { Metadata } from "next"
import { Suspense } from "react"

import { Dashboard } from "@/components/dashboard/dashboard"
import { PageContainer } from "@/components/admin/page-container"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Dashboard | Doctor Tracker",
}

export default function DashboardPage() {
  return <Suspense fallback={<PageContainer><Skeleton className="h-10 w-64" /><Skeleton className="mt-6 h-96 w-full" /></PageContainer>}><Dashboard /></Suspense>
}
