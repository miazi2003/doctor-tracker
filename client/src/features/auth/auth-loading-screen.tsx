import { LoaderCircle, ShieldCheck } from "lucide-react"

export function AuthLoadingScreen({
  message = "Checking your secure session",
}: {
  message?: string
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <div className="flex max-w-sm flex-col items-center text-center" role="status" aria-live="polite">
        <span className="mb-6 flex size-12 items-center justify-center rounded-xl border border-white/15 bg-white/8">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>
        <LoaderCircle className="size-6 animate-spin text-neutral-400" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium text-neutral-200">{message}</p>
        <span className="sr-only">Loading</span>
      </div>
    </main>
  )
}
