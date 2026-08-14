import { RefreshCw, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

export function AuthErrorScreen({
  isNetworkError,
  onRetry,
}: {
  isNetworkError: boolean
  onRetry: () => void
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[linear-gradient(145deg,#151816,#0d0f0e)] p-7 text-neutral-100 shadow-2xl shadow-black/30 sm:p-9" role="alert">
        <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.025em]">
          We couldn&apos;t verify your session
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          {isNetworkError
            ? "Check your connection, then try again."
            : "The server could not verify your session right now. Please try again."}
        </p>
        <Button className="mt-7 h-10 w-full" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
      </div>
    </main>
  )
}
