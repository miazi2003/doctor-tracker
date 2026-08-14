"use client"

import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  Stethoscope,
  UsersRound,
} from "lucide-react"
import Link from "next/link"

import { PageContainer } from "@/components/admin/page-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DoctorApiError } from "@/features/doctors/doctor.api"
import { doctorDetailQueryOptions } from "@/features/doctors/doctor.queries"

import { DoctorDate } from "./doctor-date"

function DoctorDetailsSkeleton() {
  return (
    <PageContainer>
      <div role="status" aria-label="Loading doctor details" className="space-y-5">
        <Skeleton className="h-9 w-36" />
        <Card>
          <CardHeader className="space-y-3">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

export function DoctorDetails({ doctorId }: { doctorId: string }) {
  const query = useQuery(doctorDetailQueryOptions(doctorId))

  if (query.isPending) return <DoctorDetailsSkeleton />

  if (query.isError) {
    const isNotFound =
      query.error instanceof DoctorApiError && query.error.kind === "not-found"

    return (
      <PageContainer>
        <Button variant="ghost" nativeButton={false} render={<Link href="/doctors" />}>
          <ArrowLeft aria-hidden="true" />
          Back to doctors
        </Button>
        <Alert variant={isNotFound ? "default" : "destructive"} className="mt-5">
          <AlertTitle>{isNotFound ? "Doctor not found" : "Doctor could not be loaded"}</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {isNotFound
                ? "This doctor may have been removed or the link may be incorrect."
                : "Check your connection and try again."}
            </span>
            {!isNotFound && (
              <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
                Try again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  const doctor = query.data

  return (
    <PageContainer>
      <Button variant="ghost" nativeButton={false} render={<Link href="/doctors" />}>
        <ArrowLeft aria-hidden="true" />
        Back to doctors
      </Button>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,0.6fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardDescription>Doctor profile</CardDescription>
                <CardTitle className="mt-1 text-2xl tracking-[-0.025em]">
                  {doctor.name}
                </CardTitle>
              </div>
              <Badge variant="secondary">{doctor.specialization}</Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <Building2 className="mt-0.5 size-5 shrink-0 text-neutral-400" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Hospital</p>
                <p className="mt-1 text-sm font-medium">{doctor.hospital}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Stethoscope className="mt-0.5 size-5 shrink-0 text-neutral-400" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Specialization</p>
                <p className="mt-1 text-sm font-medium">{doctor.specialization}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-neutral-400" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Phone</p>
                <a className="mt-1 block text-sm font-medium hover:underline" href={`tel:${doctor.phone}`}>
                  {doctor.phone}
                </a>
              </div>
            </div>
            <div className="flex min-w-0 gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-neutral-400" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Email</p>
                <a className="mt-1 block truncate text-sm font-medium hover:underline" href={`mailto:${doctor.email}`}>
                  {doctor.email}
                </a>
              </div>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-neutral-400" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Added</p>
                <p className="mt-1 text-sm font-medium">
                  <DoctorDate value={doctor.createdAt} />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="self-start border-dashed">
          <CardHeader>
            <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
              <UsersRound className="size-5" aria-hidden="true" />
            </span>
            <CardTitle>Patients</CardTitle>
            <CardDescription>
              Patient management for this doctor will be added later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </PageContainer>
  )
}
