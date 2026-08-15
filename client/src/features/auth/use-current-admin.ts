"use client"

import { useQuery } from "@tanstack/react-query"

import {
  CurrentAdminError,
  getCurrentAdmin,
  type CurrentAdmin,
  type CurrentAdminResult,
} from "./current-admin.api"
import { authQueryKeys } from "./auth.queries"

export type CurrentAdminState =
  | { status: "loading"; admin: null; error: null; retry: null }
  | { status: "authenticated"; admin: CurrentAdmin; error: null; retry: null }
  | { status: "unauthenticated"; admin: null; error: null; retry: null }
  | {
      status: "network-error" | "unexpected-error"
      admin: null
      error: CurrentAdminError
      isRetrying: boolean
      retry: () => void
    }

export const useCurrentAdmin = (): CurrentAdminState => {
  const query = useQuery<CurrentAdminResult, CurrentAdminError>({
    queryKey: authQueryKeys.currentAdmin,
    queryFn: ({ signal }) => getCurrentAdmin(signal),
    staleTime: 5 * 60 * 1_000,
    retry: false,
    refetchOnWindowFocus: false,
  })

  if (query.isPending) {
    return { status: "loading", admin: null, error: null, retry: null }
  }

  if (query.isError) {
    return {
      status:
        query.error.kind === "network" ? "network-error" : "unexpected-error",
      admin: null,
      error: query.error,
      isRetrying: query.isFetching,
      retry: () => {
        void query.refetch()
      },
    }
  }

  if (query.data.status === "unauthenticated") {
    return {
      status: "unauthenticated",
      admin: null,
      error: null,
      retry: null,
    }
  }

  return {
    status: "authenticated",
    admin: query.data.admin,
    error: null,
    retry: null,
  }
}
