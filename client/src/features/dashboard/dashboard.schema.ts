import { z } from "zod"

export const dashboardDays = [7, 30, 90] as const
export type DashboardDays = (typeof dashboardDays)[number]

const minimalDoctorSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/iu),
  name: z.string(),
}).strict()

export const dashboardStatsSchema = z.object({
  totalDoctors: z.number().int().nonnegative(),
  totalPatients: z.number().int().nonnegative(),
  patientsInSelectedPeriod: z.number().int().nonnegative(),
  averagePatientsPerDoctor: z.number().nonnegative(),
  patientsPerDoctor: z.array(z.object({
    doctor: minimalDoctorSchema.nullable(),
    count: z.number().int().nonnegative(),
  }).strict()),
  patientsByDate: z.array(z.object({
    date: z.iso.date(),
    count: z.number().int().nonnegative(),
  }).strict()),
  patientsByCondition: z.array(z.object({
    condition: z.string(),
    count: z.number().int().nonnegative(),
  }).strict()),
  upcomingPatients: z.array(z.object({
    id: z.string().regex(/^[a-f\d]{24}$/iu),
    name: z.string(),
    condition: z.string(),
    appointmentDate: z.iso.datetime(),
    doctor: minimalDoctorSchema.nullable(),
  }).strict()),
}).strict()

export type DashboardStats = z.infer<typeof dashboardStatsSchema>
