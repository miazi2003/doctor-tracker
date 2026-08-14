"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { PageContainer } from "@/components/admin/page-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DoctorApiError } from "@/features/doctors/doctor.api"
import { doctorDetailQueryOptions } from "@/features/doctors/doctor.queries"
import { createPatient, PatientApiError } from "@/features/patients/patient.api"
import { patientQueryKeys } from "@/features/patients/patient.queries"
import { createPatientSchema, patientGenders, type CreatePatientPayload, type CreatePatientValues, type PatientGender } from "@/features/patients/patient.schema"

const defaultValues: CreatePatientValues = { name: "", age: "", gender: "male", phone: "", condition: "", appointmentDate: "" }
const editableFields: readonly (keyof CreatePatientValues)[] = ["name", "age", "gender", "phone", "condition", "appointmentDate"]

export function CreatePatientForm({ doctorId }: { doctorId: string }) {
  const router = useRouter(), queryClient = useQueryClient(), completed = useRef(false)
  const [discardOpen, setDiscardOpen] = useState(false), [serverError, setServerError] = useState<string | null>(null)
  const doctorQuery = useQuery(doctorDetailQueryOptions(doctorId))
  const form = useForm<CreatePatientValues, unknown, CreatePatientPayload>({ resolver: zodResolver(createPatientSchema), defaultValues })
  const gender = useWatch({ control: form.control, name: "gender" })
  const mutation = useMutation({ mutationFn: (values: CreatePatientPayload) => createPatient(doctorId, values), onSuccess: async (patient) => { completed.current = true; await Promise.all([queryClient.invalidateQueries({ queryKey: patientQueryKeys.doctorLists(doctorId) }), queryClient.invalidateQueries({ queryKey: patientQueryKeys.globalLists() })]); toast.success(`${patient.name} was added`); form.reset(defaultValues); router.push(`/doctors/${doctorId}`) } })
  const isDirty = form.formState.isDirty
  useEffect(() => { const listener = (event: BeforeUnloadEvent) => { if (isDirty && !mutation.isPending && !completed.current) event.preventDefault() }; window.addEventListener("beforeunload", listener); return () => window.removeEventListener("beforeunload", listener) }, [isDirty, mutation.isPending])
  const destination = `/doctors/${doctorId}`
  const requestLeave = () => {
    if (mutation.isPending) return
    if (isDirty) setDiscardOpen(true)
    else router.push(destination)
  }
  const submit = async (values: CreatePatientPayload) => {
    if (mutation.isPending) return
    setServerError(null)
    try { await mutation.mutateAsync(values) }
    catch (error: unknown) {
      if (error instanceof PatientApiError && error.kind === "validation") {
        for (const issue of error.issues) if (editableFields.includes(issue.field as keyof CreatePatientValues)) form.setError(issue.field as keyof CreatePatientValues, { type: "server", message: issue.message })
        setServerError("Please review the highlighted fields."); return
      }
      if (error instanceof PatientApiError && error.kind === "not-found") { setServerError("This doctor no longer exists."); return }
      if (error instanceof PatientApiError && error.kind === "network") { setServerError("Unable to reach the server. Check your connection and try again."); return }
      setServerError("The patient could not be added. Please try again.")
    }
  }

  if (doctorQuery.isPending) return <PageContainer><div role="status" aria-label="Loading doctor"><Card><CardHeader><Skeleton className="h-6 w-52" /><Skeleton className="h-4 w-80 max-w-full" /></CardHeader></Card></div></PageContainer>
  if (doctorQuery.isError) {
    const missing = doctorQuery.error instanceof DoctorApiError && doctorQuery.error.kind === "not-found"
    return <PageContainer><Button variant="ghost" onClick={() => router.push("/doctors")}><ArrowLeft />Back to doctors</Button><Alert variant={missing ? "default" : "destructive"} className="mt-5"><AlertTitle>{missing ? "Doctor not found" : "Doctor could not be loaded"}</AlertTitle><AlertDescription>{missing ? "The selected doctor does not exist." : "Try loading the doctor again."}</AlertDescription></Alert></PageContainer>
  }
  const doctor = doctorQuery.data
  const fieldError = (name: keyof CreatePatientValues) => form.formState.errors[name]
  return <PageContainer><div className="space-y-6"><div><Button variant="ghost" onClick={requestLeave} disabled={mutation.isPending} className="-ml-2"><ArrowLeft aria-hidden="true" />Back to {doctor.name}</Button><h2 className="mt-4 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">Add a patient</h2><p className="mt-2 text-sm text-neutral-600">Create an appointment record assigned to {doctor.name} · {doctor.specialization} at {doctor.hospital}.</p></div>
    <Card className="w-full"><CardHeader className="border-b"><CardTitle>Patient information</CardTitle><CardDescription>All fields are required. The doctor assignment cannot be changed later.</CardDescription></CardHeader><form onSubmit={form.handleSubmit(submit)} noValidate><CardContent><div className="grid max-w-6xl gap-x-6 gap-y-5 lg:grid-cols-2">
      <div><Label htmlFor="patient-name">Full name</Label><Input id="patient-name" className="mt-2" autoComplete="name" placeholder="Patient name" disabled={mutation.isPending} aria-invalid={Boolean(fieldError("name"))} {...form.register("name")} />{fieldError("name") && <p className="mt-1.5 text-xs text-destructive">{fieldError("name")?.message}</p>}</div>
      <div><Label htmlFor="patient-age">Age</Label><Input id="patient-age" type="number" inputMode="numeric" min={0} max={130} className="mt-2" placeholder="35" disabled={mutation.isPending} aria-invalid={Boolean(fieldError("age"))} {...form.register("age")} />{fieldError("age") && <p className="mt-1.5 text-xs text-destructive">{fieldError("age")?.message}</p>}</div>
      <div><Label htmlFor="patient-gender">Gender</Label><Select value={gender} onValueChange={(value) => form.setValue("gender", value as PatientGender, { shouldDirty: true, shouldValidate: true })} disabled={mutation.isPending}><SelectTrigger id="patient-gender" className="mt-2 w-full" aria-invalid={Boolean(fieldError("gender"))}><SelectValue /></SelectTrigger><SelectContent>{patientGenders.map((genderOption) => <SelectItem key={genderOption} value={genderOption}><span className="capitalize">{genderOption}</span></SelectItem>)}</SelectContent></Select>{fieldError("gender") && <p className="mt-1.5 text-xs text-destructive">{fieldError("gender")?.message}</p>}</div>
      <div><Label htmlFor="patient-phone">Phone</Label><Input id="patient-phone" type="tel" className="mt-2" autoComplete="tel" placeholder="+880 1700 000000" disabled={mutation.isPending} aria-invalid={Boolean(fieldError("phone"))} {...form.register("phone")} />{fieldError("phone") && <p className="mt-1.5 text-xs text-destructive">{fieldError("phone")?.message}</p>}</div>
      <div><Label htmlFor="patient-condition">Condition</Label><Input id="patient-condition" className="mt-2" placeholder="Condition or reason for visit" disabled={mutation.isPending} aria-invalid={Boolean(fieldError("condition"))} {...form.register("condition")} />{fieldError("condition") && <p className="mt-1.5 text-xs text-destructive">{fieldError("condition")?.message}</p>}</div>
      <div><Label htmlFor="patient-appointment">Appointment date</Label><Input id="patient-appointment" type="date" className="mt-2" disabled={mutation.isPending} aria-invalid={Boolean(fieldError("appointmentDate"))} {...form.register("appointmentDate")} />{fieldError("appointmentDate") && <p className="mt-1.5 text-xs text-destructive">{fieldError("appointmentDate")?.message}</p>}</div>
    </div>{serverError && <Alert variant="destructive" className="mt-6 max-w-6xl"><AlertDescription>{serverError}</AlertDescription></Alert>}</CardContent><CardFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={requestLeave} disabled={mutation.isPending}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}{mutation.isPending ? "Adding patient…" : "Add patient"}</Button></CardFooter></form></Card>
  </div><AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Discard your changes?</AlertDialogTitle><AlertDialogDescription>The patient information entered on this page will be lost.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={() => router.push(destination)}>Discard changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></PageContainer>
}
