import { z } from "zod";

const trimmedText = (field: string, minimum: number, maximum: number) =>
  z
    .string({ error: `${field} must be a string` })
    .trim()
    .min(minimum, `${field} must contain at least ${String(minimum)} characters`)
    .max(maximum, `${field} must contain at most ${String(maximum)} characters`);

export const createDoctorSchema = z
  .object({
    name: trimmedText("name", 2, 100),
    specialization: trimmedText("specialization", 2, 100),
    hospital: trimmedText("hospital", 2, 150),
    phone: trimmedText("phone", 7, 25).regex(
      /^\+?[\d\s().-]+$/u,
      "phone contains unsupported characters",
    ),
    email: z
      .string({ error: "email must be a string" })
      .trim()
      .toLowerCase()
      .pipe(z.email("email must be a valid email address").max(254)),
  })
  .strict();

export const doctorParamsSchema = z
  .object({
    doctorId: z
      .string()
      .regex(/^[a-f\d]{24}$/iu, "doctorId must be a valid ObjectId"),
  })
  .strict();

const optionalQueryText = (field: string, maximum: number) =>
  z
    .string({ error: `${field} must be a string` })
    .trim()
    .min(1, `${field} cannot be empty`)
    .max(maximum, `${field} must contain at most ${String(maximum)} characters`)
    .optional();

const dateString = (field: string) =>
  z.iso.date({ error: `${field} must use YYYY-MM-DD format` }).optional();

export const doctorListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: optionalQueryText("search", 100),
    specialization: optionalQueryText("specialization", 100),
    hospital: optionalQueryText("hospital", 150),
    startDate: dateString("startDate"),
    endDate: dateString("endDate"),
  })
  .strict()
  .superRefine((query, context) => {
    if (
      query.startDate !== undefined &&
      query.endDate !== undefined &&
      query.startDate > query.endDate
    ) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "endDate must be on or after startDate",
      });
    }
  });

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type DoctorListQuery = z.infer<typeof doctorListQuerySchema>;
