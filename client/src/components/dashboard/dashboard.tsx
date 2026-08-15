"use client"

import { useQuery } from "@tanstack/react-query"
import { Activity, CalendarClock, LoaderCircle, Stethoscope, UserRoundCheck, UsersRound, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useId, useMemo } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"

import { PageContainer } from "@/components/admin/page-container"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DashboardChartsSkeleton,
  DashboardDetailsSkeleton,
  DashboardHeadingSkeleton,
  DashboardMetricsSkeleton,
} from "@/components/dashboard/dashboard-skeleton"
import { DashboardApiError } from "@/features/dashboard/dashboard.api"
import { dashboardStatsQueryOptions } from "@/features/dashboard/dashboard.queries"
import { dashboardDays, type DashboardDays, type DashboardStats } from "@/features/dashboard/dashboard.schema"
import { cn } from "@/lib/utils"

import {
  dashboardChartColors,
  getConditionChartColor,
  withHexAlpha,
} from "./dashboard-chart-colors"

const compactNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })
const compactDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
const fullDate = new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
const appointmentDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" })
const dateFromDay = (value: string): Date => new Date(`${value}T00:00:00.000Z`)
const compactDoctorName = (value: string): string => value.length > 12 ? `${value.slice(0, 12)}...` : value
const isDashboardDays = (value: number): value is DashboardDays => dashboardDays.includes(value as DashboardDays)
const dateChartConfig = { patients: { label: "Patients", color: dashboardChartColors.date.blue } } satisfies ChartConfig
const doctorChartConfig = { patients: { label: "Patients", color: dashboardChartColors.doctor.middle } } satisfies ChartConfig
const dashboardCardClass = "gap-0 rounded-[1.35rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] py-0 text-neutral-100 ring-1 ring-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"

function MetricCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: LucideIcon }) {
  return (
    <article className="group h-full min-w-0 overflow-hidden rounded-[1.35rem] bg-[#0a0c0b] text-neutral-950 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
      <div className="flex h-[4.25rem] items-start justify-between gap-1.5 bg-[linear-gradient(180deg,#ffffff_0%,#e7e7e7_68%,#b9b9b9_100%)] px-3 pt-3.5 sm:h-[4.65rem] sm:gap-3 sm:px-5 sm:pt-4">
        <p className="min-w-0 truncate text-[0.7rem] font-semibold tracking-[-0.01em] sm:text-[0.8125rem]">{title}</p>
        <span className="-mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#050706] text-white shadow-lg transition-transform group-hover:scale-105 sm:size-10"><Icon className="size-4 sm:size-[1.15rem]" aria-hidden="true" /></span>
      </div>
      <div className="relative -mt-4 min-h-[6.6rem] rounded-[1.35rem] bg-[linear-gradient(145deg,#151817_0%,#0a0c0b_68%)] px-3 py-4 text-white shadow-[0_-12px_28px_rgba(0,0,0,0.34)] before:pointer-events-none before:absolute before:inset-x-8 before:-top-3 before:h-5 before:rounded-full before:bg-black/25 before:blur-lg sm:px-5">
        <p className="text-[1.75rem] leading-none font-medium tracking-[-0.045em] tabular-nums sm:text-[2rem]">{value}</p>
        <p className="mt-2.5 text-[0.7rem] leading-4 text-neutral-400 sm:text-xs sm:leading-5">{description}</p>
      </div>
    </article>
  )
}

function EmptyChart({ message }: { message: string }) {
  return <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 text-center text-sm text-neutral-500">{message}</div>
}

function PanelHeading({ title, description }: { title: string; description: string }) {
  return <CardHeader className="gap-1.5 px-5 pt-5 pb-0 sm:px-6 sm:pt-6"><CardTitle className="text-base font-medium tracking-[-0.02em] text-white">{title}</CardTitle><CardDescription className="text-xs leading-5 text-neutral-500">{description}</CardDescription></CardHeader>
}

function DateChart({ stats }: { stats: DashboardStats }) {
  const data = stats.patientsByDate.map((item) => ({ ...item, patients: item.count }))
  const chartId = useId().replace(/:/gu, "")
  const lineGradientId = `patient-line-${chartId}`
  const areaGradientId = `patient-area-${chartId}`
  return (
    <Card className={cn(dashboardCardClass, "min-w-0")}>
      <PanelHeading title="Patients by date" description="Appointments across the selected UTC calendar period." />
      <CardContent className="px-2 pt-4 pb-3 sm:px-4">
        <ChartContainer config={dateChartConfig} className="h-64 w-full min-w-0 aspect-auto text-neutral-500 [&_.recharts-cartesian-axis-tick_text]:fill-neutral-500 [&_.recharts-cartesian-grid_line]:stroke-white/[0.07]" role="img" aria-label="Area chart of patients by appointment date">
          <AreaChart data={data} margin={{ left: 0, right: 10, top: 8, bottom: 0 }} accessibilityLayer>
            <defs>
              <linearGradient id={lineGradientId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={dashboardChartColors.date.blue} />
                <stop offset="58%" stopColor={dashboardChartColors.date.highlight} />
                <stop offset="100%" stopColor={dashboardChartColors.date.cyan} />
              </linearGradient>
              <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={dashboardChartColors.date.blue} stopOpacity={0.3} />
                <stop offset="55%" stopColor={dashboardChartColors.date.blue} stopOpacity={0.09} />
                <stop offset="100%" stopColor={dashboardChartColors.date.blue} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 5" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={28} tickMargin={12} tickFormatter={(value: string) => compactDate.format(dateFromDay(value))} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
            <ChartTooltip cursor={{ stroke: "rgba(255,255,255,0.14)" }} content={<ChartTooltipContent className="border-white/10 bg-[#111412] text-neutral-100" indicator="line" labelFormatter={(value) => fullDate.format(dateFromDay(String(value)))} />} />
            <Area dataKey="patients" type="monotone" fill={`url(#${areaGradientId})`} stroke={`url(#${lineGradientId})`} strokeWidth={2.25} dot={false} activeDot={{ r: 4, fill: dashboardChartColors.date.highlight, stroke: "#0a0c0b", strokeWidth: 2 }} isAnimationActive={false} style={{ filter: "drop-shadow(0 0 4px rgb(59 130 246 / 24%))" }} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function DoctorChart({ stats }: { stats: DashboardStats }) {
  const data = stats.patientsPerDoctor.map((item) => ({ doctor: item.doctor?.name ?? "Doctor unavailable", patients: item.count }))
  const chartId = useId().replace(/:/gu, "")
  const barGradientId = `doctor-bar-${chartId}`
  const barShadowId = `doctor-shadow-${chartId}`
  return (
    <Card className={cn(dashboardCardClass, "min-w-0")}>
      <PanelHeading title="Patients per Doctor" description="Top Doctors by assigned Patient count." />
      <CardContent className="min-w-0 px-3 pt-4 pb-3 sm:px-5">
        {data.length === 0 ? <EmptyChart message="Patient assignments will appear here once records are added." /> : (
          <div className="overflow-x-auto pb-1 [scrollbar-color:#404040_transparent]">
            <ChartContainer config={doctorChartConfig} className="h-64 aspect-auto text-neutral-500 [&_.recharts-bar-rectangle_path]:transition-[filter,stroke] [&_.recharts-bar-rectangle_path]:duration-200 [&_.recharts-bar-rectangle_path:hover]:stroke-white/40 [&_.recharts-bar-rectangle_path:hover]:brightness-110 [&_.recharts-cartesian-axis-tick_text]:fill-neutral-100 [&_.recharts-cartesian-grid_line]:stroke-white/[0.06] motion-reduce:[&_.recharts-bar-rectangle_path]:transition-none" style={{ minWidth: Math.max(576, data.length * 92) }} role="img" aria-label="Vertical bar chart of patients per Doctor">
              <BarChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 8 }} accessibilityLayer>
                <defs>
                  <linearGradient id={barGradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={dashboardChartColors.doctor.top} />
                    <stop offset="52%" stopColor={dashboardChartColors.doctor.middle} />
                    <stop offset="100%" stopColor={dashboardChartColors.doctor.bottom} />
                  </linearGradient>
                  <filter id={barShadowId} x="-30%" y="-20%" width="160%" height="150%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={dashboardChartColors.doctor.middle} floodOpacity="0.18" />
                  </filter>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 5" />
                <XAxis dataKey="doctor" type="category" interval={0} tickLine={false} axisLine={false} tickMargin={12} height={44} tick={{ fontSize: 11 }} tickFormatter={compactDoctorName} />
                <YAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip cursor={{ fill: "rgba(255,255,255,0.035)", radius: 14 }} content={<ChartTooltipContent className="border-white/10 bg-[#111412] text-neutral-100" labelFormatter={(value) => String(value)} />} />
                <Bar dataKey="patients" fill={`url(#${barGradientId})`} filter={`url(#${barShadowId})`} radius={[16, 16, 4, 4]} stroke="transparent" strokeWidth={1} maxBarSize={58} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ConditionChart({ stats }: { stats: DashboardStats }) {
  const { data, config } = useMemo(() => {
    const chartConfig: ChartConfig = {}
    const chartData = stats.patientsByCondition.map((item, index) => {
      const key = `condition${String(index)}`
      const color = getConditionChartColor(item.condition, index)
      chartConfig[key] = { label: item.condition, color }
      return { ...item, key, color, fill: `var(--color-${key})` }
    })
    return { data: chartData, config: chartConfig }
  }, [stats.patientsByCondition])
  return (
    <Card className={cn(dashboardCardClass, "min-w-0")}>
      <PanelHeading title="Patients by condition" description="Leading conditions, with smaller categories grouped as Other." />
      <CardContent className="pt-4 pb-5 sm:px-5">
        {data.length === 0 ? <EmptyChart message="Condition distribution will appear once Patients are added." /> : (
          <div className="grid items-center gap-2 sm:grid-cols-[minmax(10rem,0.85fr)_minmax(11rem,1fr)] xl:grid-cols-1 2xl:grid-cols-[minmax(10rem,0.85fr)_minmax(11rem,1fr)]">
            <ChartContainer config={config} className="mx-auto h-52 w-full min-w-0 max-w-56 aspect-auto" role="img" aria-label="Donut chart of patients by condition">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent className="border-white/10 bg-[#111412] text-neutral-100" nameKey="key" hideLabel />} />
                <Pie data={data} dataKey="count" nameKey="key" innerRadius={48} outerRadius={78} paddingAngle={2} stroke="#0a0c0b" strokeWidth={1} isAnimationActive={false}>{data.map((item) => <Cell key={item.key} fill={item.fill} />)}</Pie>
              </PieChart>
            </ChartContainer>
            <ul className="grid min-w-0 gap-2" aria-label="Patient condition totals">
              {data.map((item) => <li key={item.key} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-[0.75rem]"><span className="size-2.5 rounded-[0.2rem]" style={{ backgroundColor: item.color }} aria-hidden="true" /><span className="truncate text-neutral-300" title={item.condition}>{item.condition}</span><span className="text-right font-medium text-neutral-400 tabular-nums">{compactNumber.format(item.count)}</span></li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/u).filter(Boolean).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase() || "P"
}

function UpcomingPatients({ stats }: { stats: DashboardStats }) {
  const patients = stats.upcomingPatients
  const conditionColors = useMemo(
    () => new Map(stats.patientsByCondition.map((item, index) => [item.condition, getConditionChartColor(item.condition, index)])),
    [stats.patientsByCondition],
  )
  return (
    <Card className={cn(dashboardCardClass, "min-w-0")}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
        <div className="min-w-0"><CardTitle className="text-base font-medium tracking-[-0.02em] text-white">Upcoming Patients</CardTitle><CardDescription className="mt-1.5 text-xs leading-5 text-neutral-500">Next scheduled appointments in UTC.</CardDescription></div>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/patients" />} className="h-8 rounded-full border-white/10 bg-white/[0.04] px-3 text-xs text-neutral-200 hover:bg-white/10 hover:text-white">View all</Button>
      </CardHeader>
      {patients.length === 0 ? <CardContent className="flex min-h-64 items-center justify-center px-6 text-center text-sm text-neutral-500">No upcoming appointments are scheduled.</CardContent> : (
        <CardContent className="min-w-0 px-0 pt-4 pb-4">
          <div className="overflow-x-auto px-5 [scrollbar-color:#404040_transparent] sm:px-6">
            <table className="w-full min-w-[46rem] table-fixed text-left">
              <thead>
                <tr className="border-b border-white/[0.07] text-[0.7rem] font-medium tracking-wide text-neutral-500 uppercase">
                  <th scope="col" className="w-[29%] px-1 pb-2 font-medium">Patient</th>
                  <th scope="col" className="w-[20%] px-2 pb-2 font-medium">Condition</th>
                  <th scope="col" className="w-[29%] px-2 pb-2 font-medium">Appointment</th>
                  <th scope="col" className="w-[22%] px-2 pb-2 font-medium">Doctor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-1 py-3"><div className="flex min-w-0 items-center gap-2.5"><Avatar size="sm" className="size-8"><AvatarFallback className="bg-[linear-gradient(145deg,#ffffff,#bdbdbd)] text-[0.68rem] font-bold text-neutral-950">{getInitials(patient.name)}</AvatarFallback></Avatar><span className="truncate text-xs font-medium text-neutral-100" title={patient.name}>{patient.name}</span></div></td>
                    <td className="px-2 py-3"><Badge variant="outline" className="w-fit max-w-full rounded-full px-2.5 py-1 text-[0.72rem] font-normal" style={{ color: conditionColors.get(patient.condition) ?? dashboardChartColors.condition.other, borderColor: withHexAlpha(conditionColors.get(patient.condition) ?? dashboardChartColors.condition.other, "42"), backgroundColor: withHexAlpha(conditionColors.get(patient.condition) ?? dashboardChartColors.condition.other, "0F") }}><span className="truncate">{patient.condition}</span></Badge></td>
                    <td className="px-2 py-3"><time dateTime={patient.appointmentDate} className="text-xs leading-5 whitespace-nowrap text-neutral-300">{appointmentDate.format(new Date(patient.appointmentDate))}</time></td>
                    <td className="truncate px-2 py-3 text-xs text-neutral-400" title={patient.doctor?.name ?? "Doctor unavailable"}>{patient.doctor?.name ?? "Doctor unavailable"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function Dashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const requestedDays = Number(searchParams.get("days") ?? "30")
  const days: DashboardDays = isDashboardDays(requestedDays) ? requestedDays : 30
  const query = useQuery(dashboardStatsQueryOptions(days))
  if (query.isError) return (
    <PageContainer className="dark min-h-[calc(100vh-4rem)] bg-[#070908] text-neutral-100 lg:min-h-[calc(100vh-5rem)]">
      <div className="space-y-5"><div><p className="text-sm font-medium text-neutral-500">Overview</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">Analytics dashboard</h2></div><Alert variant="destructive" className="border-red-400/20 bg-red-950/20 text-red-100"><AlertTitle>Dashboard analytics could not be loaded</AlertTitle><AlertDescription className="flex flex-col items-start justify-between gap-4 text-red-200/80 sm:flex-row sm:items-center"><span>{query.error instanceof DashboardApiError && query.error.kind === "network" ? "Check your connection and try again." : "The server returned an unexpected response. Please try again."}</span><Button variant="outline" size="sm" className="rounded-full border-red-200/20 bg-white/5" onClick={() => void query.refetch()}>Try again</Button></AlertDescription></Alert></div>
    </PageContainer>
  )
  const stats = query.data
  const isEmpty = stats !== undefined && stats.totalDoctors === 0 && stats.totalPatients === 0
  return (
    <PageContainer className="dark min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_65%_-10%,rgba(255,255,255,0.045),transparent_27%),#070908] text-neutral-100 lg:min-h-[calc(100vh-5rem)] lg:px-6 lg:py-7 xl:px-7">
      <div className="space-y-5">
        {stats === undefined ? <DashboardHeadingSkeleton /> : <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><h2 className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-[1.75rem]">Analytics dashboard</h2><p className="mt-1.5 max-w-2xl text-sm leading-6 text-neutral-400">Monitor Patient activity, Doctor workloads, and upcoming appointments.</p></div>
          <div className="flex min-h-11 self-end flex-col items-end gap-1.5 sm:self-auto sm:flex-row sm:items-center sm:gap-3">
            <label htmlFor="dashboard-date-range" className="text-xs font-medium text-neutral-400">
              Date range
            </label>
            <Select value={String(days)} onValueChange={(value) => { const nextDays = Number(value); if (!isDashboardDays(nextDays)) return; const next = new URLSearchParams(searchParams.toString()); next.set("days", String(nextDays)); router.replace(`${pathname}?${next.toString()}`, { scroll: false }) }}>
              <SelectTrigger id="dashboard-date-range" className="h-11 w-36 rounded-full border-white/10 bg-white/[0.045] px-4 text-neutral-100 hover:bg-white/[0.07]" aria-label="Dashboard date range"><SelectValue /></SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111412] text-neutral-100 ring-white/10">{dashboardDays.map((option) => <SelectItem key={option} value={String(option)} className="focus:bg-white/10 focus:text-white">Last {option} days</SelectItem>)}</SelectContent>
            </Select>
            {query.isFetching && <span role="status" className="flex items-center gap-1.5 text-xs text-neutral-500"><LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />Updating</span>}
          </div>
        </header>}
        {isEmpty && <Alert className="border-white/10 bg-white/[0.035] text-neutral-200"><Activity aria-hidden="true" /><AlertTitle>No analytics yet</AlertTitle><AlertDescription className="text-neutral-400">Add Doctors and Patients to begin building dashboard insights. The selected date chart still shows the complete zero-filled period.</AlertDescription></Alert>}
        {stats === undefined ? <DashboardMetricsSkeleton /> : <section aria-label="Summary" className="grid grid-cols-2 gap-2.5 sm:gap-4 2xl:grid-cols-4"><MetricCard title="Total Doctors" value={compactNumber.format(stats.totalDoctors)} description="Active Doctor profiles" icon={Stethoscope} /><MetricCard title="Total Patients" value={compactNumber.format(stats.totalPatients)} description="All Patient records" icon={UsersRound} /><MetricCard title="Patients in period" value={compactNumber.format(stats.patientsInSelectedPeriod)} description={`Appointments in the last ${String(days)} UTC days`} icon={CalendarClock} /><MetricCard title="Average per Doctor" value={compactNumber.format(stats.averagePatientsPerDoctor)} description="Patients divided by total Doctors" icon={UserRoundCheck} /></section>}
        {stats === undefined ? <DashboardChartsSkeleton /> : <section aria-label="Appointment analytics" className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,1fr)]"><DateChart stats={stats} /><DoctorChart stats={stats} /></section>}
        {stats === undefined ? <DashboardDetailsSkeleton /> : <section aria-label="Condition and upcoming Patient analytics" className="grid min-w-0 gap-4 xl:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.6fr)]"><ConditionChart stats={stats} /><UpcomingPatients stats={stats} /></section>}
      </div>
    </PageContainer>
  )
}
