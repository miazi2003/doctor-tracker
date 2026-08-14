import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { DoctorPagination as DoctorPaginationData } from "@/features/doctors/doctor.schema"
import { cn } from "@/lib/utils"

export function DoctorPagination({
  pagination,
  getPageHref,
}: {
  pagination: DoctorPaginationData
  getPageHref: (page: number) => string
}) {
  if (pagination.totalPages <= 1) return null

  const hasPrevious = pagination.page > 1
  const hasNext = pagination.page < pagination.totalPages

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 sm:flex-row">
      <p className="text-sm text-neutral-500">
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} doctors
      </p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={hasPrevious ? getPageHref(pagination.page - 1) : "#"}
              aria-disabled={!hasPrevious}
              tabIndex={hasPrevious ? undefined : -1}
              className={cn(!hasPrevious && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href={hasNext ? getPageHref(pagination.page + 1) : "#"}
              aria-disabled={!hasNext}
              tabIndex={hasNext ? undefined : -1}
              className={cn(!hasNext && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
