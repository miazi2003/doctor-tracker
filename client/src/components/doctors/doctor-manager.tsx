"use client"

import { useQuery } from "@tanstack/react-query"
import { LoaderCircle, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { PageContainer } from "@/components/admin/page-container"
import { Button } from "@/components/ui/button"
import { DoctorApiError } from "@/features/doctors/doctor.api"
import { doctorListQueryOptions } from "@/features/doctors/doctor.queries"
import type { DoctorListParameters } from "@/features/doctors/doctor.schema"

import {
  DoctorList,
  DoctorListEmpty,
  DoctorListError,
  DoctorListSkeleton,
} from "./doctor-list-content"
import {
  DoctorListFilters,
  type DoctorFilterValues,
} from "./doctor-list-filters"
import { DoctorPagination } from "./doctor-pagination"

const readPositiveInteger = (
  value: string | null,
  fallback: number,
  allowed?: readonly number[],
): number => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return fallback
  return allowed === undefined || allowed.includes(parsed) ? parsed : fallback
}

const optionalParameter = (value: string): string | undefined => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function DoctorManager() {
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get("search") ?? ""

  return <DoctorManagerContent key={urlSearch} urlSearch={urlSearch} />
}

function DoctorManagerContent({ urlSearch }: { urlSearch: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const serializedSearchParams = searchParams.toString()
  const [searchInput, setSearchInput] = useState(urlSearch)

  const page = readPositiveInteger(searchParams.get("page"), 1)
  const limit = readPositiveInteger(searchParams.get("limit"), 20, [10, 20, 50])
  const filters: DoctorFilterValues = {
    specialization: searchParams.get("specialization") ?? "",
    hospital: searchParams.get("hospital") ?? "",
    startDate: searchParams.get("startDate") ?? "",
    endDate: searchParams.get("endDate") ?? "",
  }

  const updateUrl = useCallback(
    (
      updates: Readonly<Record<string, string | null>>,
      options: { resetPage?: boolean } = {},
    ): void => {
      const next = new URLSearchParams(serializedSearchParams)
      for (const [name, value] of Object.entries(updates)) {
        if (value === null || value.length === 0) next.delete(name)
        else next.set(name, value)
      }
      if (options.resetPage === true) next.delete("page")
      const query = next.toString()
      router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, serializedSearchParams],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmedSearch = searchInput.trim()
      if (trimmedSearch !== urlSearch) {
        updateUrl({ search: trimmedSearch || null }, { resetPage: true })
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchInput, updateUrl, urlSearch])

  const parameters = useMemo<DoctorListParameters>(
    () => {
      const search = optionalParameter(urlSearch)
      const specialization = optionalParameter(filters.specialization)
      const hospital = optionalParameter(filters.hospital)

      return {
        page,
        limit,
        ...(search === undefined ? {} : { search }),
        ...(specialization === undefined ? {} : { specialization }),
        ...(hospital === undefined ? {} : { hospital }),
        ...(filters.startDate.length === 0 ? {} : { startDate: filters.startDate }),
        ...(filters.endDate.length === 0 ? {} : { endDate: filters.endDate }),
      }
    },
    [filters.endDate, filters.hospital, filters.specialization, filters.startDate, limit, page, urlSearch],
  )
  const query = useQuery(doctorListQueryOptions(parameters))
  const hasFilters =
    urlSearch.length > 0 ||
    limit !== 20 ||
    Object.values(filters).some((value) => value.length > 0)

  const getPageHref = (nextPage: number): string => {
    const next = new URLSearchParams(serializedSearchParams)
    if (nextPage <= 1) next.delete("page")
    else next.set("page", String(nextPage))
    const queryString = next.toString()
    return queryString.length > 0 ? `${pathname}?${queryString}` : pathname
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-5 sm:gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-500">Directory</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
              Doctor management
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              Add doctors and find their contact and practice information.
            </p>
          </div>
          <Button size="lg" nativeButton={false} render={<Link href="/doctors/new" />}>
            <Plus aria-hidden="true" />
            Add doctor
          </Button>
        </div>

        <DoctorListFilters
          search={searchInput}
          appliedSearch={urlSearch}
          filters={filters}
          limit={limit}
          hasFilters={hasFilters}
          onSearchChange={setSearchInput}
          onDateApply={(startDate, endDate) =>
            updateUrl(
              { startDate: startDate || null, endDate: endDate || null },
              { resetPage: true },
            )
          }
          onSecondaryApply={(values) =>
            updateUrl(
              {
                specialization: values.specialization.trim() || null,
                hospital: values.hospital.trim() || null,
                limit: values.limit === 20 ? null : String(values.limit),
              },
              { resetPage: true },
            )
          }
          onRemoveFilter={(name) => {
            if (name === "search") setSearchInput("")
            if (name === "startDate" || name === "endDate") {
              updateUrl({ startDate: null, endDate: null }, { resetPage: true })
              return
            }
            updateUrl({ [name]: null }, { resetPage: true })
          }}
          onClear={() => {
            setSearchInput("")
            router.replace(pathname, { scroll: false })
          }}
        />

        {query.isPending ? (
          <DoctorListSkeleton />
        ) : query.isError ? (
          <DoctorListError
            isNetworkError={
              query.error instanceof DoctorApiError && query.error.kind === "network"
            }
            onRetry={() => void query.refetch()}
          />
        ) : query.data.doctors.length === 0 ? (
          <DoctorListEmpty filtered={hasFilters} />
        ) : (
          <section aria-label="Doctors" className="relative space-y-5">
            {query.isFetching && (
              <div className="absolute -top-9 right-0 flex items-center gap-2 text-xs text-neutral-500" role="status">
                <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                Updating
              </div>
            )}
            <DoctorList doctors={query.data.doctors} />
            <DoctorPagination
              pagination={query.data.pagination}
              getPageHref={getPageHref}
            />
          </section>
        )}
      </div>
    </PageContainer>
  )
}
