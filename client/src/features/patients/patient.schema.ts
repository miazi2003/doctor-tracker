import { z } from "zod"

export const patientGenders = ["male", "female", "other"] as const

export const patientSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/iu),
  name: z.string(),
  age: z.number().int().min(0).max(130),
  gender: z.enum(patientGenders),
  phone: z.string(),
  condition: z.string(),
  appointmentDate: z.iso.datetime(),
  doctor: z.string().regex(/^[a-f\d]{24}$/iu),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).strict()

export const globalPatientSchema = patientSchema.extend({
  doctor: z.object({ id: z.string().regex(/^[a-f\d]{24}$/iu), name: z.string() }).strict().nullable(),
}).strict()

export const createPatientSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters").max(100),
  age: z.string().trim().min(1, "Age is required")
    .regex(/^\d+$/u, "Age must be a whole number")
    .transform(Number)
    .pipe(z.number().int().min(0).max(130)),
  gender: z.enum(patientGenders, { error: "Select a gender" }),
  phone: z.string().trim().min(7, "Phone must contain at least 7 characters").max(25)
    .regex(/^\+?[\d\s().-]+$/u, "Phone contains unsupported characters"),
  condition: z.string().trim().min(2, "Condition must contain at least 2 characters").max(200),
  appointmentDate: z.iso.date("Choose a valid appointment date"),
})

export type Patient = z.infer<typeof patientSchema>
export type GlobalPatient = z.infer<typeof globalPatientSchema>
export type EditablePatient = Omit<Patient, "doctor">
export type PatientGender = (typeof patientGenders)[number]
export type CreatePatientValues = z.input<typeof createPatientSchema>
export type CreatePatientPayload = z.output<typeof createPatientSchema>

export interface PatientListParameters {
  page: number
  limit: number
  search?: string
  condition?: string
  startDate?: string
  endDate?: string
  doctorId?: string
}

export interface PatientPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
