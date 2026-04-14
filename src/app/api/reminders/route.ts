import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  applicationId: z.string(),
  type: z.enum(["FOLLOW_UP", "INTERVIEW", "DEADLINE"]),
  sendAt: z.string(),
  message: z.string().optional(),
});

export async function GET() {
  try {
    const reminders = await db.reminder.findMany({
      include: { application: true },
      orderBy: { sendAt: "asc" },
    });
    return NextResponse.json(reminders);
  } catch (error) {
    console.error("GET /api/reminders error:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const reminder = await db.reminder.create({
      data: {
        applicationId: data.applicationId,
        type: data.type,
        sendAt: new Date(data.sendAt),
        message: data.message,
      },
      include: { application: true },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/reminders error:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
