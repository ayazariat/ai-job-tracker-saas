import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ReminderModel } from "@/models/Reminder";
import { ApplicationModel } from "@/models/Application";
import { UserModel } from "@/models/User";
import { sendEmail, buildReminderEmail } from "@/lib/email";

// This endpoint processes pending reminders
// In production, this would be called by a cron job (e.g., Vercel Cron)
export async function POST() {
  try {
    await connectDB();
    void ApplicationModel;
    void UserModel;

    const pendingReminders = await ReminderModel
      .find({ sent: false, sendAt: { $lte: new Date() } })
      .populate({ path: "application", populate: { path: "user" } })
      .limit(50);

    const results = [];

    for (const reminder of pendingReminders) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const app = reminder.application as any;
        const { subject, html } = buildReminderEmail(
          app.company,
          app.role,
          reminder.type as "FOLLOW_UP" | "INTERVIEW" | "DEADLINE"
        );

        await sendEmail({
          to: app.user.email,
          subject,
          html,
        });

        await ReminderModel.findByIdAndUpdate(reminder._id, { sent: true, sentAt: new Date() });
        results.push({ id: reminder.id, status: "sent" });
      } catch (err) {
        console.error(`Failed to send reminder ${reminder.id}:`, err);
        results.push({ id: reminder.id, status: "failed" });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("POST /api/reminders/process error:", error);
    return NextResponse.json({ error: "Failed to process reminders" }, { status: 500 });
  }
}
