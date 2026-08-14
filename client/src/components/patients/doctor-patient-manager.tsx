"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { CalendarDays, LoaderCircle, Plus, Search, SlidersHorizontal, Trash2, UsersRound, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { deletePatient, PatientApiError } from "@/features/patients/patient.api"
import { doctorPatientListQueryOptions, patientQueryKeys } from "@/features/patients/patient.queries"
import { dashboardQueryKeys } from "@/features/dashboard/dashboard.queries"
import type { Patient, PatientListParameters } from "@/features/patients/patient.schema"
import { cn } from "@/lib/utils"
import { PatientFormDialog } from "./patient-form-dialog"

const PAGE_SIZES = [10, 20, 50] as const
const dateFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
const optional = (value: string): string | undefined => value.trim() || undefined
const positiveInteger = (value: string | null, fallback: number, allowed?: readonly number[]): number => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 && (allowed === undefined || allowed.includes(parsed)) ? parsed : fallback
}
const toRange = (start: string, end: string): DateRange | undefined => start.length === 0 ? undefined : { from: parseISO(start), ...(end.length === 0 ? {} : { to: parseISO(end) }) }
const isoDay = (date: Date | undefined): string => date === undefined ? "" : format(date, "yyyy-MM-dd")

function PatientSkeleton() {
  return <div role="status" aria-label="Loading patients" className="space-y-3"><span className="sr-only">Loading patients</span><Card className="hidden md:block"><CardContent className="space-y-4 p-5">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-8 w-full" />)}</CardContent></Card><div className="grid gap-3 md:hidden">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-48 w-full rounded-xl" />)}</div></div>
}

function PatientActions({ patient, deleting, onDelete }: { patient: Patient; deleting: boolean; onDelete: (patient: Patient) => void }) {
  return <Tooltip><TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${patient.name}`} disabled={deleting} onClick={() => onDelete(patient)} />}><Trash2 aria-hidden="true" /></TooltipTrigger><TooltipContent>Delete patient</TooltipContent></Tooltip>
}

function PatientList({ patients, deletingId, onDelete }: { patients: Patient[]; deletingId: string | null; onDelete: (patient: Patient) => void }) {
  return <>
    <Card className="hidden overflow-hidden py-0 md:block"><Table><TableHeader><TableRow><TableHead className="pl-5">Patient</TableHead><TableHead>Age / gender</TableHead><TableHead>Phone</TableHead><TableHead>Condition</TableHead><TableHead>Appointment</TableHead><TableHead className="w-12 pr-5"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{patients.map((patient) => <TableRow key={patient.id}><TableCell className="pl-5 font-medium">{patient.name}</TableCell><TableCell><span>{patient.age}</span><Badge variant="secondary" className="ml-2 capitalize">{patient.gender}</Badge></TableCell><TableCell><a href={`tel:${patient.phone}`} className="hover:underline">{patient.phone}</a></TableCell><TableCell className="max-w-56"><Badge variant="outline" className="max-w-full truncate">{patient.condition}</Badge></TableCell><TableCell className="whitespace-nowrap">{dateFormatter.format(new Date(patient.appointmentDate))}</TableCell><TableCell className="pr-5"><PatientActions patient={patient} deleting={deletingId === patient.id} onDelete={onDelete} /></TableCell></TableRow>)}</TableBody></Table></Card>
    <div className="grid gap-3 md:hidden">{patients.map((patient) => <Card key={patient.id}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base">{patient.name}</CardTitle><CardDescription className="mt-1">{patient.age} years · <span className="capitalize">{patient.gender}</span></CardDescription></div><PatientActions patient={patient} deleting={deletingId === patient.id} onDelete={onDelete} /></div></CardHeader><CardContent className="grid gap-3 text-sm"><div><p className="text-xs text-muted-foreground">Condition</p><p className="mt-1 font-medium">{patient.condition}</p></div><div><p className="text-xs text-muted-foreground">Phone</p><a href={`tel:${patient.phone}`} className="mt-1 block font-medium hover:underline">{patient.phone}</a></div><div><p className="text-xs text-muted-foreground">Appointment</p><p className="mt-1 font-medium">{dateFormatter.format(new Date(patient.appointmentDate))}</p></div></CardContent></Card>)}</div>
  </>
}

export function DoctorPatientManager({ doctorId, doctorName }: { doctorId: string; doctorName: string }) {
  const router = useRouter(), pathname = usePathname(), searchParams = useSearchParams()
  const serialized = searchParams.toString(), queryClient = useQueryClient()
  const urlSearch = searchParams.get("patientSearch") ?? ""
  const [search, setSearch] = useState(urlSearch)
  const [filterOpen, setFilterOpen] = useState(false), [dateOpen, setDateOpen] = useState(false)
  const [conditionDraft, setConditionDraft] = useState(searchParams.get("condition") ?? "")
  const startDate = searchParams.get("appointmentStart") ?? "", endDate = searchParams.get("appointmentEnd") ?? ""
  const [dateDraft, setDateDraft] = useState<DateRange | undefined>(() => toRange(startDate, endDate))
  const page = positiveInteger(searchParams.get("patientPage"), 1)
  const limit = positiveInteger(searchParams.get("patientLimit"), 20, PAGE_SIZES)
  const condition = searchParams.get("condition") ?? ""
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const updateUrl = useCallback((updates: Readonly<Record<string, string | null>>, resetPage = false) => {
    const next = new URLSearchParams(serialized)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value.length === 0) next.delete(key)
      else next.set(key, value)
    }
    if (resetPage) next.delete("patientPage")
    const query = next.toString(); router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, serialized])

  useEffect(() => { const timer = window.setTimeout(() => { const value = search.trim(); if (value !== urlSearch) updateUrl({ patientSearch: value || null }, true) }, 350); return () => window.clearTimeout(timer) }, [search, updateUrl, urlSearch])
  const parameters = useMemo<PatientListParameters>(() => {
    const patientSearch = optional(urlSearch)
    const patientCondition = optional(condition)
    return { page, limit, ...(patientSearch === undefined ? {} : { search: patientSearch }), ...(patientCondition === undefined ? {} : { condition: patientCondition }), ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}) }
  }, [condition, endDate, limit, page, startDate, urlSearch])
  const query = useQuery(doctorPatientListQueryOptions(doctorId, parameters))
  const mutation = useMutation({ mutationFn: deletePatient, onSuccess: async (patient) => { setDeleteTarget(null); await Promise.all([queryClient.invalidateQueries({ queryKey: patientQueryKeys.doctorLists(doctorId) }), queryClient.invalidateQueries({ queryKey: patientQueryKeys.globalLists() }), queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })]); toast.success(`${patient.name} was deleted`) } })
  const hasFilters = Boolean(urlSearch || condition || startDate || endDate || limit !== 20)
  const getPageHref = (nextPage: number) => {
    const next = new URLSearchParams(serialized)
    if (nextPage <= 1) next.delete("patientPage")
    else next.set("patientPage", String(nextPage))
    const value = next.toString()
    return value ? `${pathname}?${value}` : pathname
  }

  return <section aria-labelledby="patients-heading" className="space-y-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-neutral-500">Care roster</p><h2 id="patients-heading" className="mt-1 text-2xl font-semibold tracking-[-0.025em]">Patients</h2><p className="mt-1 text-sm text-neutral-600">Appointments assigned to {doctorName}.</p></div><PatientFormDialog mode="create" doctorId={doctorId} doctorName={doctorName} trigger={<Button><Plus aria-hidden="true" />Add patient</Button>} /></div>
    <div className="flex flex-col gap-2 sm:flex-row"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients by name, phone, condition, or gender..." aria-label="Search patients" className="pl-9" /></div><div className="flex gap-2">
      <Popover open={dateOpen} onOpenChange={(open) => { setDateOpen(open); if (open) setDateDraft(toRange(startDate, endDate)) }}><Tooltip><TooltipTrigger render={<PopoverTrigger render={<Button type="button" variant={startDate || endDate ? "default" : "outline"} size="icon" aria-label="Filter by appointment date" />} />}><CalendarDays aria-hidden="true" /></TooltipTrigger><TooltipContent>Appointment dates</TooltipContent></Tooltip><PopoverContent align="end" className="w-auto max-w-[calc(100vw-2rem)] p-0"><div className="p-4"><p className="text-sm font-medium">Appointment range</p><p className="mt-1 text-xs text-muted-foreground">{dateDraft?.from ? `${format(dateDraft.from, "MMM d, yyyy")}${dateDraft.to ? ` – ${format(dateDraft.to, "MMM d, yyyy")}` : ""}` : "Any appointment date"}</p></div><Separator /><Calendar mode="range" selected={dateDraft} onSelect={setDateDraft} numberOfMonths={1} /><Separator /><div className="flex justify-end gap-2 p-3"><Button variant="ghost" size="sm" onClick={() => setDateDraft(undefined)}>Clear</Button><Button size="sm" onClick={() => { updateUrl({ appointmentStart: isoDay(dateDraft?.from) || null, appointmentEnd: isoDay(dateDraft?.to) || null }, true); setDateOpen(false) }}>Apply</Button></div></PopoverContent></Popover>
      <Popover open={filterOpen} onOpenChange={(open) => { setFilterOpen(open); if (open) setConditionDraft(condition) }}><Tooltip><TooltipTrigger render={<PopoverTrigger render={<Button type="button" variant={condition || limit !== 20 ? "default" : "outline"} size="icon" aria-label="Patient filters" />} />}><SlidersHorizontal aria-hidden="true" /></TooltipTrigger><TooltipContent>Patient filters</TooltipContent></Tooltip><PopoverContent align="end" className="w-72"><div className="space-y-4"><div><Label htmlFor="patient-condition">Condition</Label><Input id="patient-condition" className="mt-2" value={conditionDraft} onChange={(event) => setConditionDraft(event.target.value)} placeholder="Exact condition" /></div><div><Label htmlFor="patient-limit">Patients per page</Label><Select value={String(limit)} onValueChange={(value) => updateUrl({ patientLimit: Number(value) === 20 ? null : value }, true)}><SelectTrigger id="patient-limit" className="mt-2 w-full"><SelectValue /></SelectTrigger><SelectContent>{PAGE_SIZES.map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select></div><Separator /><div className="flex justify-between"><Button variant="ghost" size="sm" onClick={() => { setConditionDraft(""); updateUrl({ condition: null, patientLimit: null }, true); setFilterOpen(false) }}>Reset</Button><Button size="sm" onClick={() => { updateUrl({ condition: conditionDraft.trim() || null }, true); setFilterOpen(false) }}>Apply</Button></div></div></PopoverContent></Popover>
    </div></div>
    {hasFilters && <div className="flex flex-wrap items-center gap-2">{urlSearch && <Badge variant="outline">Search: {urlSearch}<button type="button" className="ml-1 rounded-sm focus-visible:outline-none focus-visible:ring-2" aria-label="Remove patient search" onClick={() => { setSearch(""); updateUrl({ patientSearch: null }, true) }}><X className="size-3" aria-hidden="true" /></button></Badge>}{condition && <Badge variant="outline">Condition: {condition}<button type="button" className="ml-1 rounded-sm focus-visible:outline-none focus-visible:ring-2" aria-label="Remove condition filter" onClick={() => updateUrl({ condition: null }, true)}><X className="size-3" aria-hidden="true" /></button></Badge>}{(startDate || endDate) && <Badge variant="outline">Appointment: {startDate || "Any"} – {endDate || "Any"}<button type="button" className="ml-1 rounded-sm focus-visible:outline-none focus-visible:ring-2" aria-label="Remove appointment date filter" onClick={() => updateUrl({ appointmentStart: null, appointmentEnd: null }, true)}><X className="size-3" aria-hidden="true" /></button></Badge>}{limit !== 20 && <Badge variant="outline">{limit} per page<button type="button" className="ml-1 rounded-sm focus-visible:outline-none focus-visible:ring-2" aria-label="Reset patients per page" onClick={() => updateUrl({ patientLimit: null }, true)}><X className="size-3" aria-hidden="true" /></button></Badge>}<Button variant="ghost" size="sm" onClick={() => { setSearch(""); router.replace(pathname, { scroll: false }) }}>Clear all</Button></div>}
    {query.isPending ? <PatientSkeleton /> : query.isError ? <Alert variant="destructive"><AlertTitle>{query.error instanceof PatientApiError && query.error.kind === "not-found" ? "Doctor not found" : "Patients could not be loaded"}</AlertTitle><AlertDescription className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><span>{query.error instanceof PatientApiError && query.error.kind === "network" ? "Check your connection and try again." : "The patient list is unavailable. Please try again."}</span><Button variant="outline" size="sm" onClick={() => void query.refetch()}>Try again</Button></AlertDescription></Alert> : query.data.patients.length === 0 ? <Card><CardHeader className="items-center py-12 text-center"><UsersRound className="size-6 text-muted-foreground" aria-hidden="true" /><CardTitle>{hasFilters ? "No matching patients" : "No patients yet"}</CardTitle><CardDescription>{hasFilters ? "Adjust or clear the current filters." : "Add the first patient assigned to this doctor."}</CardDescription></CardHeader></Card> : <div className="relative space-y-5">{query.isFetching && <p role="status" className="absolute -top-8 right-0 flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-3.5 animate-spin" />Updating</p>}<PatientList patients={query.data.patients} deletingId={mutation.isPending ? deleteTarget?.id ?? null : null} onDelete={(patient) => { setDeleteError(null); setDeleteTarget(patient) }} />{query.data.pagination.totalPages > 1 && <div className="flex flex-col items-center justify-between gap-3 border-t pt-5 sm:flex-row"><p className="text-sm text-muted-foreground">Page {query.data.pagination.page} of {query.data.pagination.totalPages} · {query.data.pagination.total} patients</p><Pagination className="mx-0 w-auto"><PaginationContent><PaginationItem><PaginationPrevious href={page > 1 ? getPageHref(page - 1) : "#"} aria-disabled={page <= 1} tabIndex={page > 1 ? undefined : -1} className={cn(page <= 1 && "pointer-events-none opacity-50")} /></PaginationItem><PaginationItem><PaginationNext href={page < query.data.pagination.totalPages ? getPageHref(page + 1) : "#"} aria-disabled={page >= query.data.pagination.totalPages} tabIndex={page < query.data.pagination.totalPages ? undefined : -1} className={cn(page >= query.data.pagination.totalPages && "pointer-events-none opacity-50")} /></PaginationItem></PaginationContent></Pagination></div>}</div>}
    <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open && !mutation.isPending) setDeleteTarget(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle><AlertDialogDescription>This permanently removes the patient record. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>{deleteError && <Alert variant="destructive"><AlertDescription>{deleteError}</AlertDescription></Alert>}<AlertDialogFooter><AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={mutation.isPending} onClick={async () => { if (!deleteTarget || mutation.isPending) return; setDeleteError(null); try { await mutation.mutateAsync(deleteTarget.id) } catch (error: unknown) { setDeleteError(error instanceof PatientApiError && error.kind === "network" ? "Unable to reach the server. Try again." : "The patient could not be deleted. It may already have been removed.") } }}>{mutation.isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}{mutation.isPending ? "Deleting…" : "Delete patient"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>
}
