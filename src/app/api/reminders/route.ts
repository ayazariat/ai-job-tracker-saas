import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ReminderModel } from "@/models/Reminder";
import { ApplicationModel } from "@/models/Application";

const createSchema = z.object({
  applicationId: z.string(),
  type: z.enum(["FOLLOW_UP", "INTERVIEW", "DEADLINE"]),
  sendAt: z.string(),
  message: z.string().optional(),
});

export async function GET() {
  try {
    await connectDB();
    void ApplicationModel; // ensure registered for populate
    const reminders = await ReminderModel
      .find()
      .populate("application")
      .sort({ sendAt: 1 });
    return NextResponse.json(reminders);
  } catch (error) {
    console.error("GET /api/reminders error:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const data = createSchema.parse(body);

    void ApplicationModel; // ensure registered for populate
    const reminder = await ReminderModel.create({
      applicationId: data.applicationId,
      type: data.type,
      sendAt: new Date(data.sendAt),
      message: data.message,
    });

    const populated = await ReminderModel.findById(reminder._id).populate("application");
    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/reminders error:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
