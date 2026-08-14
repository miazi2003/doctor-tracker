import { z } from "zod"

import { ApiClientError, apiRequest, type ApiResponse } from "@/lib/api-client"

import { globalPatientSchema, patientSchema, type CreatePatientPayload, type GlobalPatient, type Patient, type PatientListParameters, type PatientPagination } from "./patient.schema"

const paginationSchema = z.object({
  page: z.number().int().positive(), limit: z.number().int().positive(),
  total: z.number().int().nonnegative(), totalPages: z.number().int().nonnegative(),
}).strict()
const listResponseSchema = z.object({
  success: z.literal(true), data: z.object({ patients: z.array(patientSchema) }).strict(), pagination: paginationSchema,
}).strict()
const globalListResponseSchema = z.object({
  success: z.literal(true), data: z.object({ patients: z.array(globalPatientSchema) }).strict(), pagination: paginationSchema,
}).strict()
const patientResponseSchema = z.object({
  success: z.literal(true), data: z.object({ patient: patientSchema }).strict(),
}).strict()
const errorResponseSchema = z.object({
  success: z.literal(false), error: z.object({
    message: z.string(), issues: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
  }),
})

export type PatientApiErrorKind = "network" | "validation" | "not-found" | "unexpected"
export interface PatientFieldIssue { field: string; message: string }
export class PatientApiError extends Error {
  public constructor(public readonly kind: PatientApiErrorKind, public readonly issues: PatientFieldIssue[] = []) {
    super(kind); this.name = "PatientApiError"
  }
}
export interface PatientListResult { patients: Patient[]; pagination: PatientPagination }
export interface GlobalPatientListResult { patients: GlobalPatient[]; pagination: PatientPagination }

const mapError = (error: unknown): PatientApiError =>
  error instanceof ApiClientError && error.kind === "network" ? new PatientApiError("network") : new PatientApiError("unexpected")
const parseIssues = (response: ApiResponse): PatientFieldIssue[] => {
  const result = errorResponseSchema.safeParse(response.payload)
  return result.success ? (result.data.error.issues ?? []) : []
}

export async function getDoctorPatients(doctorId: string, parameters: PatientListParameters, signal?: AbortSignal): Promise<PatientListResult> {
  const query = new URLSearchParams({ page: String(parameters.page), limit: String(parameters.limit) })
  for (const [key, value] of Object.entries({ search: parameters.search, condition: parameters.condition, startDate: parameters.startDate, endDate: parameters.endDate })) {
    if (value !== undefined && value.length > 0) query.set(key, value)
  }
  let response: ApiResponse
  try { response = await apiRequest(`/api/doctors/${doctorId}/patients?${query.toString()}`, signal === undefined ? undefined : { signal }) }
  catch (error: unknown) { throw mapError(error) }
  if (response.response.status === 404) throw new PatientApiError("not-found")
  if (!response.response.ok) throw new PatientApiError("unexpected")
  const result = listResponseSchema.safeParse(response.payload)
  if (!result.success) throw new PatientApiError("unexpected")
  return { patients: result.data.data.patients, pagination: result.data.pagination }
}

export async function getPatients(parameters: PatientListParameters, signal?: AbortSignal): Promise<GlobalPatientListResult> {
  const query = new URLSearchParams({ page: String(parameters.page), limit: String(parameters.limit) })
  for (const [key, value] of Object.entries({ search: parameters.search, condition: parameters.condition, doctorId: parameters.doctorId, startDate: parameters.startDate, endDate: parameters.endDate })) {
    if (value !== undefined && value.length > 0) query.set(key, value)
  }
  let response: ApiResponse
  try { response = await apiRequest(`/api/patients?${query.toString()}`, signal === undefined ? undefined : { signal }) }
  catch (error: unknown) { throw mapError(error) }
  if (!response.response.ok) throw new PatientApiError("unexpected")
  const result = globalListResponseSchema.safeParse(response.payload)
  if (!result.success) throw new PatientApiError("unexpected")
  return { patients: result.data.data.patients, pagination: result.data.pagination }
}

export async function createPatient(doctorId: string, values: CreatePatientPayload): Promise<Patient> {
  let response: ApiResponse
  try { response = await apiRequest(`/api/doctors/${doctorId}/patients`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }) }
  catch (error: unknown) { throw mapError(error) }
  if (response.response.status === 400) throw new PatientApiError("validation", parseIssues(response))
  if (response.response.status === 404) throw new PatientApiError("not-found")
  if (!response.response.ok) throw new PatientApiError("unexpected")
  const result = patientResponseSchema.safeParse(response.payload)
  if (!result.success) throw new PatientApiError("unexpected")
  return result.data.data.patient
}

export async function deletePatient(patientId: string): Promise<Patient> {
  let response: ApiResponse
  try { response = await apiRequest(`/api/patients/${patientId}`, { method: "DELETE" }) }
  catch (error: unknown) { throw mapError(error) }
  if (response.response.status === 404) throw new PatientApiError("not-found")
  if (!response.response.ok) throw new PatientApiError("unexpected")
  const result = patientResponseSchema.safeParse(response.payload)
  if (!result.success) throw new PatientApiError("unexpected")
  return result.data.data.patient
}

export async function updatePatient(patientId: string, values: CreatePatientPayload): Promise<Patient> {
  let response: ApiResponse
  try { response = await apiRequest(`/api/patients/${patientId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }) }
  catch (error: unknown) { throw mapError(error) }
  if (response.response.status === 400) throw new PatientApiError("validation", parseIssues(response))
  if (response.response.status === 404) throw new PatientApiError("not-found")
  if (!response.response.ok) throw new PatientApiError("unexpected")
  const result = patientResponseSchema.safeParse(response.payload)
  if (!result.success) throw new PatientApiError("unexpected")
  return result.data.data.patient
}
