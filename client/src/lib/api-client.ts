export type ApiClientErrorKind = "configuration" | "network"

export class ApiClientError extends Error {
  public constructor(public readonly kind: ApiClientErrorKind) {
    super(kind)
    this.name = "ApiClientError"
  }
}

export interface ApiResponse {
  response: Response
  payload: unknown
}

const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (apiUrl === undefined || apiUrl.length === 0) {
    throw new ApiClientError("configuration")
  }

  return apiUrl.replace(/\/$/u, "")
}

export const apiRequest = async (
  path: `/${string}`,
  init?: RequestInit,
): Promise<ApiResponse> => {
  let response: Response

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      credentials: "include",
    })
  } catch (error: unknown) {
    if (error instanceof ApiClientError) {
      throw error
    }

    throw new ApiClientError("network")
  }

  const payload: unknown = await response.json().catch(() => undefined)
  return { response, payload }
}
