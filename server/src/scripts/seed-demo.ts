import { createHash } from "node:crypto";
import { Types } from "mongoose";

import {
  connectDatabase,
  disconnectDatabase,
} from "../config/database.js";
import { DoctorModel } from "../models/doctor.model.js";
import { PatientModel, type PatientGender } from "../models/patient.model.js";
import {
  createDoctorSchema,
  type CreateDoctorInput,
} from "../validation/doctor.validation.js";
import {
  createPatientSchema,
  type CreatePatientInput,
} from "../validation/patient.validation.js";

const DEMO_DOCTOR_COUNT = 12;
const DEMO_PATIENT_COUNT = 100;

const doctorFixtures = [
  ["Demo Doctor Aster", "Cardiology", "Padma Demo Hospital"],
  ["Demo Doctor Birch", "Neurology", "Meghna Demo Clinic"],
  ["Demo Doctor Cedar", "Pediatrics", "Jamuna Demo Medical Centre"],
  ["Demo Doctor Dahlia", "Dermatology", "Shapla Demo Hospital"],
  ["Demo Doctor Elm", "Orthopedics", "Padma Demo Hospital"],
  ["Demo Doctor Fern", "General Medicine", "Meghna Demo Clinic"],
  ["Demo Doctor Grove", "Ophthalmology", "Jamuna Demo Medical Centre"],
  ["Demo Doctor Hazel", "Gynecology", "Shapla Demo Hospital"],
  ["Demo Doctor Iris", "Cardiology", "Meghna Demo Clinic"],
  ["Demo Doctor Juniper", "ENT", "Padma Demo Hospital"],
  ["Demo Doctor Kestrel", "Psychiatry", "Shapla Demo Hospital"],
  ["Demo Doctor Lotus", "General Medicine", "Jamuna Demo Medical Centre"],
] as const;

const conditions = [
  "Seasonal Flu",
  "Routine Checkup",
  "Migraine",
  "Back Pain",
  "Skin Allergy",
  "Asthma Review",
  "Eye Checkup",
  "Hypertension Review",
  "Ear Infection",
  "Joint Pain",
  "Anxiety Review",
  "Stomach Pain",
] as const;

const genders: readonly PatientGender[] = ["female", "male", "other"];

interface DemoDoctorRecord {
  _id: Types.ObjectId;
  email: string;
}

interface DemoPatientFixture extends CreatePatientInput {
  id: Types.ObjectId;
  doctor: Types.ObjectId;
}

const createDoctorFixtures = (): CreateDoctorInput[] =>
  doctorFixtures.map(([name, specialization, hospital], index) =>
    createDoctorSchema.parse({
      name,
      specialization,
      hospital,
      phone: `+8801800${String(index + 1).padStart(6, "0")}`,
      email: `demo-doctor-${String(index + 1).padStart(2, "0")}@example.test`,
    }),
  );

const getUtcAppointment = (index: number, now: Date): Date => {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  let dayOffset: number;

  if (index < 35) {
    dayOffset = -(31 + ((index * 7) % 60));
  } else if (index < 75) {
    dayOffset = -((index * 11) % 30);
  } else {
    dayOffset = 1 + ((index * 7) % 30);
  }

  today.setUTCDate(today.getUTCDate() + dayOffset);
  today.setUTCHours(8 + (index % 10), (index % 4) * 15, 0, 0);
  return today;
};

const getDeterministicPatientId = (phone: string): Types.ObjectId => {
  const hex = createHash("sha256")
    .update(`doctor-tracker-demo-patient:${phone}`)
    .digest("hex")
    .slice(0, 24);
  return new Types.ObjectId(hex);
};

const createPatientFixtures = (
  doctorsByEmail: ReadonlyMap<string, Types.ObjectId>,
  now: Date,
): DemoPatientFixture[] =>
  Array.from({ length: DEMO_PATIENT_COUNT }, (_, index) => {
    const doctorNumber = (index % DEMO_DOCTOR_COUNT) + 1;
    const doctorEmail = `demo-doctor-${String(doctorNumber).padStart(2, "0")}@example.test`;
    const doctor = doctorsByEmail.get(doctorEmail);
    if (doctor === undefined) {
      throw new Error("A seeded Doctor reference could not be resolved");
    }

    const phone = `+8801900${String(index + 1).padStart(6, "0")}`;
    const input = createPatientSchema.parse({
      name: `Demo Patient ${String(index + 1).padStart(3, "0")}`,
      age: 5 + ((index * 13) % 81),
      gender: genders[index % genders.length],
      phone,
      condition: conditions[(index * 5) % conditions.length],
      appointmentDate: getUtcAppointment(index, now).toISOString(),
    });

    return {
      ...input,
      id: getDeterministicPatientId(phone),
      doctor,
    };
  });

const reportCounts = (
  doctorsInserted: number,
  patientsInserted: number,
): void => {
  console.log(
    `Demo seed counts: doctors inserted=${String(doctorsInserted)} skipped=${String(DEMO_DOCTOR_COUNT - doctorsInserted)}; patients inserted=${String(patientsInserted)} skipped=${String(DEMO_PATIENT_COUNT - patientsInserted)}`,
  );
};

const seedDemoData = async (): Promise<void> => {
  if (process.env.DEMO_SEED_ENABLED !== "true") {
    reportCounts(0, 0);
    return;
  }

  try {
    await connectDatabase({ silent: true });

    const doctors = createDoctorFixtures();
    const doctorResult = await DoctorModel.bulkWrite(
      doctors.map((doctor) => ({
        updateOne: {
          filter: { email: doctor.email },
          update: { $setOnInsert: doctor },
          upsert: true,
        },
      })),
      { ordered: true },
    );

    const doctorRecords = await DoctorModel.find({
      email: { $in: doctors.map((doctor) => doctor.email) },
    })
      .select({ _id: 1, email: 1 })
      .lean<DemoDoctorRecord[]>()
      .exec();
    const doctorsByEmail = new Map(
      doctorRecords.map((doctor) => [doctor.email, doctor._id]),
    );
    if (doctorsByEmail.size !== DEMO_DOCTOR_COUNT) {
      throw new Error("Not all seeded Doctors could be resolved");
    }

    const patients = createPatientFixtures(doctorsByEmail, new Date());
    const patientResult = await PatientModel.bulkWrite(
      patients.map(({ id, doctor, ...patient }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $setOnInsert: { ...patient, doctor } },
          upsert: true,
        },
      })),
      { ordered: true },
    );

    reportCounts(doctorResult.upsertedCount, patientResult.upsertedCount);
  } catch {
    console.error("Demo seed failed");
    process.exitCode = 1;
  } finally {
    try {
      await disconnectDatabase();
    } catch {
      console.error("Demo seed failed while closing the database connection");
      process.exitCode = 1;
    }
  }
};

void seedDemoData();
