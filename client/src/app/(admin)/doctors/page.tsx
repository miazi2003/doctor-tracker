import type { Metadata } from "next"
import { Suspense } from "react"

import { DoctorManager } from "@/components/doctors/doctor-manager"
import { DoctorListSkeleton } from "@/components/doctors/doctor-list-content"
import { PageContainer } from "@/components/admin/page-container"

export const metadata: Metadata = {
  title: "Doctors | Doctor Tracker",
}

export default function DoctorsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <DoctorListSkeleton />
        </PageContainer>
      }
    >
      <DoctorManager />
    </Suspense>
  )
}
