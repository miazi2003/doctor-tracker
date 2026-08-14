"use client"

import { useQueryClient } from "@tanstack/react-query"
import { LoaderCircle, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { authQueryKeys } from "@/features/auth/auth.queries"
import { logoutAdmin } from "@/features/auth/logout.api"

export function SidebarLogoutButton() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (): Promise<void> => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logoutAdmin()
      await queryClient.cancelQueries({ queryKey: authQueryKeys.all })
      queryClient.removeQueries({ queryKey: authQueryKeys.currentAdmin })
      router.replace("/login")
    } catch {
      toast.error("We couldn’t sign you out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-10 w-full justify-start gap-3 rounded-[2rem] px-3 text-neutral-400 hover:bg-white/[0.07] hover:text-white"
      disabled={isLoggingOut}
      onClick={() => void handleLogout()}
    >
      {isLoggingOut ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <LogOut aria-hidden="true" />}
      {isLoggingOut ? "Signing out…" : "Log out"}
    </Button>
  )
}
