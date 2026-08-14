import { z } from "zod";

import { PATIENT_GENDERS } from "../models/patient.model.js";

const objectId = (field: string) =>
  z.string().regex(/^[a-f\d]{24}$/iu, `${field} must be a valid ObjectId`);

const trimmedText = (field: string, minimum: number, maximum: number) =>
  z
    .string({ error: `${field} must be a string` })
    .trim()
    .min(minimum, `${field} must contain at least ${String(minimum)} characters`)
    .max(maximum, `${field} must contain at most ${String(maximum)} characters`);

const appointmentDate = z
  .union([
    z.iso.date({ error: "appointmentDate must be a valid ISO date" }),
    z.iso.datetime({ offset: true, error: "appointmentDate must be a valid ISO date" }),
  ])
  .transform((value) =>
    new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value),
  );

const patientFields = {
  name: trimmedText("name", 2, 100),
  age: z.number({ error: "age must be a number" }).int().min(0).max(130),
  gender: z.enum(PATIENT_GENDERS),
  phone: trimmedText("phone", 7, 25).regex(
    /^\+?[\d\s().-]+$/u,
    "phone contains unsupported characters",
  ),
  condition: trimmedText("condition", 2, 200),
  appointmentDate,
} as const;

export const createPatientSchema = z.object(patientFields).strict();

export const updatePatientSchema = z
  .object(patientFields)
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one editable field is required",
  });

export const doctorPatientParamsSchema = z
  .object({ doctorId: objectId("doctorId") })
  .strict();

export const patientParamsSchema = z
  .object({ patientId: objectId("patientId") })
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

const patientListFields = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: optionalQueryText("search", 100),
  condition: optionalQueryText("condition", 200),
  startDate: dateString("startDate"),
  endDate: dateString("endDate"),
} as const;

const validateDateRange = (
  query: { startDate?: string | undefined; endDate?: string | undefined },
  context: z.RefinementCtx,
): void => {
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
};

export const doctorPatientListQuerySchema = z
  .object(patientListFields)
  .strict()
  .superRefine(validateDateRange);

export const patientListQuerySchema = z
  .object({
    ...patientListFields,
    doctorId: objectId("doctorId").optional(),
  })
  .strict()
  .superRefine(validateDateRange);

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type DoctorPatientListQuery = z.infer<
  typeof doctorPatientListQuerySchema
>;
export type PatientListQuery = z.infer<typeof patientListQuerySchema>;
