import { z } from "zod"

import {
  ApiClientError,
  apiRequest,
  type ApiResponse,
} from "@/lib/api-client"

import type { LoginValues } from "./login.schema"
import { currentAdminSchema, type CurrentAdmin } from "./current-admin.api"

const loginSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    admin: currentAdminSchema,
  }),
})

export type LoginErrorKind =
  | "credentials"
  | "validation"
  | "network"
  | "unexpected"

export class LoginError extends Error {
  public constructor(public readonly kind: LoginErrorKind) {
    super(kind)
    this.name = "LoginError"
  }
}

export const loginAdmin = async (values: LoginValues): Promise<CurrentAdmin> => {
  let apiResponse: ApiResponse

  try {
    apiResponse = await apiRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
  } catch (error: unknown) {
    if (error instanceof ApiClientError && error.kind === "network") {
      throw new LoginError("network")
    }

    throw new LoginError("unexpected")
  }

  if (apiResponse.response.status === 400) {
    throw new LoginError("validation")
  }

  if (apiResponse.response.status === 401) {
    throw new LoginError("credentials")
  }

  if (!apiResponse.response.ok) {
    throw new LoginError("unexpected")
  }

  const result = loginSuccessSchema.safeParse(apiResponse.payload)

  if (!result.success) {
    throw new LoginError("unexpected")
  }

  return result.data.data.admin
}
