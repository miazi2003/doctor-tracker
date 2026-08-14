import type { ReactNode } from "react"

import { AdminHeader } from "./admin-header"
import { DesktopSidebar } from "./desktop-sidebar"

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-screen min-w-0 overflow-x-clip bg-[#070908] text-neutral-100">
      <DesktopSidebar />
      <div className="min-w-0 lg:pl-64">
        <AdminHeader />
        {children}
      </div>
    </div>
  )
}
