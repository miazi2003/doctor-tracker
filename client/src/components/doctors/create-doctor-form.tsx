"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ReactElement } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { dashboardQueryKeys } from "@/features/dashboard/dashboard.queries"
import { createDoctor, DoctorApiError } from "@/features/doctors/doctor.api"
import { doctorQueryKeys } from "@/features/doctors/doctor.queries"
import { createDoctorSchema, type CreateDoctorValues } from "@/features/doctors/doctor.schema"

const fields: readonly {
  name: keyof CreateDoctorValues
  label: string
  type: "email" | "tel" | "text"
  autoComplete: string
  placeholder: string
}[] = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name", placeholder: "Dr. Jane Smith" },
  { name: "specialization", label: "Specialization", type: "text", autoComplete: "off", placeholder: "Cardiology" },
  { name: "hospital", label: "Hospital", type: "text", autoComplete: "organization", placeholder: "Central Medical Center" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", placeholder: "+880 1700 000000" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "doctor@example.com" },
]

const defaultValues: CreateDoctorValues = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
}

export function CreateDoctorForm({
  trigger,
  defaultOpen = false,
}: {
  trigger?: ReactElement
  defaultOpen?: boolean
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const standalone = trigger === undefined
  const completedRef = useRef(false)
  const [open, setOpen] = useState(defaultOpen)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm<CreateDoctorValues>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues,
  })
  const mutation = useMutation({
    mutationFn: createDoctor,
    onSuccess: async (doctor) => {
      completedRef.current = true
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: doctorQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all }),
      ])
      toast.success(`${doctor.name} was added`)
      form.reset(defaultValues)
      setOpen(false)
      if (standalone) router.replace(doctor.id.length > 0 ? `/doctors/${doctor.id}` : "/doctors")
    },
  })

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (form.formState.isDirty && !mutation.isPending && !completedRef.current) event.preventDefault()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [form.formState.isDirty, mutation.isPending])

  const openDialog = (): void => {
    completedRef.current = false
    form.reset(defaultValues)
    setServerError(null)
    setOpen(true)
  }

  const closeDialog = (): void => {
    setOpen(false)
    if (standalone) router.replace("/doctors")
  }

  const requestClose = (): void => {
    if (mutation.isPending) return
    if (form.formState.isDirty) setDiscardOpen(true)
    else closeDialog()
  }

  const onSubmit = async (values: CreateDoctorValues): Promise<void> => {
    if (mutation.isPending) return
    setServerError(null)
    try {
      await mutation.mutateAsync(values)
    } catch (error: unknown) {
      if (error instanceof DoctorApiError) {
        if (error.kind === "duplicate") {
          form.setError("email", { type: "server", message: "A doctor with this email already exists." })
          return
        }
        if (error.kind === "validation") {
          for (const issue of error.issues) {
            if (fields.some((field) => field.name === issue.field)) {
              form.setError(issue.field as keyof CreateDoctorValues, { type: "server", message: issue.message })
            }
          }
          setServerError("Please review the highlighted fields.")
          return
        }
        if (error.kind === "network") {
          setServerError("Unable to reach the server. Check your connection and try again.")
          return
        }
      }
      setServerError("The doctor could not be added. Please try again.")
    }
  }

  return <>
    <Dialog open={open} onOpenChange={(next) => { if (next) openDialog(); else requestClose() }}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Add a doctor</DialogTitle>
          <DialogDescription>Create a profile with the doctor&apos;s practice and contact information. All fields are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            {fields.map((field) => {
              const error = form.formState.errors[field.name]
              const errorId = `doctor-${field.name}-error`
              return <div key={field.name}>
                <Label htmlFor={`doctor-${field.name}`}>{field.label}</Label>
                <Input id={`doctor-${field.name}`} type={field.type} autoComplete={field.autoComplete} placeholder={field.placeholder} className="mt-2" aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} disabled={mutation.isPending} {...form.register(field.name)} />
                {error && <p id={errorId} className="mt-1 text-xs text-destructive">{error.message}</p>}
              </div>
            })}
          </div>
          {serverError && <Alert variant="destructive"><AlertDescription>{serverError}</AlertDescription></Alert>}
          <DialogFooter className="mx-0 mb-0">
            <Button type="button" variant="outline" onClick={requestClose} disabled={mutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}{mutation.isPending ? "Creating doctor…" : "Create doctor"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Discard your changes?</AlertDialogTitle><AlertDialogDescription>The doctor information entered in this dialog will be lost.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={() => { form.reset(defaultValues); setDiscardOpen(false); closeDialog() }}>Discard changes</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
}
