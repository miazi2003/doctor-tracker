"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useLayoutEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { adminNavigation } from "./admin-navigation"

interface IndicatorGeometry {
  height: number
  width: number
  x: number
  y: number
}

export function SidebarNavigation({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const navigationRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>())
  const indicatorGeometryRef = useRef<IndicatorGeometry | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [indicator, setIndicator] = useState<IndicatorGeometry | null>(null)
  const activeHref = adminNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )?.href

  const measureIndicator = useCallback((): void => {
    const navigation = navigationRef.current
    const activeItem = activeHref === undefined ? undefined : itemRefs.current.get(activeHref)
    if (navigation === null || activeItem === undefined) return

    const navigationRect = navigation.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()
    const nextIndicator = {
      height: itemRect.height,
      width: itemRect.width,
      x: itemRect.left - navigationRect.left,
      y: itemRect.top - navigationRect.top,
    }
    const previousIndicator = indicatorGeometryRef.current
    const unchanged = previousIndicator !== null &&
      previousIndicator.height === nextIndicator.height &&
      previousIndicator.width === nextIndicator.width &&
      previousIndicator.x === nextIndicator.x &&
      previousIndicator.y === nextIndicator.y
    if (unchanged) return

    indicatorGeometryRef.current = nextIndicator
    setIndicator(nextIndicator)

    if (previousIndicator === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = window.requestAnimationFrame(() => {
      const element = indicatorRef.current
      if (element === null) return
      for (const animation of element.getAnimations()) animation.cancel()
      element.animate(
        [
          {
            height: `${String(previousIndicator.height)}px`,
            transform: `translate3d(${String(previousIndicator.x)}px, ${String(previousIndicator.y)}px, 0)`,
            width: `${String(previousIndicator.width)}px`,
          },
          {
            height: `${String(nextIndicator.height)}px`,
            transform: `translate3d(${String(nextIndicator.x)}px, ${String(nextIndicator.y)}px, 0)`,
            width: `${String(nextIndicator.width)}px`,
          },
        ],
        {
          duration: 420,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      )
    })
  }, [activeHref])

  useLayoutEffect(() => {
    measureIndicator()
    const observer = new ResizeObserver(measureIndicator)
    if (navigationRef.current !== null) observer.observe(navigationRef.current)
    for (const item of itemRefs.current.values()) observer.observe(item)
    window.addEventListener("resize", measureIndicator)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measureIndicator)
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current)
    }
  }, [measureIndicator])

  return (
    <nav ref={navigationRef} aria-label="Admin navigation" className="relative">
      {indicator !== null && (
        <div
          ref={indicatorRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-0 rounded-xl bg-[linear-gradient(135deg,#ffffff,#d8d8d8)] shadow-[0_10px_30px_rgba(255,255,255,0.08)] will-change-transform"
          style={{
            height: indicator.height,
            width: indicator.width,
            transform: `translate3d(${String(indicator.x)}px, ${String(indicator.y)}px, 0)`,
          }}
        />
      )}
      <ul className="relative z-10 space-y-1">
        {adminNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                ref={(node) => {
                  if (node === null) itemRefs.current.delete(item.href)
                  else itemRefs.current.set(item.href, node)
                }}
                {...(onNavigate === undefined ? {} : { onClick: onNavigate })}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-white/60 motion-reduce:transition-none",
                  isActive
                    ? "text-neutral-950"
                    : "text-neutral-400 hover:bg-white/[0.07] hover:text-white",
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
