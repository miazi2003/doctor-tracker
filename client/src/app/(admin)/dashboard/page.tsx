import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Doctor Tracker",
}

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white p-8 text-neutral-950 sm:p-10">
        <p className="text-sm font-medium text-neutral-500">Doctor Tracker</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
          Admin dashboard
        </h1>
        <p className="mt-3 leading-6 text-neutral-600">
          Authentication is active. The full dashboard will be built next.
        </p>
      </div>
    </main>
  )
}
