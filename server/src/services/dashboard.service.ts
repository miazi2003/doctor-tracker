import { DoctorModel } from "../models/doctor.model.js";
import {
  PATIENT_FILTER_COLLATION,
  PatientModel,
} from "../models/patient.model.js";
import type { DashboardStatsQuery } from "../validation/dashboard.validation.js";

const PATIENTS_PER_DOCTOR_LIMIT = 10;
const CONDITION_LIMIT = 9;
const UPCOMING_PATIENT_LIMIT = 5;

interface DateCountRecord {
  _id: string;
  count: number;
}

interface DoctorCountRecord {
  count: number;
  doctor: { _id: { toString(): string }; name: string } | null;
}

interface ConditionAggregationRecord {
  top: { condition: string; count: number }[];
  remaining: { count: number }[];
}

interface UpcomingPatientRecord {
  _id: { toString(): string };
  name: string;
  condition: string;
  appointmentDate: Date;
  doctor: { _id: { toString(): string }; name: string } | null;
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  patientsInSelectedPeriod: number;
  averagePatientsPerDoctor: number;
  patientsPerDoctor: {
    doctor: { id: string; name: string } | null;
    count: number;
  }[];
  patientsByDate: { date: string; count: number }[];
  patientsByCondition: { condition: string; count: number }[];
  upcomingPatients: {
    id: string;
    name: string;
    condition: string;
    appointmentDate: Date;
    doctor: { id: string; name: string } | null;
  }[];
}

const getUtcPeriod = (
  days: DashboardStatsQuery["days"],
  now: Date,
): { start: Date; endExclusive: Date } => {
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const start = new Date(todayStart);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const endExclusive = new Date(todayStart);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  return { start, endExclusive };
};

const fillUtcDates = (
  start: Date,
  days: DashboardStatsQuery["days"],
  records: DateCountRecord[],
): { date: string; count: number }[] => {
  const countByDate = new Map(records.map((record) => [record._id, record.count]));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + index);
    const dateString = date.toISOString().slice(0, 10);
    return { date: dateString, count: countByDate.get(dateString) ?? 0 };
  });
};

export const getDashboardStats = async (
  query: DashboardStatsQuery,
  now = new Date(),
): Promise<DashboardStats> => {
  const { start, endExclusive } = getUtcPeriod(query.days, now);

  const [
    totalDoctors,
    totalPatients,
    dateCounts,
    doctorCounts,
    conditionResults,
    upcomingRecords,
  ] = await Promise.all([
    DoctorModel.countDocuments({}).exec(),
    PatientModel.countDocuments({}).exec(),
    PatientModel.aggregate<DateCountRecord>([
      { $match: { appointmentDate: { $gte: start, $lt: endExclusive } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$appointmentDate",
              timezone: "UTC",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec(),
    PatientModel.aggregate<DoctorCountRecord>([
      { $group: { _id: "$doctor", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: PATIENTS_PER_DOCTOR_LIMIT },
      {
        $lookup: {
          from: DoctorModel.collection.name,
          localField: "_id",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 1, name: 1 } }],
          as: "doctor",
        },
      },
      {
        $unwind: {
          path: "$doctor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          doctor: { $ifNull: ["$doctor", null] },
        },
      },
    ]).exec(),
    PatientModel.aggregate<ConditionAggregationRecord>([
      {
        $group: {
          _id: { $toLower: "$condition" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      {
        $facet: {
          top: [
            { $limit: CONDITION_LIMIT },
            { $project: { _id: 0, condition: "$_id", count: 1 } },
          ],
          remaining: [
            { $skip: CONDITION_LIMIT },
            { $group: { _id: null, count: { $sum: "$count" } } },
            { $project: { _id: 0, count: 1 } },
          ],
        },
      },
    ])
      .collation(PATIENT_FILTER_COLLATION)
      .exec(),
    PatientModel.aggregate<UpcomingPatientRecord>([
      { $match: { appointmentDate: { $gte: now } } },
      { $sort: { appointmentDate: 1, _id: 1 } },
      { $limit: UPCOMING_PATIENT_LIMIT },
      {
        $lookup: {
          from: DoctorModel.collection.name,
          localField: "doctor",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 1, name: 1 } }],
          as: "doctor",
        },
      },
      {
        $unwind: {
          path: "$doctor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          condition: 1,
          appointmentDate: 1,
          doctor: { $ifNull: ["$doctor", null] },
        },
      },
    ]).exec(),
  ]);

  const patientsByDate = fillUtcDates(start, query.days, dateCounts);
  const patientsInSelectedPeriod = patientsByDate.reduce(
    (total, date) => total + date.count,
    0,
  );
  const conditionResult = conditionResults[0];
  const remainingConditionCount = conditionResult?.remaining[0]?.count ?? 0;

  return {
    totalDoctors,
    totalPatients,
    patientsInSelectedPeriod,
    averagePatientsPerDoctor:
      totalDoctors === 0 ? 0 : totalPatients / totalDoctors,
    patientsPerDoctor: doctorCounts.map((record) => ({
      doctor:
        record.doctor === null
          ? null
          : {
              id: record.doctor._id.toString(),
              name: record.doctor.name,
            },
      count: record.count,
    })),
    patientsByDate,
    patientsByCondition: [
      ...(conditionResult?.top ?? []),
      ...(remainingConditionCount === 0
        ? []
        : [{ condition: "Other", count: remainingConditionCount }]),
    ],
    upcomingPatients: upcomingRecords.map((record) => ({
      id: record._id.toString(),
      name: record.name,
      condition: record.condition,
      appointmentDate: record.appointmentDate,
      doctor:
        record.doctor === null
          ? null
          : {
              id: record.doctor._id.toString(),
              name: record.doctor.name,
            },
    })),
  };
};
