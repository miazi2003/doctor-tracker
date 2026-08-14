import type { RequestHandler } from "express";

import {
  createDoctor as createDoctorRecord,
  getDoctorById,
  listDoctors,
} from "../services/doctor.service.js";
import {
  createDoctorSchema,
  doctorListQuerySchema,
  doctorParamsSchema,
} from "../validation/doctor.validation.js";

export const createDoctor: RequestHandler = async (request, response) => {
  const input = createDoctorSchema.parse(request.body);
  const doctor = await createDoctorRecord(input);

  response.status(201).json({
    success: true,
    data: { doctor },
  });
};

export const getDoctors: RequestHandler = async (request, response) => {
  const query = doctorListQuerySchema.parse(request.query);
  const result = await listDoctors(query);

  response.status(200).json({
    success: true,
    data: { doctors: result.doctors },
    pagination: result.pagination,
  });
};

export const getDoctor: RequestHandler = async (request, response) => {
  const { doctorId } = doctorParamsSchema.parse(request.params);
  const doctor = await getDoctorById(doctorId);

  response.status(200).json({
    success: true,
    data: { doctor },
  });
};
