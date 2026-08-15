import { RefreshCw, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export function AuthErrorScreen({
  isNetworkError,
  isRetrying,
  onRetry,
}: {
  isNetworkError: boolean
  isRetrying: boolean
  onRetry: () => void
}) {
  return (
    <DashboardSkeleton
      notice={
        <div
          className="flex flex-col gap-4 rounded-2xl border border-red-300/15 bg-[linear-gradient(145deg,rgba(127,29,29,0.18),rgba(20,12,18,0.88))] p-5 shadow-xl shadow-black/20 sm:flex-row sm:items-center"
          role="alert"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-medium text-neutral-100">We couldn&apos;t verify your session</h1>
            <p className="mt-1 text-sm leading-6 text-neutral-400">
              {isNetworkError
                ? "The secure server took too long to respond or could not be reached. Check your connection, then try again."
                : "The server returned an unexpected response. Please try again."}
            </p>
          </div>
          <Button className="h-10 shrink-0" onClick={onRetry} disabled={isRetrying}>
            <RefreshCw className={isRetrying ? "animate-spin motion-reduce:animate-none" : undefined} aria-hidden="true" />
            {isRetrying ? "Trying again…" : "Try again"}
          </Button>
        </div>
      }
    />
  )
}
