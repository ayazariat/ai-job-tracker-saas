import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

const toJSON = {
  virtuals: true,
  transform: (_: unknown, ret: Record<string, unknown>) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const aiMatchSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    applicationId: { type: String, default: null },
    cvVersionId: { type: String, required: true },
    matchScore: { type: Number, required: true },
    missingSkills: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    insights: { type: String },
    jobDescription: { type: String, required: true },
  },
  { id: false, timestamps: { createdAt: true, updatedAt: false }, toJSON }
);

aiMatchSchema.virtual("cvVersion", {
  ref: "CvVersion",
  localField: "cvVersionId",
  foreignField: "_id",
  justOne: true,
});

aiMatchSchema.virtual("application", {
  ref: "Application",
  localField: "applicationId",
  foreignField: "_id",
  justOne: true,
});

export const AiMatchModel =
  mongoose.models.AiMatch ?? mongoose.model("AiMatch", aiMatchSchema);
