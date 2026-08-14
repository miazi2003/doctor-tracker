import {
  LayoutDashboard,
  Stethoscope,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

export interface AdminNavigationItem {
  href: "/dashboard" | "/doctors" | "/patients"
  label: string
  icon: LucideIcon
}

export const adminNavigation: readonly AdminNavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: UsersRound },
]

export const getAdminPageTitle = (pathname: string): string =>
  adminNavigation.find(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`),
  )?.label ?? "Admin"
