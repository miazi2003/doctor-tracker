import { model, Schema, type HydratedDocument } from "mongoose";

export interface Admin {
  name: string;
  email: string;
  password: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

export type AdminDocument = HydratedDocument<Admin>;

const adminSchema = new Schema<Admin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/u,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
      maxlength: 255,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_document, returnedObject) => {
        Reflect.deleteProperty(returnedObject, "password");
        Reflect.deleteProperty(returnedObject, "__v");
      },
    },
  },
);

adminSchema.index({ email: 1 }, { unique: true });

export const AdminModel = model<Admin>("Admin", adminSchema);
