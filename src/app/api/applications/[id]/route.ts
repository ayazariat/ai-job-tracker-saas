import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ApplicationModel } from "@/models/Application";
import { ReminderModel } from "@/models/Reminder";
import { AiMatchModel } from "@/models/AiMatch";

const updateSchema = z.object({
  company: z.string().min(1).max(200).optional(),
  role: z.string().min(1).max(200).optional(),
  status: z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]).optional(),
  salaryRange: z.string().max(100).nullable().optional(),
  source: z.string().max(200).nullable().optional(),
  url: z.string().url().nullable().optional().or(z.literal("")),
  deadline: z.string().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  appliedAt: z.string().nullable().optional(),
  order: z.number().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const application = await ApplicationModel.findById(id)
      .populate("reminders")
      .populate("aiMatches");

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("GET /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.company !== undefined) updateData.company = data.company;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.salaryRange !== undefined) updateData.salaryRange = data.salaryRange;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.url !== undefined) updateData.url = data.url || null;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.appliedAt !== undefined) updateData.appliedAt = data.appliedAt ? new Date(data.appliedAt) : null;
    if (data.order !== undefined) updateData.order = data.order;

    // If moving to APPLIED status, auto-create follow-up reminder
    if (data.status === "APPLIED") {
      const existing = await ApplicationModel.findById(id);
      if (existing && existing.status !== "APPLIED") {
        await ReminderModel.create({
          applicationId: id,
          type: "FOLLOW_UP",
          sendAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          message: `Follow up with ${existing.company} about ${existing.role}`,
        });
      }
    }

    const application = await ApplicationModel.findByIdAndUpdate(id, updateData, { new: true }).populate("reminders");
    return NextResponse.json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("PATCH /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await ReminderModel.deleteMany({ applicationId: id });
    await AiMatchModel.deleteMany({ applicationId: id });
    await ApplicationModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
