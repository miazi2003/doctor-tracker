"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { useState, type ReactElement } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPatient, PatientApiError, updatePatient } from "@/features/patients/patient.api"
import { patientQueryKeys } from "@/features/patients/patient.queries"
import { dashboardQueryKeys } from "@/features/dashboard/dashboard.queries"
import { createPatientSchema, patientGenders, type CreatePatientPayload, type CreatePatientValues, type EditablePatient, type PatientGender } from "@/features/patients/patient.schema"

const emptyValues: CreatePatientValues = { name: "", age: "", gender: "male", phone: "", condition: "", appointmentDate: "" }
const fields: readonly (keyof CreatePatientValues)[] = ["name", "age", "gender", "phone", "condition", "appointmentDate"]
const toDateInput = (value: string): string => value.slice(0, 10)

type PatientFormDialogProps =
  | { mode: "create"; doctorId: string; doctorName: string; trigger: ReactElement }
  | { mode: "edit"; patient: EditablePatient; doctorName: string; trigger: ReactElement }

export function PatientFormDialog(props: PatientFormDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const initialValues: CreatePatientValues = props.mode === "create" ? emptyValues : {
    name: props.patient.name, age: String(props.patient.age), gender: props.patient.gender,
    phone: props.patient.phone, condition: props.patient.condition,
    appointmentDate: toDateInput(props.patient.appointmentDate),
  }
  const form = useForm<CreatePatientValues, unknown, CreatePatientPayload>({ resolver: zodResolver(createPatientSchema), defaultValues: initialValues })
  const gender = useWatch({ control: form.control, name: "gender" })
  const mutation = useMutation({
    mutationFn: (values: CreatePatientPayload) => props.mode === "create" ? createPatient(props.doctorId, values) : updatePatient(props.patient.id, values),
    onSuccess: async (patient) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all }),
      ])
      toast.success(props.mode === "create" ? `${patient.name} was added` : `${patient.name} was updated`)
      form.reset(props.mode === "create" ? emptyValues : { ...initialValues, name: patient.name, age: String(patient.age), gender: patient.gender, phone: patient.phone, condition: patient.condition, appointmentDate: toDateInput(patient.appointmentDate) })
      setOpen(false)
    },
  })

  const openDialog = (): void => {
    form.reset(initialValues)
    setServerError(null)
    setOpen(true)
  }
  const requestClose = (): void => {
    if (mutation.isPending) return
    if (form.formState.isDirty) setDiscardOpen(true)
    else setOpen(false)
  }
  const submit = async (values: CreatePatientPayload): Promise<void> => {
    if (mutation.isPending) return
    setServerError(null)
    try { await mutation.mutateAsync(values) }
    catch (error: unknown) {
      if (error instanceof PatientApiError && error.kind === "validation") {
        for (const issue of error.issues) if (fields.includes(issue.field as keyof CreatePatientValues)) form.setError(issue.field as keyof CreatePatientValues, { type: "server", message: issue.message })
        setServerError("Please review the highlighted fields.")
      } else if (error instanceof PatientApiError && error.kind === "not-found") setServerError(props.mode === "create" ? "This doctor no longer exists." : "This patient no longer exists.")
      else if (error instanceof PatientApiError && error.kind === "network") setServerError("Unable to reach the server. Check your connection and try again.")
      else setServerError(`The patient could not be ${props.mode === "create" ? "added" : "updated"}. Please try again.`)
    }
  }
  const errorFor = (name: keyof CreatePatientValues) => form.formState.errors[name]

  return <>
    <Dialog open={open} onOpenChange={(next) => { if (next) openDialog(); else requestClose() }}>
      <DialogTrigger render={props.trigger} />
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl" showCloseButton={!mutation.isPending}>
        <DialogHeader><DialogTitle>{props.mode === "create" ? "Add patient" : "Edit patient"}</DialogTitle><DialogDescription>{props.mode === "create" ? `Create a patient appointment assigned to ${props.doctorName}.` : `Update this patient’s information. Assigned Doctor: ${props.doctorName}.`}</DialogDescription></DialogHeader>
        <form onSubmit={form.handleSubmit(submit)} noValidate className="space-y-5">
          {props.mode === "edit" && <div className="rounded-lg border bg-muted/40 px-3 py-2"><p className="text-xs text-muted-foreground">Assigned Doctor</p><p className="mt-1 text-sm font-medium">{props.doctorName}</p></div>}
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <div><Label htmlFor={`${props.mode}-patient-name`}>Full name</Label><Input id={`${props.mode}-patient-name`} className="mt-2" autoComplete="name" disabled={mutation.isPending} aria-invalid={Boolean(errorFor("name"))} aria-describedby={errorFor("name") ? `${props.mode}-patient-name-error` : undefined} {...form.register("name")} />{errorFor("name") && <p id={`${props.mode}-patient-name-error`} className="mt-1 text-xs text-destructive">{errorFor("name")?.message}</p>}</div>
            <div><Label htmlFor={`${props.mode}-patient-age`}>Age</Label><Input id={`${props.mode}-patient-age`} type="number" min={0} max={130} inputMode="numeric" className="mt-2" disabled={mutation.isPending} aria-invalid={Boolean(errorFor("age"))} aria-describedby={errorFor("age") ? `${props.mode}-patient-age-error` : undefined} {...form.register("age")} />{errorFor("age") && <p id={`${props.mode}-patient-age-error`} className="mt-1 text-xs text-destructive">{errorFor("age")?.message}</p>}</div>
            <div><Label htmlFor={`${props.mode}-patient-gender`}>Gender</Label><Select value={gender} onValueChange={(value) => form.setValue("gender", value as PatientGender, { shouldDirty: true, shouldValidate: true })} disabled={mutation.isPending}><SelectTrigger id={`${props.mode}-patient-gender`} className="mt-2 w-full" aria-invalid={Boolean(errorFor("gender"))} aria-describedby={errorFor("gender") ? `${props.mode}-patient-gender-error` : undefined}><SelectValue /></SelectTrigger><SelectContent>{patientGenders.map((option) => <SelectItem key={option} value={option}><span className="capitalize">{option}</span></SelectItem>)}</SelectContent></Select>{errorFor("gender") && <p id={`${props.mode}-patient-gender-error`} className="mt-1 text-xs text-destructive">{errorFor("gender")?.message}</p>}</div>
            <div><Label htmlFor={`${props.mode}-patient-phone`}>Phone</Label><Input id={`${props.mode}-patient-phone`} type="tel" autoComplete="tel" className="mt-2" disabled={mutation.isPending} aria-invalid={Boolean(errorFor("phone"))} aria-describedby={errorFor("phone") ? `${props.mode}-patient-phone-error` : undefined} {...form.register("phone")} />{errorFor("phone") && <p id={`${props.mode}-patient-phone-error`} className="mt-1 text-xs text-destructive">{errorFor("phone")?.message}</p>}</div>
            <div><Label htmlFor={`${props.mode}-patient-condition`}>Condition</Label><Input id={`${props.mode}-patient-condition`} className="mt-2" disabled={mutation.isPending} aria-invalid={Boolean(errorFor("condition"))} aria-describedby={errorFor("condition") ? `${props.mode}-patient-condition-error` : undefined} {...form.register("condition")} />{errorFor("condition") && <p id={`${props.mode}-patient-condition-error`} className="mt-1 text-xs text-destructive">{errorFor("condition")?.message}</p>}</div>
            <div><Label htmlFor={`${props.mode}-patient-appointment`}>Appointment date</Label><Input id={`${props.mode}-patient-appointment`} type="date" className="mt-2" disabled={mutation.isPending} aria-invalid={Boolean(errorFor("appointmentDate"))} aria-describedby={errorFor("appointmentDate") ? `${props.mode}-patient-appointment-error` : undefined} {...form.register("appointmentDate")} />{errorFor("appointmentDate") && <p id={`${props.mode}-patient-appointment-error`} className="mt-1 text-xs text-destructive">{errorFor("appointmentDate")?.message}</p>}</div>
          </div>
          {serverError && <Alert variant="destructive"><AlertDescription>{serverError}</AlertDescription></Alert>}
          <DialogFooter className="mx-0 mb-0"><Button type="button" variant="outline" onClick={requestClose} disabled={mutation.isPending}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}{mutation.isPending ? (props.mode === "create" ? "Adding…" : "Saving…") : (props.mode === "create" ? "Add patient" : "Save changes")}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Discard your changes?</AlertDialogTitle><AlertDialogDescription>The patient information entered in this dialog will be lost.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={() => { form.reset(initialValues); setDiscardOpen(false); setOpen(false) }}>Discard changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>
}
