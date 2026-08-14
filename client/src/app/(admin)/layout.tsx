import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { AuthGuard } from "@/features/auth/auth-guard"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  )
}
