import { Separator } from "@/components/ui/separator"

import { Brand } from "./brand"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarLogoutButton } from "./sidebar-logout-button"

export function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.055),transparent_24%),#070908] lg:flex lg:flex-col">
      <div className="flex h-20 items-center px-6">
        <Brand />
      </div>
      <Separator className="bg-white/10" />
      <div className="flex-1 px-4 py-6">
        <SidebarNavigation />
      </div>
      <div className="border-t border-white/10 px-6 py-5">
        <SidebarLogoutButton />
        <p className="mt-3 px-3 text-xs leading-5 text-neutral-500">
          Secure administration portal
        </p>
      </div>
    </aside>
  )
}
