import { z } from "zod"

export const doctorSchema = z
  .object({
    id: z.string().regex(/^[a-f\d]{24}$/iu),
    name: z.string(),
    specialization: z.string(),
    hospital: z.string(),
    phone: z.string(),
    email: z.email(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict()

export const createDoctorSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters").max(100),
  specialization: z
    .string()
    .trim()
    .min(2, "Specialization must contain at least 2 characters")
    .max(100),
  hospital: z
    .string()
    .trim()
    .min(2, "Hospital must contain at least 2 characters")
    .max(150),
  phone: z
    .string()
    .trim()
    .min(7, "Phone must contain at least 7 characters")
    .max(25)
    .regex(/^\+?[\d\s().-]+$/u, "Phone contains unsupported characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address").max(254)),
})

export type Doctor = z.infer<typeof doctorSchema>
export type CreateDoctorValues = z.infer<typeof createDoctorSchema>

export interface DoctorListParameters {
  page: number
  limit: number
  search?: string
  specialization?: string
  hospital?: string
  startDate?: string
  endDate?: string
}

export interface DoctorPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
