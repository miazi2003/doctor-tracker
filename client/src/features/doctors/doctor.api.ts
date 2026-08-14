import { z } from "zod"

import {
  ApiClientError,
  apiRequest,
  type ApiResponse,
} from "@/lib/api-client"

import {
  doctorSchema,
  type CreateDoctorValues,
  type Doctor,
  type DoctorListParameters,
  type DoctorPagination,
} from "./doctor.schema"

const paginationSchema = z
  .object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  })
  .strict()

const doctorListResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({ doctors: z.array(doctorSchema) }).strict(),
    pagination: paginationSchema,
  })
  .strict()

const doctorResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.object({ doctor: doctorSchema }).strict(),
  })
  .strict()

const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    issues: z
      .array(z.object({ field: z.string(), message: z.string() }))
      .optional(),
  }),
})

export type DoctorApiErrorKind =
  | "network"
  | "validation"
  | "duplicate"
  | "not-found"
  | "unexpected"

export interface DoctorFieldIssue {
  field: string
  message: string
}

export class DoctorApiError extends Error {
  public readonly issues: DoctorFieldIssue[]

  public constructor(
    public readonly kind: DoctorApiErrorKind,
    issues: DoctorFieldIssue[] = [],
  ) {
    super(kind)
    this.name = "DoctorApiError"
    this.issues = issues
  }
}

export interface DoctorListResult {
  doctors: Doctor[]
  pagination: DoctorPagination
}

const mapRequestError = (error: unknown): DoctorApiError =>
  error instanceof ApiClientError && error.kind === "network"
    ? new DoctorApiError("network")
    : new DoctorApiError("unexpected")

const buildDoctorListPath = (parameters: DoctorListParameters): `/${string}` => {
  const query = new URLSearchParams({
    page: String(parameters.page),
    limit: String(parameters.limit),
  })

  const optionalParameters = {
    search: parameters.search,
    specialization: parameters.specialization,
    hospital: parameters.hospital,
    startDate: parameters.startDate,
    endDate: parameters.endDate,
  }

  for (const [name, value] of Object.entries(optionalParameters)) {
    if (value !== undefined && value.length > 0) {
      query.set(name, value)
    }
  }

  return `/api/doctors?${query.toString()}`
}

const parseErrorIssues = (apiResponse: ApiResponse): DoctorFieldIssue[] => {
  const result = errorResponseSchema.safeParse(apiResponse.payload)
  return result.success ? (result.data.error.issues ?? []) : []
}

export const getDoctors = async (
  parameters: DoctorListParameters,
  signal?: AbortSignal,
): Promise<DoctorListResult> => {
  let apiResponse: ApiResponse

  try {
    apiResponse = await apiRequest(buildDoctorListPath(parameters), {
      ...(signal === undefined ? {} : { signal }),
    })
  } catch (error: unknown) {
    throw mapRequestError(error)
  }

  if (!apiResponse.response.ok) {
    throw new DoctorApiError("unexpected")
  }

  const result = doctorListResponseSchema.safeParse(apiResponse.payload)
  if (!result.success) {
    throw new DoctorApiError("unexpected")
  }

  return {
    doctors: result.data.data.doctors,
    pagination: result.data.pagination,
  }
}

export const getDoctor = async (
  doctorId: string,
  signal?: AbortSignal,
): Promise<Doctor> => {
  let apiResponse: ApiResponse

  try {
    apiResponse = await apiRequest(`/api/doctors/${doctorId}`, {
      ...(signal === undefined ? {} : { signal }),
    })
  } catch (error: unknown) {
    throw mapRequestError(error)
  }

  if (apiResponse.response.status === 404) {
    throw new DoctorApiError("not-found")
  }

  if (!apiResponse.response.ok) {
    throw new DoctorApiError("unexpected")
  }

  const result = doctorResponseSchema.safeParse(apiResponse.payload)
  if (!result.success) {
    throw new DoctorApiError("unexpected")
  }

  return result.data.data.doctor
}

export const createDoctor = async (
  values: CreateDoctorValues,
): Promise<Doctor> => {
  let apiResponse: ApiResponse

  try {
    apiResponse = await apiRequest("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
  } catch (error: unknown) {
    throw mapRequestError(error)
  }

  if (apiResponse.response.status === 400) {
    throw new DoctorApiError("validation", parseErrorIssues(apiResponse))
  }

  if (apiResponse.response.status === 409) {
    throw new DoctorApiError("duplicate")
  }

  if (!apiResponse.response.ok) {
    throw new DoctorApiError("unexpected")
  }

  const result = doctorResponseSchema.safeParse(apiResponse.payload)
  if (!result.success) {
    throw new DoctorApiError("unexpected")
  }

  return result.data.data.doctor
}
