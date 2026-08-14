import { Router } from "express";

import {
  deletePatient,
  getPatient,
  getPatients,
  updatePatient,
} from "../controllers/patient.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";

export const patientRouter = Router();

patientRouter.use(requireAuthentication);
patientRouter.get("/", getPatients);
patientRouter.get("/:patientId", getPatient);
patientRouter.patch("/:patientId", updatePatient);
patientRouter.delete("/:patientId", deletePatient);
