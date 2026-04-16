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

const reminderSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    applicationId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["FOLLOW_UP", "INTERVIEW", "DEADLINE"],
      required: true,
    },
    sendAt: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
    message: { type: String },
  },
  { id: false, timestamps: { createdAt: true, updatedAt: false }, toJSON }
);

reminderSchema.virtual("application", {
  ref: "Application",
  localField: "applicationId",
  foreignField: "_id",
  justOne: true,
});

export const ReminderModel =
  mongoose.models.Reminder ?? mongoose.model("Reminder", reminderSchema);
