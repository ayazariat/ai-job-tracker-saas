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

const applicationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"],
      default: "WISHLIST",
    },
    appliedAt: { type: Date },
    deadline: { type: Date },
    notes: { type: String },
    salaryRange: { type: String },
    source: { type: String },
    url: { type: String },
    order: { type: Number, default: 0 },
  },
  { id: false, timestamps: true, toJSON }
);

applicationSchema.virtual("reminders", {
  ref: "Reminder",
  localField: "_id",
  foreignField: "applicationId",
});

applicationSchema.virtual("aiMatches", {
  ref: "AiMatch",
  localField: "_id",
  foreignField: "applicationId",
});

applicationSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

export const ApplicationModel =
  mongoose.models.Application ??
  mongoose.model("Application", applicationSchema);
