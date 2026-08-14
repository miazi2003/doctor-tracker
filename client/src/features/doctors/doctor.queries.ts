import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { DoctorApiError, getDoctor, getDoctors } from "./doctor.api"
import type { DoctorListParameters } from "./doctor.schema"

export const doctorQueryKeys = {
  all: ["doctors"] as const,
  lists: () => ["doctors", "list"] as const,
  list: (parameters: DoctorListParameters) =>
    ["doctors", "list", parameters] as const,
  details: () => ["doctors", "detail"] as const,
  detail: (doctorId: string) => ["doctors", "detail", doctorId] as const,
}

export const doctorListQueryOptions = (parameters: DoctorListParameters) =>
  queryOptions({
    queryKey: doctorQueryKeys.list(parameters),
    queryFn: ({ signal }) => getDoctors(parameters, signal),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1_000,
  })

export const doctorDetailQueryOptions = (doctorId: string) =>
  queryOptions({
    queryKey: doctorQueryKeys.detail(doctorId),
    queryFn: ({ signal }) => getDoctor(doctorId, signal),
    staleTime: 60 * 1_000,
    retry: (failureCount, error) =>
      !(error instanceof DoctorApiError && error.kind === "not-found") &&
      failureCount < 1,
  })
