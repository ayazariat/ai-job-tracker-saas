import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE_URL!;

const cached: { promise: Promise<void> | null } = { promise: null };

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then(() => {})
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }
  await cached.promise;
}
