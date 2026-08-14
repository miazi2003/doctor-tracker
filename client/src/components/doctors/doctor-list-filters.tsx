"use client"

import { format, parseISO } from "date-fns"
import { CalendarDays, ListFilter, Search, X } from "lucide-react"
import { useState, type ReactNode } from "react"
import type { DateRange } from "react-day-picker"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface DoctorFilterValues {
  specialization: string
  hospital: string
  startDate: string
  endDate: string
}

export interface DoctorSecondaryFilterValues {
  specialization: string
  hospital: string
  limit: number
}

type RemovableFilter = "search" | keyof DoctorFilterValues | "limit"

const dateLabelFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const readDateRange = (filters: DoctorFilterValues): DateRange | undefined => {
  if (filters.startDate.length === 0 && filters.endDate.length === 0) {
    return undefined
  }

  return {
    from:
      filters.startDate.length === 0
        ? undefined
        : parseISO(filters.startDate),
    ...(filters.endDate.length === 0 ? {} : { to: parseISO(filters.endDate) }),
  }
}

const formatDateRange = (range: DateRange | undefined): string => {
  if (range?.from === undefined) return "No date range selected"
  if (range.to === undefined) return `From ${dateLabelFormatter.format(range.from)}`
  return `${dateLabelFormatter.format(range.from)} – ${dateLabelFormatter.format(range.to)}`
}

function CompactTooltip({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function SecondaryFilterFields({
  draft,
  idPrefix,
  onChange,
}: {
  draft: DoctorSecondaryFilterValues
  idPrefix: string
  onChange: (draft: DoctorSecondaryFilterValues) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${idPrefix}-doctor-specialization`}>Specialization</Label>
        <Input
          id={`${idPrefix}-doctor-specialization`}
          value={draft.specialization}
          onChange={(event) =>
            onChange({ ...draft, specialization: event.target.value })
          }
          placeholder="e.g. Cardiology"
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-doctor-hospital`}>Hospital</Label>
        <Input
          id={`${idPrefix}-doctor-hospital`}
          value={draft.hospital}
          onChange={(event) => onChange({ ...draft, hospital: event.target.value })}
          placeholder="Hospital name"
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-doctor-page-size`}>Doctors per page</Label>
        <Select
          value={String(draft.limit)}
          onValueChange={(value) => onChange({ ...draft, limit: Number(value) })}
        >
          <SelectTrigger id={`${idPrefix}-doctor-page-size`} className="mt-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {[10, 20, 50].map((value) => (
              <SelectItem key={value} value={String(value)}>
                {value} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function FilterButton({ activeCount }: { activeCount: number }) {
  return (
    <>
      <ListFilter aria-hidden="true" />
      {activeCount > 0 && (
        <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 border-2 border-[#070908] px-1 text-[0.7rem]">
          {activeCount}
        </Badge>
      )}
    </>
  )
}

function DesktopSecondaryFilters({
  values,
  activeCount,
  onApply,
}: {
  values: DoctorSecondaryFilterValues
  activeCount: number
  onApply: (values: DoctorSecondaryFilterValues) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(values)

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen)
    if (nextOpen) setDraft(values)
  }

  return (
    <div className="hidden sm:block">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <CompactTooltip label="Filter doctors">
          <PopoverTrigger
            render={
              <Button
                variant={activeCount > 0 ? "default" : "outline"}
                size="icon-lg"
                aria-label={
                  activeCount > 0
                    ? `Filter doctors, ${String(activeCount)} active`
                    : "Filter doctors"
                }
                className="relative rounded-full"
              />
            }
          >
            <FilterButton activeCount={activeCount} />
          </PopoverTrigger>
        </CompactTooltip>
        <PopoverContent align="end" className="w-80 p-4">
          <PopoverHeader>
            <PopoverTitle>Filter doctors</PopoverTitle>
            <PopoverDescription>
              Narrow the directory by practice details.
            </PopoverDescription>
          </PopoverHeader>
          <Separator />
          <SecondaryFilterFields
            draft={draft}
            idPrefix="desktop"
            onChange={setDraft}
          />
          <Separator />
          <div className="flex justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => setDraft({ specialization: "", hospital: "", limit: 20 })}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                onApply(draft)
                setOpen(false)
              }}
            >
              Apply filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function MobileSecondaryFilters({
  values,
  activeCount,
  onApply,
}: {
  values: DoctorSecondaryFilterValues
  activeCount: number
  onApply: (values: DoctorSecondaryFilterValues) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(values)

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen)
    if (nextOpen) setDraft(values)
  }

  return (
    <div className="sm:hidden">
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger
          render={
            <Button
              variant={activeCount > 0 ? "default" : "outline"}
              size="icon-lg"
              aria-label={
                activeCount > 0
                  ? `Filter doctors, ${String(activeCount)} active`
                  : "Filter doctors"
              }
              className="relative rounded-full"
            />
          }
        >
          <FilterButton activeCount={activeCount} />
        </SheetTrigger>
        <SheetContent side="right" className="w-[min(22rem,calc(100vw-1rem))]">
          <SheetHeader>
            <SheetTitle>Filter doctors</SheetTitle>
            <SheetDescription>
              Narrow the directory by practice details.
            </SheetDescription>
          </SheetHeader>
          <Separator />
          <div className="px-4">
            <SecondaryFilterFields
              draft={draft}
              idPrefix="mobile"
              onChange={setDraft}
            />
          </div>
          <SheetFooter className="border-t">
            <Button
              variant="outline"
              onClick={() => setDraft({ specialization: "", hospital: "", limit: 20 })}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                onApply(draft)
                setOpen(false)
              }}
            >
              Apply filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function DoctorListFilters({
  search,
  appliedSearch,
  filters,
  limit,
  hasFilters,
  onSearchChange,
  onDateApply,
  onSecondaryApply,
  onRemoveFilter,
  onClear,
}: {
  search: string
  appliedSearch: string
  filters: DoctorFilterValues
  limit: number
  hasFilters: boolean
  onSearchChange: (value: string) => void
  onDateApply: (startDate: string, endDate: string) => void
  onSecondaryApply: (values: DoctorSecondaryFilterValues) => void
  onRemoveFilter: (name: RemovableFilter) => void
  onClear: () => void
}) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(() =>
    readDateRange(filters),
  )
  const hasDateRange = filters.startDate.length > 0 || filters.endDate.length > 0
  const secondaryValues: DoctorSecondaryFilterValues = {
    specialization: filters.specialization,
    hospital: filters.hospital,
    limit,
  }
  const secondaryCount =
    Number(filters.specialization.length > 0) +
    Number(filters.hospital.length > 0) +
    Number(limit !== 20)

  const handleCalendarOpenChange = (open: boolean): void => {
    setCalendarOpen(open)
    if (open) setDraftRange(readDateRange(filters))
  }

  const badges: { key: RemovableFilter; label: string }[] = [
    ...(appliedSearch.trim().length === 0
      ? []
      : [
          {
            key: "search" as const,
            label: `Search: ${appliedSearch.trim()}`,
          },
        ]),
    ...(filters.specialization.length === 0
      ? []
      : [{ key: "specialization" as const, label: filters.specialization }]),
    ...(filters.hospital.length === 0
      ? []
      : [{ key: "hospital" as const, label: filters.hospital }]),
    ...(hasDateRange
      ? [{ key: "startDate" as const, label: formatDateRange(readDateRange(filters)) }]
      : []),
    ...(limit === 20
      ? []
      : [{ key: "limit" as const, label: `${String(limit)} per page` }]),
  ]

  return (
    <section aria-label="Doctor search and filters" className="min-w-0 space-y-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <Input
            id="doctor-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, hospital, specialization, email, or phone..."
            aria-label="Search doctors"
            className="h-9 rounded-full border-white/25 bg-transparent pl-9 shadow-none focus-visible:bg-white/[0.04]"
          />
        </div>

        <div className="flex shrink-0 justify-end gap-2">
          <Popover open={calendarOpen} onOpenChange={handleCalendarOpenChange}>
            <CompactTooltip label="Filter by date added">
              <PopoverTrigger
                render={
                  <Button
                    variant={hasDateRange ? "default" : "outline"}
                    size="icon-lg"
                    className="rounded-full"
                    aria-label={
                      hasDateRange
                        ? `Date filter active: ${formatDateRange(readDateRange(filters))}`
                        : "Filter doctors by date added"
                    }
                  />
                }
              >
                <CalendarDays aria-hidden="true" />
              </PopoverTrigger>
            </CompactTooltip>
            <PopoverContent align="end" className="w-auto max-w-[calc(100vw-2rem)] p-3">
              <PopoverHeader className="px-1">
                <PopoverTitle>Date added</PopoverTitle>
                <PopoverDescription>{formatDateRange(draftRange)}</PopoverDescription>
              </PopoverHeader>
              <Separator />
              <Calendar
                mode="range"
                selected={draftRange}
                onSelect={setDraftRange}
                {...(draftRange?.from === undefined
                  ? {}
                  : { defaultMonth: draftRange.from })}
                numberOfMonths={1}
              />
              <Separator />
              <div className="flex justify-between gap-2 px-1">
                <Button variant="ghost" onClick={() => setDraftRange(undefined)}>
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    onDateApply(
                      draftRange?.from === undefined
                        ? ""
                        : format(draftRange.from, "yyyy-MM-dd"),
                      draftRange?.to === undefined
                        ? ""
                        : format(draftRange.to, "yyyy-MM-dd"),
                    )
                    setCalendarOpen(false)
                  }}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <DesktopSecondaryFilters
            key={`desktop-${filters.specialization}-${filters.hospital}-${String(limit)}`}
            values={secondaryValues}
            activeCount={secondaryCount}
            onApply={onSecondaryApply}
          />
          <MobileSecondaryFilters
            key={`mobile-${filters.specialization}-${filters.hospital}-${String(limit)}`}
            values={secondaryValues}
            activeCount={secondaryCount}
            onApply={onSecondaryApply}
          />
        </div>
      </div>

      {badges.length > 0 && (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {badges.map((badge) => (
            <Badge
              key={badge.key}
              variant="outline"
              render={
                <button
                  type="button"
                  onClick={() => onRemoveFilter(badge.key)}
                  aria-label={`Remove ${badge.label} filter`}
                />
              }
              className="h-7 max-w-full gap-1.5 px-2.5 hover:bg-white/[0.06]"
            >
              <span className="truncate">{badge.label}</span>
              <X aria-hidden="true" />
            </Badge>
          ))}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-neutral-400">
              Clear all
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
