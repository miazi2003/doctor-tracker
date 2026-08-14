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
                  "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-neutral-400 outline-none transition-all hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-white/60",
                  isActive && "bg-[linear-gradient(135deg,#ffffff,#d8d8d8)] text-neutral-950 shadow-[0_10px_30px_rgba(255,255,255,0.08)] hover:bg-white hover:text-neutral-950",
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
