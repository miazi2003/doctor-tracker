"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ChevronDown, LoaderCircle, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authQueryKeys } from "@/features/auth/auth.queries"
import { logoutAdmin } from "@/features/auth/logout.api"
import { useCurrentAdmin } from "@/features/auth/use-current-admin"

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/u).filter(Boolean)
  const first = parts[0]?.[0] ?? "A"
  const last = parts.length > 1 ? parts.at(-1)?.[0] ?? "" : ""
  return `${first}${last}`.toUpperCase()
}

export function AdminUserMenu() {
  const adminState = useCurrentAdmin()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  if (adminState.status !== "authenticated") {
    return null
  }

  const { admin } = adminState

  const handleLogout = async (): Promise<void> => {
    setLogoutError(null)
    setIsLoggingOut(true)

    try {
      await logoutAdmin()
      await queryClient.cancelQueries({ queryKey: authQueryKeys.all })
      queryClient.removeQueries({ queryKey: authQueryKeys.currentAdmin })
      router.replace("/login")
    } catch {
      setLogoutError("We couldn’t sign you out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      {logoutError && (
        <Alert
          variant="destructive"
          className="fixed inset-x-4 top-[4.5rem] z-40 py-2 shadow-sm md:static md:max-w-xs"
        >
          <AlertDescription>{logoutError}</AlertDescription>
        </Alert>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isLoggingOut}
          render={
            <Button
              variant="ghost"
              className="h-auto min-w-0 gap-2 px-1.5 py-1 hover:bg-neutral-100 sm:gap-3 sm:px-2"
              aria-label="Open administrator menu"
            />
          }
        >
          <Avatar size="lg">
            <AvatarFallback className="bg-neutral-950 text-xs font-semibold text-white">
              {getInitials(admin.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block max-w-44 truncate text-sm font-medium text-neutral-950">
              {admin.name}
            </span>
            <span className="block max-w-44 truncate text-xs text-neutral-500">
              {admin.email}
            </span>
          </span>
          {isLoggingOut ? (
            <LoaderCircle className="size-4 animate-spin text-neutral-500" aria-hidden="true" />
          ) : (
            <ChevronDown className="hidden size-4 text-neutral-400 sm:block" aria-hidden="true" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="px-2 py-2">
            <span className="block truncate text-sm font-medium text-foreground">
              {admin.name}
            </span>
            <span className="mt-0.5 block truncate font-normal text-muted-foreground">
              {admin.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            className="min-h-9 px-2"
          >
            {isLoggingOut ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <LogOut aria-hidden="true" />
            )}
            {isLoggingOut ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
