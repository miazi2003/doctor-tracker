"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Brand } from "./brand"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarLogoutButton } from "./sidebar-logout-button"

export function MobileNavigation() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 rounded-full text-neutral-300 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[18rem] gap-0 border-white/10 bg-[#070908] p-0 text-white sm:max-w-[18rem]"
      >
        <SheetHeader className="border-b border-white/10 px-5 py-5 text-left">
          <SheetTitle className="sr-only">Doctor Tracker navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate between protected administration pages.
          </SheetDescription>
          <Brand />
        </SheetHeader>
        <div className="flex flex-1 flex-col px-4 py-6">
          <SidebarNavigation onNavigate={() => setOpen(false)} />
          <div className="mt-auto border-t border-white/10 pt-4">
            <SidebarLogoutButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
