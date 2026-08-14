import type { RequestHandler } from "express";

import {
  createPatient as createPatientRecord,
  deletePatient as deletePatientRecord,
  getPatientById,
  listPatients,
  listPatientsForDoctor,
  updatePatient as updatePatientRecord,
} from "../services/patient.service.js";
import {
  createPatientSchema,
  doctorPatientListQuerySchema,
  doctorPatientParamsSchema,
  patientListQuerySchema,
  patientParamsSchema,
  updatePatientSchema,
} from "../validation/patient.validation.js";

export const createPatientForDoctor: RequestHandler = async (
  request,
  response,
) => {
  const { doctorId } = doctorPatientParamsSchema.parse(request.params);
  const input = createPatientSchema.parse(request.body);
  const patient = await createPatientRecord(doctorId, input);

  response.status(201).json({ success: true, data: { patient } });
};

export const getPatientsForDoctor: RequestHandler = async (
  request,
  response,
) => {
  const { doctorId } = doctorPatientParamsSchema.parse(request.params);
  const query = doctorPatientListQuerySchema.parse(request.query);
  const result = await listPatientsForDoctor(doctorId, query);

  response.status(200).json({
    success: true,
    data: { patients: result.patients },
    pagination: result.pagination,
  });
};

export const getPatients: RequestHandler = async (request, response) => {
  const query = patientListQuerySchema.parse(request.query);
  const result = await listPatients(query);

  response.status(200).json({
    success: true,
    data: { patients: result.patients },
    pagination: result.pagination,
  });
};

export const getPatient: RequestHandler = async (request, response) => {
  const { patientId } = patientParamsSchema.parse(request.params);
  const patient = await getPatientById(patientId);
  response.status(200).json({ success: true, data: { patient } });
};

export const updatePatient: RequestHandler = async (request, response) => {
  const { patientId } = patientParamsSchema.parse(request.params);
  const input = updatePatientSchema.parse(request.body);
  const patient = await updatePatientRecord(patientId, input);
  response.status(200).json({ success: true, data: { patient } });
};

export const deletePatient: RequestHandler = async (request, response) => {
  const { patientId } = patientParamsSchema.parse(request.params);
  const patient = await deletePatientRecord(patientId);
  response.status(200).json({ success: true, data: { patient } });
};
