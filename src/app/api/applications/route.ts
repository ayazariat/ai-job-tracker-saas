import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ApplicationModel } from "@/models/Application";
import { ReminderModel } from "@/models/Reminder";
import { UserModel } from "@/models/User";

const DEMO_USER_ID = "demo-user";

const createSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  status: z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]).default("WISHLIST"),
  salaryRange: z.string().max(100).nullable().optional(),
  source: z.string().max(200).nullable().optional(),
  url: z.string().url().nullable().optional().or(z.literal("")),
  deadline: z.string().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  appliedAt: z.string().nullable().optional(),
});

export async function GET() {
  try {
    await connectDB();
    const applications = await ApplicationModel
      .find({ userId: DEMO_USER_ID })
      .populate("reminders")
      .sort({ order: 1 });
    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const data = createSchema.parse(body);

    // Ensure demo user exists
    await UserModel.findOneAndUpdate(
      { _id: DEMO_USER_ID },
      { $setOnInsert: { _id: DEMO_USER_ID, email: "demo@career-os.dev" } },
      { upsert: true }
    );

    const count = await ApplicationModel.countDocuments({
      userId: DEMO_USER_ID,
      status: data.status,
    });

    const application = await ApplicationModel.create({
      userId: DEMO_USER_ID,
      company: data.company,
      role: data.role,
      status: data.status,
      salaryRange: data.salaryRange || null,
      source: data.source || null,
      url: data.url || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      notes: data.notes || null,
      appliedAt: data.appliedAt ? new Date(data.appliedAt) : null,
      order: count,
    });

    // Auto-create follow-up reminder for APPLIED status
    if (data.status === "APPLIED") {
      await ReminderModel.create({
        applicationId: application._id,
        type: "FOLLOW_UP",
        sendAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        message: `Follow up with ${data.company} about ${data.role}`,
      });
    }

    const populated = await ApplicationModel.findById(application._id).populate("reminders");
    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/applications error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
