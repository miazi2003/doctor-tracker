import type { Metadata } from "next"

import { DoctorDetails } from "@/components/doctors/doctor-details"

export const metadata: Metadata = {
  title: "Doctor details | Doctor Tracker",
}

export default async function DoctorDetailsPage(
  props: PageProps<"/doctors/[doctorId]">,
) {
  const { doctorId } = await props.params
  return <DoctorDetails doctorId={doctorId} />
}
