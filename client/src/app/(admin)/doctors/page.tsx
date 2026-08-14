import type { Metadata } from "next"

import { PageContainer } from "@/components/admin/page-container"

export const metadata: Metadata = {
  title: "Doctors | Doctor Tracker",
}

export default function DoctorsPage() {
  return (
    <PageContainer>
      <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <p className="text-sm font-medium text-neutral-500">Directory</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
          Doctors
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-base">
          Doctor management will be available here.
        </p>
      </section>
    </PageContainer>
  )
}
