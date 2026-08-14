import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <main
      className={cn(
        "w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
        className,
      )}
    >
      {children}
    </main>
  )
}
