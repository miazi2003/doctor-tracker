import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"

function SidebarSkeleton() {
  return (
    <aside
      aria-hidden="true"
      className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.055),transparent_24%),#070908] lg:flex lg:flex-col"
    >
      <div className="flex h-20 items-center gap-3 px-6">
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6">
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex h-11 items-center gap-3 px-3.5">
              <Skeleton className="size-[1.125rem] rounded-md" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto space-y-3 border-t border-white/10 px-6 py-5">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-2.5 w-36" />
      </div>
    </aside>
  )
}

function HeaderSkeleton() {
  return (
    <header
      aria-hidden="true"
      className="sticky top-0 z-20 border-b border-white/10 bg-[#070908]"
    >
      <div className="flex h-16 min-w-0 items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-6 xl:px-7">
        <Skeleton className="size-9 rounded-full lg:hidden" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="hidden h-2.5 w-20 sm:block" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="hidden h-10 w-[min(18rem,28vw)] rounded-full md:block" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="hidden space-y-2 sm:block">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        </div>
      </div>
    </header>
  )
}

function MetricSkeleton() {
  return (
    <div className="h-40 overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0a0c0b]">
      <div className="flex h-[4.25rem] items-start justify-between bg-white/[0.055] px-3 pt-3.5 sm:h-[4.65rem] sm:px-5 sm:pt-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="size-8 rounded-full sm:size-10" />
      </div>
      <div className="relative -mt-4 min-h-[6.6rem] space-y-3 rounded-[1.35rem] bg-[#0d100e] px-3 py-4 sm:px-5">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-28 max-w-full" />
      </div>
    </div>
  )
}

function ChartSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="h-[22rem] min-w-0 rounded-[1.35rem] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-2.5 h-3 w-52 max-w-full" />
      {compact ? (
        <div className="mt-8 flex items-center justify-center gap-7">
          <Skeleton className="size-40 rounded-full" />
          <div className="hidden w-28 space-y-3 sm:block xl:hidden 2xl:block">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-3 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-7 flex h-56 items-end gap-3 border-b border-l border-white/[0.07] px-3 pb-2">
          {[42, 68, 51, 82, 61, 75, 48, 88].map((height, index) => (
            <Skeleton
              key={index}
              className="min-w-2 flex-1 rounded-t-lg rounded-b-sm"
              style={{ height: `${String(height)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PatientTableSkeleton() {
  return (
    <div className="h-[22rem] min-w-0 overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="mt-6 min-w-[34rem] space-y-3">
        <div className="grid grid-cols-[1.2fr_0.8fr_1.15fr_0.85fr] gap-4 border-b border-white/[0.07] pb-3">
          {[24, 20, 28, 20].map((width, index) => (
            <Skeleton key={index} className="h-2.5" style={{ width: `${String(width)}%` }} />
          ))}
        </div>
        {Array.from({ length: 4 }, (_, row) => (
          <div
            key={row}
            className="grid grid-cols-[1.2fr_0.8fr_1.15fr_0.85fr] items-center gap-4 border-b border-white/[0.07] pb-3"
          >
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardHeadingSkeleton() {
  return (
    <div aria-hidden="true" className="flex items-start justify-between gap-4">
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-56 max-w-[70vw]" />
          <Skeleton className="h-3.5 w-96 max-w-[80vw]" />
        </div>
        <Skeleton className="h-11 w-36 rounded-full" />
    </div>
  )
}

export function DashboardMetricsSkeleton() {
  return (
    <section aria-hidden="true" className="grid grid-cols-2 gap-2.5 sm:gap-4 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <MetricSkeleton key={index} />)}
    </section>
  )
}

export function DashboardChartsSkeleton() {
  return (
    <section aria-hidden="true" className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,1fr)]">
        <ChartSkeleton />
        <ChartSkeleton />
    </section>
  )
}

export function DashboardDetailsSkeleton() {
  return (
    <section aria-hidden="true" className="grid min-w-0 gap-4 xl:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.6fr)]">
        <ChartSkeleton compact />
        <PatientTableSkeleton />
    </section>
  )
}

export function DashboardContentSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-5">
      <DashboardHeadingSkeleton />
      <DashboardMetricsSkeleton />
      <DashboardChartsSkeleton />
      <DashboardDetailsSkeleton />
    </div>
  )
}

export function DashboardSkeleton({ notice }: { notice?: ReactNode }) {
  return (
    <div className="dark min-h-screen min-w-0 overflow-x-clip bg-[#070908] text-neutral-100">
      <SidebarSkeleton />
      <div className="min-w-0 lg:pl-64">
        <HeaderSkeleton />
        {notice && (
          <div className="fixed inset-x-4 top-20 z-40 sm:inset-x-6 lg:right-6 lg:left-[17.5rem] lg:top-24 xl:right-7 xl:left-[17.75rem]">
            {notice}
          </div>
        )}
        <main className="min-h-[calc(100vh-4rem)] w-full min-w-0 bg-[radial-gradient(circle_at_65%_-10%,rgba(124,58,237,0.07),transparent_29%),#070908] px-4 py-6 sm:px-6 sm:py-8 lg:min-h-[calc(100vh-5rem)] lg:px-6 lg:py-7 xl:px-7">
          <DashboardContentSkeleton />
        </main>
      </div>
    </div>
  )
}
