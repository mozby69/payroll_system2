import { AxiosError } from "axios"

type ApiErrorResponse = {
  message?: string
}

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as ApiErrorResponse)?.message ||
      error.message ||
      "Request failed"
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Unexpected error occurred"
}