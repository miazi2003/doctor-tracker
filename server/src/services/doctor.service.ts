import { AppError } from "../errors/app-error.js";
import {
  DOCTOR_FILTER_COLLATION,
  DoctorModel,
} from "../models/doctor.model.js";
import type {
  CreateDoctorInput,
  DoctorListQuery,
} from "../validation/doctor.validation.js";

const DOCTOR_PROJECTION = {
  _id: 1,
  name: 1,
  specialization: 1,
  hospital: 1,
  phone: 1,
  email: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

interface DoctorRecord {
  _id: { toString(): string };
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

type SearchableDoctorField =
  | "name"
  | "specialization"
  | "hospital"
  | "phone"
  | "email";

interface DoctorFilter {
  $or?: Partial<Record<SearchableDoctorField, RegExp>>[];
  specialization?: string;
  hospital?: string;
  createdAt?: {
    $gte?: Date;
    $lt?: Date;
  };
}

export interface SafeDoctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorListResult {
  doctors: SafeDoctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11_000;

const escapeRegularExpression = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

const toSafeDoctor = (doctor: DoctorRecord): SafeDoctor => ({
  id: doctor._id.toString(),
  name: doctor.name,
  specialization: doctor.specialization,
  hospital: doctor.hospital,
  phone: doctor.phone,
  email: doctor.email,
  createdAt: doctor.createdAt,
  updatedAt: doctor.updatedAt,
});

const startOfUtcDay = (date: string): Date =>
  new Date(`${date}T00:00:00.000Z`);

const startOfNextUtcDay = (date: string): Date => {
  const nextDay = startOfUtcDay(date);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return nextDay;
};

const buildDoctorFilter = (
  query: DoctorListQuery,
): DoctorFilter => {
  const filter: DoctorFilter = {};

  if (query.search !== undefined) {
    const searchExpression = new RegExp(
      escapeRegularExpression(query.search),
      "iu",
    );
    filter.$or = [
      { name: searchExpression },
      { specialization: searchExpression },
      { hospital: searchExpression },
      { phone: searchExpression },
      { email: searchExpression },
    ];
  }

  if (query.specialization !== undefined) {
    filter.specialization = query.specialization;
  }

  if (query.hospital !== undefined) {
    filter.hospital = query.hospital;
  }

  if (query.startDate !== undefined || query.endDate !== undefined) {
    filter.createdAt = {
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

export const createDoctor = async (
  input: CreateDoctorInput,
): Promise<SafeDoctor> => {
  try {
    const doctor = await DoctorModel.create(input);
    return toSafeDoctor(doctor);
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(409, "A doctor with this email already exists");
    }

    throw error;
  }
};

export const listDoctors = async (
  query: DoctorListQuery,
): Promise<DoctorListResult> => {
  const filter = buildDoctorFilter(query);
  const skip = (query.page - 1) * query.limit;

  const [doctorRecords, total] = await Promise.all([
    DoctorModel.find(filter)
      .select(DOCTOR_PROJECTION)
      .collation(DOCTOR_FILTER_COLLATION)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean<DoctorRecord[]>()
      .exec(),
    DoctorModel.countDocuments(filter)
      .collation(DOCTOR_FILTER_COLLATION)
      .exec(),
  ]);

  return {
    doctors: doctorRecords.map(toSafeDoctor),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    },
  };
};

export const getDoctorById = async (
  doctorId: string,
): Promise<SafeDoctor> => {
  const doctor = await DoctorModel.findById(doctorId)
    .select(DOCTOR_PROJECTION)
    .lean<DoctorRecord>()
    .exec();

  if (doctor === null) {
    throw new AppError(404, "Doctor not found");
  }

  return toSafeDoctor(doctor);
};
