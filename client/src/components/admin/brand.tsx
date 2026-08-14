import { HeartPulse } from "lucide-react"

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white">
        <HeartPulse className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-[-0.01em] text-white">
          Doctor Tracker
        </p>
        <p className="text-xs text-neutral-500">Admin workspace</p>
      </div>
    </div>
  )
}
