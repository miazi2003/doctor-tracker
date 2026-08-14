import { Separator } from "@/components/ui/separator"

import { Brand } from "./brand"
import { SidebarNavigation } from "./sidebar-navigation"

export function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-800 bg-neutral-950 lg:flex lg:flex-col">
      <div className="flex h-20 items-center px-6">
        <Brand />
      </div>
      <Separator className="bg-neutral-800" />
      <div className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-[0.6875rem] font-semibold tracking-[0.14em] text-neutral-600 uppercase">
          Workspace
        </p>
        <SidebarNavigation />
      </div>
      <div className="border-t border-neutral-800 px-6 py-5">
        <p className="text-xs leading-5 text-neutral-600">
          Secure administration portal
        </p>
      </div>
    </aside>
  )
}
