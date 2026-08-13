import { z } from "zod"

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

const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (apiUrl === undefined || apiUrl.length === 0) {
    throw new LoginError("unexpected")
  }

  return apiUrl.replace(/\/$/u, "")
}

export const loginAdmin = async (values: LoginValues): Promise<void> => {
  let response: Response

  try {
    response = await fetch(`${getApiUrl()}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
  } catch (error: unknown) {
    if (error instanceof LoginError) {
      throw error
    }

    throw new LoginError("network")
  }

  if (response.status === 400) {
    throw new LoginError("validation")
  }

  if (response.status === 401) {
    throw new LoginError("credentials")
  }

  if (!response.ok) {
    throw new LoginError("unexpected")
  }

  const payload: unknown = await response.json().catch(() => undefined)

  if (!loginSuccessSchema.safeParse(payload).success) {
    throw new LoginError("unexpected")
  }
}
