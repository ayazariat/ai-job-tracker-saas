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

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
  },
  { id: false, timestamps: true, toJSON }
);

export const UserModel =
  mongoose.models.User ?? mongoose.model("User", userSchema);
