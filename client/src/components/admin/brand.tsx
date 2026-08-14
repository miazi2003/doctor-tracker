import Image from "next/image"

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.035))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <Image src="/favicon.ico" alt="" width={24} height={24} unoptimized />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-[-0.02em] text-white">
          Doctor Tracker
        </p>
        <p className="mt-0.5 text-[0.75rem] text-neutral-500">Admin workspace</p>
      </div>
    </div>
  )
}
