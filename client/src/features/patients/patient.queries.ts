import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { getDoctorPatients, getPatients, PatientApiError } from "./patient.api"
import type { PatientListParameters } from "./patient.schema"

export const patientQueryKeys = {
  all: ["patients"] as const,
  lists: () => ["patients", "list"] as const,
  globalLists: () => ["patients", "list", "global"] as const,
  globalList: (parameters: PatientListParameters) => ["patients", "list", "global", parameters] as const,
  doctorLists: (doctorId: string) => ["patients", "list", "doctor", doctorId] as const,
  doctorList: (doctorId: string, parameters: PatientListParameters) => ["patients", "list", "doctor", doctorId, parameters] as const,
}

export const patientListQueryOptions = (parameters: PatientListParameters) => queryOptions({
  queryKey: patientQueryKeys.globalList(parameters),
  queryFn: ({ signal }) => getPatients(parameters, signal),
  placeholderData: keepPreviousData,
  staleTime: 30_000,
})

export const doctorPatientListQueryOptions = (doctorId: string, parameters: PatientListParameters) => queryOptions({
  queryKey: patientQueryKeys.doctorList(doctorId, parameters),
  queryFn: ({ signal }) => getDoctorPatients(doctorId, parameters, signal),
  placeholderData: keepPreviousData,
  staleTime: 30_000,
  retry: (count, error) => !(error instanceof PatientApiError && error.kind === "not-found") && count < 1,
})
