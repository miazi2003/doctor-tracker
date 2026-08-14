"use client"

import { useQuery } from "@tanstack/react-query"
import { Activity, CalendarClock, LoaderCircle, Stethoscope, UserRoundCheck, UsersRound, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"

import { PageContainer } from "@/components/admin/page-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardApiError } from "@/features/dashboard/dashboard.api"
import { dashboardStatsQueryOptions } from "@/features/dashboard/dashboard.queries"
import { dashboardDays, type DashboardDays, type DashboardStats } from "@/features/dashboard/dashboard.schema"

const compactNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })
const compactDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
const fullDate = new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
const appointmentDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" })
const dateFromDay = (value: string): Date => new Date(`${value}T00:00:00.000Z`)
const isDashboardDays = (value: number): value is DashboardDays => dashboardDays.includes(value as DashboardDays)
const dateChartConfig = { patients: { label: "Patients", color: "var(--chart-5)" } } satisfies ChartConfig
const doctorChartConfig = { patients: { label: "Patients", color: "var(--chart-4)" } } satisfies ChartConfig
const conditionColors = ["var(--chart-5)", "var(--chart-4)", "var(--chart-3)", "var(--chart-2)", "var(--chart-1)"] as const

function DashboardSkeleton() {
  return <PageContainer><div role="status" aria-label="Loading dashboard" className="space-y-6"><div className="flex items-start justify-between gap-4"><div className="space-y-2"><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-80 max-w-full" /></div><Skeleton className="h-8 w-28" /></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Card key={index}><CardHeader><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-20" /></CardHeader></Card>)}</div><div className="grid gap-4 xl:grid-cols-2"><Skeleton className="h-80 w-full rounded-xl" /><Skeleton className="h-80 w-full rounded-xl" /></div><div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><Skeleton className="h-80 w-full rounded-xl" /><Skeleton className="h-80 w-full rounded-xl" /></div></div></PageContainer>
}

function MetricCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: LucideIcon }) {
  return <Card><CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardDescription>{title}</CardDescription><CardTitle className="mt-2 text-3xl tabular-nums">{value}</CardTitle></div><span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground"><Icon className="size-4.5" aria-hidden="true" /></span></CardHeader><CardContent><p className="text-xs text-muted-foreground">{description}</p></CardContent></Card>
}

function EmptyChart({ message }: { message: string }) { return <div className="flex h-64 items-center justify-center rounded-lg border border-dashed px-6 text-center text-sm text-muted-foreground">{message}</div> }

function DateChart({ stats }: { stats: DashboardStats }) {
  const data = stats.patientsByDate.map((item) => ({ ...item, patients: item.count }))
  return <Card className="min-w-0"><CardHeader><CardTitle>Patients by date</CardTitle><CardDescription>Appointments across the selected UTC calendar period.</CardDescription></CardHeader><CardContent><ChartContainer config={dateChartConfig} className="h-64 w-full min-w-0 aspect-auto" role="img" aria-label="Line chart of patients by appointment date"><LineChart data={data} margin={{ left: 0, right: 10, top: 8, bottom: 0 }} accessibilityLayer><CartesianGrid vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={28} tickFormatter={(value: string) => compactDate.format(dateFromDay(value))} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} /><ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" labelFormatter={(value) => fullDate.format(dateFromDay(String(value)))} />} /><Line dataKey="patients" type="monotone" stroke="var(--color-patients)" strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ChartContainer></CardContent></Card>
}

function DoctorChart({ stats }: { stats: DashboardStats }) {
  const data = stats.patientsPerDoctor.map((item) => ({ doctor: item.doctor?.name ?? "Doctor unavailable", patients: item.count }))
  return <Card className="min-w-0"><CardHeader><CardTitle>Patients per Doctor</CardTitle><CardDescription>Top Doctors by assigned Patient count.</CardDescription></CardHeader><CardContent>{data.length === 0 ? <EmptyChart message="Patient assignments will appear here once records are added." /> : <ChartContainer config={doctorChartConfig} className="h-64 w-full min-w-0 aspect-auto" role="img" aria-label="Horizontal bar chart of patients per Doctor"><BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }} accessibilityLayer><CartesianGrid horizontal={false} /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} /><YAxis dataKey="doctor" type="category" width={112} tickLine={false} axisLine={false} tickFormatter={(value: string) => value.length > 17 ? `${value.slice(0, 16)}…` : value} /><ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(value) => String(value)} />} /><Bar dataKey="patients" fill="var(--color-patients)" radius={[0, 4, 4, 0]} isAnimationActive={false} /></BarChart></ChartContainer>}</CardContent></Card>
}

function ConditionChart({ stats }: { stats: DashboardStats }) {
  const { data, config } = useMemo(() => {
    const chartConfig: ChartConfig = {}
    const chartData = stats.patientsByCondition.map((item, index) => {
      const key = `condition${String(index)}`
      chartConfig[key] = { label: item.condition, color: conditionColors[index % conditionColors.length] ?? conditionColors[0] }
      return { ...item, key, fill: `var(--color-${key})` }
    })
    return { data: chartData, config: chartConfig }
  }, [stats.patientsByCondition])
  return <Card className="min-w-0"><CardHeader><CardTitle>Patients by condition</CardTitle><CardDescription>Leading conditions, with smaller categories grouped as Other.</CardDescription></CardHeader><CardContent>{data.length === 0 ? <EmptyChart message="Condition distribution will appear once Patients are added." /> : <ChartContainer config={config} className="h-72 w-full min-w-0 aspect-auto" role="img" aria-label="Donut chart of patients by condition"><PieChart accessibilityLayer><ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} /><Pie data={data} dataKey="count" nameKey="key" innerRadius={54} outerRadius={82} paddingAngle={2} isAnimationActive={false}>{data.map((item) => <Cell key={item.key} fill={item.fill} />)}</Pie><ChartLegend content={<ChartLegendContent nameKey="key" className="flex-wrap gap-x-3 gap-y-2 text-xs" />} /></PieChart></ChartContainer>}</CardContent></Card>
}

function UpcomingPatients({ stats }: { stats: DashboardStats }) {
  const patients = stats.upcomingPatients
  return <Card className="min-w-0"><CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>Upcoming Patients</CardTitle><CardDescription>Next scheduled appointments in UTC.</CardDescription></div><Button variant="outline" size="sm" nativeButton={false} render={<Link href="/patients" />}>View all</Button></CardHeader><Separator />{patients.length === 0 ? <CardContent className="flex min-h-56 items-center justify-center text-center text-sm text-muted-foreground">No upcoming appointments are scheduled.</CardContent> : <CardContent className="px-0"><div className="hidden md:block"><Table><TableHeader><TableRow><TableHead className="pl-6">Patient</TableHead><TableHead>Condition</TableHead><TableHead>Appointment</TableHead><TableHead className="pr-6">Doctor</TableHead></TableRow></TableHeader><TableBody>{patients.map((patient) => <TableRow key={patient.id}><TableCell className="pl-6 font-medium">{patient.name}</TableCell><TableCell><Badge variant="outline">{patient.condition}</Badge></TableCell><TableCell className="whitespace-nowrap"><time dateTime={patient.appointmentDate}>{appointmentDate.format(new Date(patient.appointmentDate))}</time></TableCell><TableCell className="pr-6">{patient.doctor?.name ?? "Doctor unavailable"}</TableCell></TableRow>)}</TableBody></Table></div><div className="grid gap-3 p-4 md:hidden">{patients.map((patient) => <div key={patient.id} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><p className="font-medium">{patient.name}</p><Badge variant="outline" className="max-w-36 truncate">{patient.condition}</Badge></div><dl className="mt-4 grid gap-3 text-sm"><div><dt className="text-xs text-muted-foreground">Appointment</dt><dd className="mt-1"><time dateTime={patient.appointmentDate}>{appointmentDate.format(new Date(patient.appointmentDate))}</time></dd></div><div><dt className="text-xs text-muted-foreground">Doctor</dt><dd className="mt-1">{patient.doctor?.name ?? "Doctor unavailable"}</dd></div></dl></div>)}</div></CardContent>}</Card>
}

export function Dashboard() {
  const router = useRouter(), pathname = usePathname(), searchParams = useSearchParams()
  const requestedDays = Number(searchParams.get("days") ?? "30")
  const days: DashboardDays = isDashboardDays(requestedDays) ? requestedDays : 30
  const query = useQuery(dashboardStatsQueryOptions(days))
  if (query.isPending) return <DashboardSkeleton />
  if (query.isError) return <PageContainer><div className="space-y-5"><div><p className="text-sm font-medium text-neutral-500">Overview</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">Analytics dashboard</h2></div><Alert variant="destructive"><AlertTitle>Dashboard analytics could not be loaded</AlertTitle><AlertDescription className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><span>{query.error instanceof DashboardApiError && query.error.kind === "network" ? "Check your connection and try again." : "The server returned an unexpected response. Please try again."}</span><Button variant="outline" size="sm" onClick={() => void query.refetch()}>Try again</Button></AlertDescription></Alert></div></PageContainer>
  const stats = query.data
  const isEmpty = stats.totalDoctors === 0 && stats.totalPatients === 0
  return <PageContainer><div className="space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-medium text-neutral-500">Overview</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">Analytics dashboard</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">Monitor Patient activity, Doctor workloads, and upcoming appointments.</p></div><div className="flex items-center gap-2"><Select value={String(days)} onValueChange={(value) => { const nextDays = Number(value); if (!isDashboardDays(nextDays)) return; const next = new URLSearchParams(searchParams.toString()); next.set("days", String(nextDays)); router.replace(`${pathname}?${next.toString()}`, { scroll: false }) }}><SelectTrigger className="w-32" aria-label="Dashboard date range"><SelectValue /></SelectTrigger><SelectContent>{dashboardDays.map((option) => <SelectItem key={option} value={String(option)}>Last {option} days</SelectItem>)}</SelectContent></Select>{query.isFetching && <span role="status" className="flex items-center gap-1.5 text-xs text-muted-foreground"><LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />Updating</span>}</div></header>
    {isEmpty && <Alert><Activity aria-hidden="true" /><AlertTitle>No analytics yet</AlertTitle><AlertDescription>Add Doctors and Patients to begin building dashboard insights. The selected date chart still shows the complete zero-filled period.</AlertDescription></Alert>}
    <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard title="Total Doctors" value={compactNumber.format(stats.totalDoctors)} description="Active Doctor profiles" icon={Stethoscope} /><MetricCard title="Total Patients" value={compactNumber.format(stats.totalPatients)} description="All Patient records" icon={UsersRound} /><MetricCard title="Patients in period" value={compactNumber.format(stats.patientsInSelectedPeriod)} description={`Appointments in the last ${String(days)} UTC days`} icon={CalendarClock} /><MetricCard title="Average per Doctor" value={compactNumber.format(stats.averagePatientsPerDoctor)} description="Patients divided by total Doctors" icon={UserRoundCheck} /></section>
    <section aria-label="Appointment analytics" className="grid min-w-0 gap-4 xl:grid-cols-2"><DateChart stats={stats} /><DoctorChart stats={stats} /></section>
    <section aria-label="Condition and upcoming Patient analytics" className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><ConditionChart stats={stats} /><UpcomingPatients stats={stats} /></section>
  </div></PageContainer>
}
