import type { Metadata } from "next"

import { PageContainer } from "@/components/admin/page-container"

export const metadata: Metadata = {
  title: "Patients | Doctor Tracker",
}

export default function PatientsPage() {
  return (
    <PageContainer>
      <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <p className="text-sm font-medium text-neutral-500">Directory</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
          Patients
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-base">
          Patient management will be available here.
        </p>
      </section>
    </PageContainer>
  )
}
