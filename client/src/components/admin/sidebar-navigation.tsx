"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

import { adminNavigation } from "./admin-navigation"

export function SidebarNavigation({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin navigation">
      <ul className="space-y-1">
        {adminNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                {...(onNavigate === undefined ? {} : { onClick: onNavigate })}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-neutral-400 outline-none transition-colors hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60",
                  isActive && "bg-white text-neutral-950 hover:bg-white hover:text-neutral-950",
                )}
              >
                <Icon className="size-[1.125rem]" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
