import { Router } from "express";

import {
  createDoctor,
  getDoctor,
  getDoctors,
} from "../controllers/doctor.controller.js";
import {
  createPatientForDoctor,
  getPatientsForDoctor,
} from "../controllers/patient.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";

export const doctorRouter = Router();

doctorRouter.use(requireAuthentication);
doctorRouter.post("/", createDoctor);
doctorRouter.get("/", getDoctors);
doctorRouter.post("/:doctorId/patients", createPatientForDoctor);
doctorRouter.get("/:doctorId/patients", getPatientsForDoctor);
doctorRouter.get("/:doctorId", getDoctor);
