import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

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
    const applications = await db.application.findMany({
      where: { userId: DEMO_USER_ID },
      include: { reminders: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    // Ensure demo user exists
    await db.user.upsert({
      where: { id: DEMO_USER_ID },
      create: { id: DEMO_USER_ID, email: "demo@career-os.dev" },
      update: {},
    });

    const count = await db.application.count({
      where: { userId: DEMO_USER_ID, status: data.status },
    });

    const application = await db.application.create({
      data: {
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
      },
      include: { reminders: true },
    });

    // Auto-create follow-up reminder for APPLIED status
    if (data.status === "APPLIED") {
      await db.reminder.create({
        data: {
          applicationId: application.id,
          type: "FOLLOW_UP",
          sendAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
          message: `Follow up with ${data.company} about ${data.role}`,
        },
      });
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/applications error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
