import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, buildReminderEmail } from "@/lib/email";

// This endpoint processes pending reminders
// In production, this would be called by a cron job (e.g., Vercel Cron)
export async function POST() {
  try {
    const pendingReminders = await db.reminder.findMany({
      where: {
        sent: false,
        sendAt: { lte: new Date() },
      },
      include: {
        application: {
          include: { user: true },
        },
      },
      take: 50,
    });

    const results = [];

    for (const reminder of pendingReminders) {
      try {
        const { subject, html } = buildReminderEmail(
          reminder.application.company,
          reminder.application.role,
          reminder.type
        );

        await sendEmail({
          to: reminder.application.user.email,
          subject,
          html,
        });

        await db.reminder.update({
          where: { id: reminder.id },
          data: { sent: true, sentAt: new Date() },
        });

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
