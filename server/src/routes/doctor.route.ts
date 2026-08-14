import { Router } from "express";

import {
  createDoctor,
  getDoctor,
  getDoctors,
} from "../controllers/doctor.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";

export const doctorRouter = Router();

doctorRouter.use(requireAuthentication);
doctorRouter.post("/", createDoctor);
doctorRouter.get("/", getDoctors);
doctorRouter.get("/:doctorId", getDoctor);
