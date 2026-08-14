import type { Metadata } from "next"

import { Suspense } from "react"
import { PatientManager } from "@/components/patients/patient-manager"
import { PageContainer } from "@/components/admin/page-container"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Patients | Doctor Tracker",
}

export default function PatientsPage() {
  return <Suspense fallback={<PageContainer><Skeleton className="h-10 w-64" /><Skeleton className="mt-6 h-80 w-full" /></PageContainer>}><PatientManager /></Suspense>
}
