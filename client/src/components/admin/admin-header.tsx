"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"

import { getAdminPageTitle } from "./admin-navigation"
import { AdminUserMenu } from "./admin-user-menu"
import { MobileNavigation } from "./mobile-navigation"

export function AdminHeader() {
  const pathname = usePathname()
  const title = getAdminPageTitle(pathname)

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
      <div className="flex h-16 min-w-0 items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-8 xl:px-10">
        <MobileNavigation />
        <Separator orientation="vertical" className="h-5 lg:hidden" />
        <div className="min-w-0 flex-1">
          <p className="hidden text-xs font-medium tracking-wide text-neutral-500 sm:block">
            Admin portal
          </p>
          <h1 className="truncate text-lg font-semibold tracking-[-0.02em] text-neutral-950 sm:mt-0.5 sm:text-xl">
            {title}
          </h1>
        </div>
        <AdminUserMenu />
      </div>
    </header>
  )
}
