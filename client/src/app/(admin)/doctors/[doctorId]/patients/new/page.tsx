import type { Metadata } from "next"
import { CreatePatientForm } from "@/components/patients/create-patient-form"

export const metadata: Metadata = { title: "Add patient | Doctor Tracker" }

export default async function AddPatientPage(props: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = await props.params
  return <CreatePatientForm doctorId={doctorId} />
}
