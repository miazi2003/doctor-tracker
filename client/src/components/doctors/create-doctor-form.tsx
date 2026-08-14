"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { PageContainer } from "@/components/admin/page-container"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createDoctor, DoctorApiError } from "@/features/doctors/doctor.api"
import { doctorQueryKeys } from "@/features/doctors/doctor.queries"
import { dashboardQueryKeys } from "@/features/dashboard/dashboard.queries"
import {
  createDoctorSchema,
  type CreateDoctorValues,
} from "@/features/doctors/doctor.schema"

const fields: readonly {
  name: keyof CreateDoctorValues
  label: string
  type: "email" | "tel" | "text"
  autoComplete: string
  placeholder: string
}[] = [
  {
    name: "name",
    label: "Full name",
    type: "text",
    autoComplete: "name",
    placeholder: "Dr. Jane Smith",
  },
  {
    name: "specialization",
    label: "Specialization",
    type: "text",
    autoComplete: "off",
    placeholder: "Cardiology",
  },
  {
    name: "hospital",
    label: "Hospital",
    type: "text",
    autoComplete: "organization",
    placeholder: "Central Medical Center",
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    autoComplete: "tel",
    placeholder: "+880 1700 000000",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "doctor@example.com",
  },
]

const defaultValues: CreateDoctorValues = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
}

export function CreateDoctorForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const completedRef = useRef(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [discardOpen, setDiscardOpen] = useState(false)
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
      router.push(doctor.id.length > 0 ? `/doctors/${doctor.id}` : "/doctors")
    },
  })
  const isDirty = form.formState.isDirty

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (isDirty && !mutation.isPending && !completedRef.current) {
        event.preventDefault()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty, mutation.isPending])

  const onSubmit = async (values: CreateDoctorValues): Promise<void> => {
    if (mutation.isPending) return
    setServerError(null)

    try {
      await mutation.mutateAsync(values)
    } catch (error: unknown) {
      if (error instanceof DoctorApiError) {
        if (error.kind === "duplicate") {
          form.setError("email", {
            type: "server",
            message: "A doctor with this email already exists.",
          })
          return
        }

        if (error.kind === "validation") {
          for (const issue of error.issues) {
            if (fields.some((field) => field.name === issue.field)) {
              form.setError(issue.field as keyof CreateDoctorValues, {
                type: "server",
                message: issue.message,
              })
            }
          }
          setServerError("Please review the highlighted fields.")
          return
        }

        if (error.kind === "network") {
          setServerError(
            "Unable to reach the server. Check your connection and try again.",
          )
          return
        }
      }

      setServerError("The doctor could not be added. Please try again.")
    }
  }

  const requestLeave = (): void => {
    if (mutation.isPending) return
    if (isDirty) setDiscardOpen(true)
    else router.push("/doctors")
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={requestLeave}
            disabled={mutation.isPending}
            className="-ml-2"
          >
            <ArrowLeft aria-hidden="true" />
            Back to doctors
          </Button>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
            Add a doctor
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
            Create a profile with the doctor&apos;s practice and contact information.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="border-b">
            <CardTitle>Doctor information</CardTitle>
            <CardDescription>
              All fields are required. You can review the profile after creation.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <CardContent>
              <div className="grid max-w-6xl gap-x-6 gap-y-5 lg:grid-cols-2">
                {fields.map((field) => {
                  const error = form.formState.errors[field.name]
                  const errorId = `${field.name}-error`

                  return (
                    <div key={field.name}>
                      <Label htmlFor={`doctor-${field.name}`}>{field.label}</Label>
                      <Input
                        id={`doctor-${field.name}`}
                        type={field.type}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        className="mt-2"
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        disabled={mutation.isPending}
                        {...form.register(field.name)}
                      />
                      {error && (
                        <p id={errorId} className="mt-1.5 text-xs text-destructive">
                          {error.message}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {serverError && (
                <Alert variant="destructive" className="mt-6 max-w-6xl">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={requestLeave}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                )}
                {mutation.isPending ? "Creating doctor…" : "Create doctor"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              The information entered on this page will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/doctors")}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
