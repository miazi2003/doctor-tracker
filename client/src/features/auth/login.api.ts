import { z } from "zod"

import {
  ApiClientError,
  apiRequest,
  type ApiResponse,
} from "@/lib/api-client"

import type { LoginValues } from "./login.schema"

const loginSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    admin: z.object({
      id: z.string(),
      name: z.string(),
      email: z.email(),
      role: z.literal("admin"),
    }),
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

export const loginAdmin = async (values: LoginValues): Promise<void> => {
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

  if (!loginSuccessSchema.safeParse(apiResponse.payload).success) {
    throw new LoginError("unexpected")
  }
}
