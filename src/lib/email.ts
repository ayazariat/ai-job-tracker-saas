import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: "CareerOS <notifications@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Email send error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

export function buildReminderEmail(
  company: string,
  role: string,
  type: "FOLLOW_UP" | "INTERVIEW" | "DEADLINE"
): { subject: string; html: string } {
  const templates = {
    FOLLOW_UP: {
      subject: `Follow up with ${company} for ${role}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Time to Follow Up! 📬</h2>
          <p>It's been a few days since you applied for <strong>${role}</strong> at <strong>${company}</strong>.</p>
          <p>Consider sending a follow-up email to show your continued interest.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Open CareerOS</a>
        </div>
      `,
    },
    INTERVIEW: {
      subject: `Interview reminder: ${role} at ${company}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Interview Coming Up! 🎯</h2>
          <p>You have an upcoming interview for <strong>${role}</strong> at <strong>${company}</strong>.</p>
          <p>Make sure you're prepared — review your notes and practice common questions.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/interviews" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Prepare Now</a>
        </div>
      `,
    },
    DEADLINE: {
      subject: `Deadline alert: ${role} at ${company}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Deadline Approaching! ⏰</h2>
          <p>The deadline for <strong>${role}</strong> at <strong>${company}</strong> is coming up soon.</p>
          <p>Make sure your application is submitted before time runs out.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Review Application</a>
        </div>
      `,
    },
  };

  return templates[type];
}
