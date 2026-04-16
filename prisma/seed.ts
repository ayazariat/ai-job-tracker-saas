import "dotenv/config";
import mongoose from "mongoose";
import { UserModel } from "../src/models/User.js";
import { ApplicationModel } from "../src/models/Application.js";
import { ReminderModel } from "../src/models/Reminder.js";
import { CvVersionModel } from "../src/models/CvVersion.js";

const MONGODB_URI = process.env.DATABASE_URL!;

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Create demo user
  await UserModel.findOneAndUpdate(
    { _id: "demo-user" },
    { $setOnInsert: { _id: "demo-user", email: "demo@career-os.dev", name: "Demo User" } },
    { upsert: true }
  );
  console.log("Created user: demo@career-os.dev");

  // Sample applications
  const apps = [
    { company: "Google", role: "Senior Software Engineer", status: "INTERVIEW" as const, source: "LinkedIn", salaryRange: "$180k-$250k", notes: "Phone screen completed. On-site scheduled.", appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    { company: "Stripe", role: "Full Stack Engineer", status: "APPLIED" as const, source: "Referral", salaryRange: "$160k-$200k", notes: "Referred by John from engineering team.", appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { company: "Vercel", role: "Frontend Engineer", status: "WISHLIST" as const, source: "Company Website", salaryRange: "$140k-$180k", notes: "Great culture. Need to tailor CV." },
    { company: "Netflix", role: "Senior Frontend Engineer", status: "OFFER" as const, source: "LinkedIn", salaryRange: "$200k-$350k", notes: "Offer received! Negotiating terms.", appliedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { company: "Amazon", role: "SDE II", status: "REJECTED" as const, source: "Direct", salaryRange: "$150k-$200k", notes: "Didn't make it past loop interviews.", appliedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
    { company: "Shopify", role: "Staff Engineer", status: "APPLIED" as const, source: "AngelList", salaryRange: "$170k-$220k", appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { company: "Figma", role: "Product Engineer", status: "INTERVIEW" as const, source: "Referral", salaryRange: "$160k-$210k", notes: "Technical round next week.", appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { company: "Linear", role: "Software Engineer", status: "WISHLIST" as const, source: "Twitter", salaryRange: "$130k-$170k", notes: "Love the product. Applied via website." },
  ];

  for (let i = 0; i < apps.length; i++) {
    const app = await ApplicationModel.findOneAndUpdate(
      { _id: `seed-app-${i}` },
      {
        $setOnInsert: {
          _id: `seed-app-${i}`,
          userId: "demo-user",
          company: apps[i].company,
          role: apps[i].role,
          status: apps[i].status,
          source: apps[i].source,
          salaryRange: apps[i].salaryRange,
          notes: (apps[i] as { notes?: string }).notes ?? null,
          appliedAt: (apps[i] as { appliedAt?: Date }).appliedAt ?? null,
          order: i,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`Created application: ${apps[i].company} - ${apps[i].role} (${apps[i].status})`);

    if (apps[i].status === "APPLIED" && (apps[i] as { appliedAt?: Date }).appliedAt) {
      await ReminderModel.findOneAndUpdate(
        { _id: `seed-reminder-${i}` },
        {
          $setOnInsert: {
            _id: `seed-reminder-${i}`,
            applicationId: app!._id,
            type: "FOLLOW_UP",
            sendAt: new Date((apps[i] as { appliedAt: Date }).appliedAt.getTime() + 5 * 24 * 60 * 60 * 1000),
            message: `Follow up with ${apps[i].company} about ${apps[i].role}`,
          },
        },
        { upsert: true }
      );
    }
  }

  await CvVersionModel.findOneAndUpdate(
    { _id: "seed-cv-1" },
    {
      $setOnInsert: {
        _id: "seed-cv-1",
        userId: "demo-user",
        name: "General Tech CV v1",
        content: "John Doe - Software Engineer with 5 years of experience in React, Node.js, TypeScript, MongoDB...",
      },
    },
    { upsert: true }
  );

  console.log("\nSeed completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => mongoose.disconnect());
