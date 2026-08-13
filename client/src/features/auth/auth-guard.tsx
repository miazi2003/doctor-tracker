"use client"

import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

import { AuthErrorScreen } from "./auth-error-screen"
import { AuthLoadingScreen } from "./auth-loading-screen"
import { useCurrentAdmin } from "./use-current-admin"

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const auth = useCurrentAdmin()

  useEffect(() => {
    if (auth.status === "unauthenticated") {
      router.replace("/login")
    }
  }, [auth.status, router])

  if (auth.status === "network-error" || auth.status === "unexpected-error") {
    return (
      <AuthErrorScreen
        isNetworkError={auth.status === "network-error"}
        onRetry={auth.retry}
      />
    )
  }

  if (auth.status !== "authenticated") {
    return auth.status === "unauthenticated" ? (
      <AuthLoadingScreen message="Returning you to sign in" />
    ) : (
      <AuthLoadingScreen />
    )
  }

  return children
}
