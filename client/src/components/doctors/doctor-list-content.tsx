import { ArrowRight, CalendarDays, Stethoscope } from "lucide-react"
import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

const getInitials = (name: string): string => name.trim().split(/\s+/u).filter(Boolean).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase() || "D"

export function DoctorListSkeleton() {
  return (
    <div aria-label="Loading doctors" role="status" className="space-y-3">
      <span className="sr-only">Loading doctors</span>
      <Card className="overflow-x-auto">
        <CardContent className="min-w-[62rem] space-y-4 p-5">
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
        <span className="mb-2 flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-neutral-400">
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
      <Card className="overflow-hidden border-0 bg-transparent py-0">
        <Table className="min-w-[62rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Doctor</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-20 pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell className="pl-5 font-medium text-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm"><AvatarFallback className="bg-white/15 text-[0.65rem] font-semibold text-white">{getInitials(doctor.name)}</AvatarFallback></Avatar>
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070908]"
                    >
                      {doctor.name}
                    </Link>
                  </div>
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
                <TableCell className="whitespace-nowrap text-neutral-400">
                  <span className="flex items-center gap-2"><CalendarDays className="size-3.5 text-neutral-500" aria-hidden="true" /><DoctorDate value={doctor.createdAt} /></span>
                </TableCell>
                <TableCell className="pr-5 text-right">
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
  )
}
