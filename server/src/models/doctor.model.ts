import { model, Schema, type HydratedDocument } from "mongoose";

export interface Doctor {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DoctorDocument = HydratedDocument<Doctor>;

export const DOCTOR_FILTER_COLLATION = {
  locale: "en",
  strength: 2,
} as const;

const doctorSchema = new Schema<Doctor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    hospital: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      maxlength: 25,
      match: /^\+?[\d\s().-]+$/u,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/u,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

doctorSchema.index({ email: 1 }, { name: "doctor_email_unique", unique: true });
doctorSchema.index(
  { createdAt: -1, _id: -1 },
  { name: "doctor_newest", collation: DOCTOR_FILTER_COLLATION },
);
doctorSchema.index(
  { specialization: 1, createdAt: -1, _id: -1 },
  { name: "doctor_specialization_newest", collation: DOCTOR_FILTER_COLLATION },
);
doctorSchema.index(
  { hospital: 1, createdAt: -1, _id: -1 },
  { name: "doctor_hospital_newest", collation: DOCTOR_FILTER_COLLATION },
);
doctorSchema.index(
  { specialization: 1, hospital: 1, createdAt: -1, _id: -1 },
  {
    name: "doctor_specialization_hospital_newest",
    collation: DOCTOR_FILTER_COLLATION,
  },
);

export const DoctorModel = model<Doctor>("Doctor", doctorSchema);
