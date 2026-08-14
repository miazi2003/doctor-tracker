import type { Metadata } from "next"

import { CreateDoctorForm } from "@/components/doctors/create-doctor-form"

export const metadata: Metadata = {
  title: "Add doctor | Doctor Tracker",
  description: "Add a doctor to the Doctor Tracker directory.",
}

export default function NewDoctorPage() {
  return <CreateDoctorForm defaultOpen />
}
