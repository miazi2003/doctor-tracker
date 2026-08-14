import { ArrowRight, Building2, Mail, Phone, Stethoscope } from "lucide-react"
import Link from "next/link"

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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Doctor } from "@/features/doctors/doctor.schema"

import { DoctorDate } from "./doctor-date"

export function DoctorListSkeleton() {
  return (
    <div aria-label="Loading doctors" role="status" className="space-y-3">
      <span className="sr-only">Loading doctors</span>
      <Card className="hidden md:block">
        <CardContent className="space-y-4 p-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="grid grid-cols-5 gap-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function DoctorListError({
  isNetworkError,
  onRetry,
}: {
  isNetworkError: boolean
  onRetry: () => void
}) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Doctors could not be loaded</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {isNetworkError
            ? "Check your connection, then try again."
            : "The server returned an unexpected response. Please try again."}
        </span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export function DoctorListEmpty({ filtered }: { filtered: boolean }) {
  return (
    <Card>
      <CardHeader className="items-center py-12 text-center sm:py-16">
        <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
          <Stethoscope className="size-5" aria-hidden="true" />
        </span>
        <CardTitle>{filtered ? "No matching doctors" : "No doctors yet"}</CardTitle>
        <CardDescription className="max-w-sm">
          {filtered
            ? "Try adjusting or clearing the current filters."
            : "Add the first doctor to begin building the directory."}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

export function DoctorList({ doctors }: { doctors: Doctor[] }) {
  return (
    <>
      <Card className="hidden overflow-hidden py-0 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Doctor</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-12 pr-5">
                <span className="sr-only">Open doctor</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell className="pl-5 font-medium">
                  <Link
                    href={`/doctors/${doctor.id}`}
                    className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
                  >
                    {doctor.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{doctor.specialization}</Badge>
                </TableCell>
                <TableCell className="max-w-48 truncate">{doctor.hospital}</TableCell>
                <TableCell>
                  <a className="block hover:underline" href={`tel:${doctor.phone}`}>
                    {doctor.phone}
                  </a>
                  <a
                    className="block max-w-48 truncate text-xs text-neutral-500 hover:underline"
                    href={`mailto:${doctor.email}`}
                  >
                    {doctor.email}
                  </a>
                </TableCell>
                <TableCell className="whitespace-nowrap text-neutral-600">
                  <DoctorDate value={doctor.createdAt} />
                </TableCell>
                <TableCell className="pr-5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/doctors/${doctor.id}`} />}
                    aria-label={`View ${doctor.name}`}
                  >
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid gap-3 md:hidden">
        {doctors.map((doctor) => (
          <Link
            key={doctor.id}
            href={`/doctors/${doctor.id}`}
            className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
          >
            <Card className="transition-colors hover:border-neutral-300">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{doctor.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {doctor.specialization}
                    </CardDescription>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-600">
                <p className="flex items-start gap-2">
                  <Building2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{doctor.hospital}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  <span>{doctor.phone}</span>
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{doctor.email}</span>
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
