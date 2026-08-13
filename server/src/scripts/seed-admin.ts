import bcrypt from "bcrypt";
import { z } from "zod";

import {
  connectDatabase,
  disconnectDatabase,
} from "../config/database.js";
import { AdminModel } from "../models/admin.model.js";

const BCRYPT_COST_FACTOR = 12;

const seedAdminSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z
    .string()
    .min(12, "must contain at least 12 characters")
    .max(128),
});

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11_000;

const readSeedAdmin = () =>
  seedAdminSchema.safeParse({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });

const seedInitialAdmin = async (): Promise<void> => {
  const seedAdminResult = readSeedAdmin();

  if (!seedAdminResult.success) {
    const validationMessages = seedAdminResult.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    console.error(
      `Invalid initial-admin configuration: ${validationMessages.join("; ")}`,
    );
    process.exitCode = 1;
    return;
  }

  try {
    await connectDatabase();

    const existingAdmin = await AdminModel.exists({
      email: seedAdminResult.data.email,
    });

    if (existingAdmin !== null) {
      console.log("Initial admin already exists; no changes made");
      return;
    }

    const passwordHash = await bcrypt.hash(
      seedAdminResult.data.password,
      BCRYPT_COST_FACTOR,
    );

    try {
      await AdminModel.create({
        name: seedAdminResult.data.name,
        email: seedAdminResult.data.email,
        password: passwordHash,
        role: "admin",
      });
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        console.log("Initial admin already exists; no changes made");
        return;
      }

      throw error;
    }

    console.log("Initial admin created successfully");
  } catch {
    console.error("Initial admin seed failed");
    process.exitCode = 1;
  } finally {
    try {
      await disconnectDatabase();
    } catch {
      console.error("Failed to disconnect from MongoDB after admin seed");
      process.exitCode = 1;
    }
  }
};

void seedInitialAdmin();
