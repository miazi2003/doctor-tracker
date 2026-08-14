import { ApiClientError, apiRequest } from "@/lib/api-client"

export class LogoutError extends Error {
  public constructor() {
    super("logout")
    this.name = "LogoutError"
  }
}

export const logoutAdmin = async (): Promise<void> => {
  try {
    const { response } = await apiRequest("/api/auth/logout", {
      method: "POST",
    })

    if (!response.ok) {
      throw new LogoutError()
    }
  } catch (error: unknown) {
    if (error instanceof LogoutError) {
      throw error
    }

    if (error instanceof ApiClientError) {
      throw new LogoutError()
    }

    throw new LogoutError()
  }
}
