import { Types } from "mongoose";

import { AppError } from "../errors/app-error.js";
import { DoctorModel } from "../models/doctor.model.js";
import {
  PATIENT_FILTER_COLLATION,
  PatientModel,
  type PatientGender,
} from "../models/patient.model.js";
import type {
  CreatePatientInput,
  DoctorPatientListQuery,
  PatientListQuery,
  UpdatePatientInput,
} from "../validation/patient.validation.js";

const PATIENT_PROJECTION = {
  _id: 1,
  name: 1,
  age: 1,
  gender: 1,
  phone: 1,
  condition: 1,
  appointmentDate: 1,
  doctor: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

interface PatientRecord {
  _id: { toString(): string };
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  condition: string;
  appointmentDate: Date;
  doctor: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
}

interface MinimalDoctorRecord {
  _id: { toString(): string };
  name: string;
  specialization: string;
  hospital: string;
}

type SearchablePatientField = "name" | "phone" | "condition" | "gender";

interface PatientFilter {
  $or?: Partial<Record<SearchablePatientField, RegExp>>[];
  doctor?: Types.ObjectId;
  condition?: string;
  appointmentDate?: {
    $gte?: Date;
    $lt?: Date;
  };
}

export interface SafePatient {
  id: string;
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  condition: string;
  appointmentDate: Date;
  doctor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientDetails extends Omit<SafePatient, "doctor"> {
  doctor: {
    id: string;
    name: string;
    specialization: string;
    hospital: string;
  };
}

export interface PatientListResult {
  patients: SafePatient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const escapeRegularExpression = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

const startOfUtcDay = (date: string): Date =>
  new Date(`${date}T00:00:00.000Z`);

const startOfNextUtcDay = (date: string): Date => {
  const nextDay = startOfUtcDay(date);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return nextDay;
};

const toSafePatient = (patient: PatientRecord): SafePatient => ({
  id: patient._id.toString(),
  name: patient.name,
  age: patient.age,
  gender: patient.gender,
  phone: patient.phone,
  condition: patient.condition,
  appointmentDate: patient.appointmentDate,
  doctor: patient.doctor.toString(),
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
});

const requireDoctor = async (doctorId: string): Promise<void> => {
  const doctorExists = await DoctorModel.exists({ _id: doctorId });

  if (doctorExists === null) {
    throw new AppError(404, "Doctor not found");
  }
};

const buildPatientFilter = (
  query: PatientListQuery,
  requiredDoctorId?: string,
): PatientFilter => {
  const filter: PatientFilter = {};
  const doctorId = requiredDoctorId ?? query.doctorId;

  if (doctorId !== undefined) {
    filter.doctor = new Types.ObjectId(doctorId);
  }

  if (query.condition !== undefined) {
    filter.condition = query.condition;
  }

  if (query.search !== undefined) {
    const searchExpression = new RegExp(
      escapeRegularExpression(query.search),
      "iu",
    );
    filter.$or = [
      { name: searchExpression },
      { phone: searchExpression },
      { condition: searchExpression },
      { gender: searchExpression },
    ];
  }

  if (query.startDate !== undefined || query.endDate !== undefined) {
    filter.appointmentDate = {
      ...(query.startDate === undefined
        ? {}
        : { $gte: startOfUtcDay(query.startDate) }),
      ...(query.endDate === undefined
        ? {}
        : { $lt: startOfNextUtcDay(query.endDate) }),
    };
  }

  return filter;
};

const executePatientList = async (
  query: PatientListQuery,
  requiredDoctorId?: string,
): Promise<PatientListResult> => {
  const filter = buildPatientFilter(query, requiredDoctorId);
  const skip = (query.page - 1) * query.limit;

  const [patientRecords, total] = await Promise.all([
    PatientModel.find(filter)
      .select(PATIENT_PROJECTION)
      .collation(PATIENT_FILTER_COLLATION)
      .sort({ appointmentDate: -1, _id: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean<PatientRecord[]>()
      .exec(),
    PatientModel.countDocuments(filter)
      .collation(PATIENT_FILTER_COLLATION)
      .exec(),
  ]);

  return {
    patients: patientRecords.map(toSafePatient),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    },
  };
};

export const createPatient = async (
  doctorId: string,
  input: CreatePatientInput,
): Promise<SafePatient> => {
  await requireDoctor(doctorId);
  const patient = await PatientModel.create({
    ...input,
    doctor: new Types.ObjectId(doctorId),
  });
  return toSafePatient(patient);
};

export const listPatientsForDoctor = async (
  doctorId: string,
  query: DoctorPatientListQuery,
): Promise<PatientListResult> => {
  await requireDoctor(doctorId);
  return executePatientList(query, doctorId);
};

export const listPatients = async (
  query: PatientListQuery,
): Promise<PatientListResult> => executePatientList(query);

export const getPatientById = async (
  patientId: string,
): Promise<PatientDetails> => {
  const patient = await PatientModel.findById(patientId)
    .select(PATIENT_PROJECTION)
    .lean<PatientRecord>()
    .exec();

  if (patient === null) {
    throw new AppError(404, "Patient not found");
  }

  const doctor = await DoctorModel.findById(patient.doctor)
    .select({ _id: 1, name: 1, specialization: 1, hospital: 1 })
    .lean<MinimalDoctorRecord>()
    .exec();

  if (doctor === null) {
    throw new AppError(404, "Doctor not found");
  }

  const safePatient = toSafePatient(patient);
  return {
    ...safePatient,
    doctor: {
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
    },
  };
};

export const updatePatient = async (
  patientId: string,
  input: UpdatePatientInput,
): Promise<SafePatient> => {
  const patient = await PatientModel.findByIdAndUpdate(
    patientId,
    { $set: input },
    { returnDocument: "after", runValidators: true },
  )
    .select(PATIENT_PROJECTION)
    .lean<PatientRecord>()
    .exec();

  if (patient === null) {
    throw new AppError(404, "Patient not found");
  }

  return toSafePatient(patient);
};

export const deletePatient = async (
  patientId: string,
): Promise<SafePatient> => {
  const patient = await PatientModel.findByIdAndDelete(patientId)
    .select(PATIENT_PROJECTION)
    .lean<PatientRecord>()
    .exec();

  if (patient === null) {
    throw new AppError(404, "Patient not found");
  }

  return toSafePatient(patient);
};
