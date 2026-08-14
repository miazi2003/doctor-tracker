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
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070908] text-white">
      <div className="flex h-16 min-w-0 items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-6 xl:px-7">
        <MobileNavigation />
        <Separator orientation="vertical" className="h-5 bg-white/10 lg:hidden" />
        <div className="min-w-0 flex-1">
          <p className="hidden text-[0.72rem] font-medium tracking-[0.12em] text-neutral-500 uppercase sm:block">
            Admin portal
          </p>
          <h1 className="truncate text-base font-medium tracking-[-0.02em] text-neutral-100 sm:mt-0.5 sm:text-lg">
            {title}
          </h1>
        </div>
        <AdminUserMenu />
      </div>
    </header>
  )
}
