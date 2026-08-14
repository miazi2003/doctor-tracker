import type { Metadata } from "next"

import { PageContainer } from "@/components/admin/page-container"

export const metadata: Metadata = {
  title: "Dashboard | Doctor Tracker",
}

export default function DashboardPage() {
  return (
    <PageContainer>
      <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <p className="text-sm font-medium text-neutral-500">Overview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-neutral-950">
          Welcome to Doctor Tracker
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
          Your administration workspace is ready. Dashboard analytics will be
          added in a future update.
        </p>
      </section>
    </PageContainer>
  )
}
