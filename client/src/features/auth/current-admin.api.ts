import { z } from "zod"

import {
  ApiClientError,
  apiRequest,
  type ApiResponse,
} from "@/lib/api-client"

export const currentAdminSchema = z
  .object({
    id: z.string().regex(/^[a-f\d]{24}$/iu),
    name: z.string(),
    email: z.email(),
    role: z.literal("admin"),
  })
  .strict()

const currentAdminResponseSchema = z
  .object({
    success: z.literal(true),
    data: z
      .object({
        admin: currentAdminSchema,
      })
      .strict(),
  })
  .strict()

export type CurrentAdmin = z.infer<
  typeof currentAdminResponseSchema
>["data"]["admin"]

export type CurrentAdminResult =
  | { status: "authenticated"; admin: CurrentAdmin }
  | { status: "unauthenticated"; admin: null }

export type CurrentAdminErrorKind = "network" | "unexpected"

const SESSION_TIMEOUT_MS = 30_000

export class CurrentAdminError extends Error {
  public constructor(public readonly kind: CurrentAdminErrorKind) {
    super(kind)
    this.name = "CurrentAdminError"
  }
}

export const getCurrentAdmin = async (signal?: AbortSignal): Promise<CurrentAdminResult> => {
  let apiResponse: ApiResponse
  const controller = new AbortController()
  let didTimeout = false
  const cancelRequest = (): void => controller.abort(signal?.reason)
  const timeout = setTimeout(() => {
    didTimeout = true
    controller.abort()
  }, SESSION_TIMEOUT_MS)

  signal?.addEventListener("abort", cancelRequest, { once: true })

  try {
    apiResponse = await apiRequest("/api/auth/me", { signal: controller.signal })
  } catch (error: unknown) {
    if (didTimeout || (error instanceof ApiClientError && error.kind === "network")) {
      throw new CurrentAdminError("network")
    }

    throw new CurrentAdminError("unexpected")
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener("abort", cancelRequest)
  }

  if (apiResponse.response.status === 401 || apiResponse.response.status === 403) {
    return { status: "unauthenticated", admin: null }
  }

  if (!apiResponse.response.ok) {
    throw new CurrentAdminError("unexpected")
  }

  const result = currentAdminResponseSchema.safeParse(apiResponse.payload)

  if (!result.success) {
    throw new CurrentAdminError("unexpected")
  }

  return { status: "authenticated", admin: result.data.data.admin }
}
