import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("skeleton-shimmer relative overflow-hidden rounded-md border border-white/10 bg-white/[0.065]", className)}
      {...props}
    />
  )
}

export { Skeleton }
