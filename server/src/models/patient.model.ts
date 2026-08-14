import {
  model,
  Schema,
  Types,
  type HydratedDocument,
} from "mongoose";

export const PATIENT_GENDERS = ["male", "female", "other"] as const;

export type PatientGender = (typeof PATIENT_GENDERS)[number];

export interface Patient {
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  condition: string;
  appointmentDate: Date;
  doctor: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type PatientDocument = HydratedDocument<Patient>;

export const PATIENT_FILTER_COLLATION = {
  locale: "en",
  strength: 2,
} as const;

const patientSchema = new Schema<Patient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 130,
      validate: Number.isInteger,
    },
    gender: {
      type: String,
      required: true,
      enum: PATIENT_GENDERS,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      maxlength: 25,
      match: /^\+?[\d\s().-]+$/u,
    },
    condition: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      immutable: true,
      index: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

patientSchema.index(
  { appointmentDate: -1, _id: -1 },
  { name: "patient_appointment_newest", collation: PATIENT_FILTER_COLLATION },
);
patientSchema.index(
  { doctor: 1, appointmentDate: -1, _id: -1 },
  {
    name: "patient_doctor_appointment_newest",
    collation: PATIENT_FILTER_COLLATION,
  },
);
patientSchema.index(
  { condition: 1, appointmentDate: -1, _id: -1 },
  {
    name: "patient_condition_appointment_newest",
    collation: PATIENT_FILTER_COLLATION,
  },
);
patientSchema.index(
  { doctor: 1, condition: 1, appointmentDate: -1, _id: -1 },
  {
    name: "patient_doctor_condition_appointment_newest",
    collation: PATIENT_FILTER_COLLATION,
  },
);

export const PatientModel = model<Patient>("Patient", patientSchema);
