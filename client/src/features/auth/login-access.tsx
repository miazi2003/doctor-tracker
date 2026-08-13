"use client"

import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

import { AuthLoadingScreen } from "./auth-loading-screen"
import { useCurrentAdmin } from "./use-current-admin"

export function LoginAccess({ children }: { children: ReactNode }) {
  const router = useRouter()
  const auth = useCurrentAdmin()

  useEffect(() => {
    if (auth.status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [auth.status, router])

  if (auth.status === "loading" || auth.status === "authenticated") {
    return (
      <AuthLoadingScreen
        message={
          auth.status === "authenticated"
            ? "Opening your dashboard"
            : "Checking your secure session"
        }
      />
    )
  }

  return children
}
