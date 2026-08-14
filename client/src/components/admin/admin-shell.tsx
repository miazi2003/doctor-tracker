import type { ReactNode } from "react"

import { AdminHeader } from "./admin-header"
import { DesktopSidebar } from "./desktop-sidebar"

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-neutral-50 text-neutral-950">
      <DesktopSidebar />
      <div className="min-w-0 lg:pl-64">
        <AdminHeader />
        {children}
      </div>
    </div>
  )
}
