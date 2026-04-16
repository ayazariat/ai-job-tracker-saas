import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

const toJSON = {
  virtuals: false,
  transform: (_: unknown, ret: Record<string, unknown>) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const cvVersionSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
  },
  { id: false, timestamps: { createdAt: true, updatedAt: false }, toJSON }
);

export const CvVersionModel =
  mongoose.models.CvVersion ?? mongoose.model("CvVersion", cvVersionSchema);
