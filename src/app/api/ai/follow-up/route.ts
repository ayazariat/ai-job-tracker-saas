import { NextResponse } from "next/server";
import { generateFollowUpEmail } from "@/lib/ai";
import { z } from "zod";

const schema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  daysSinceApplication: z.number().min(0),
  stage: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const email = await generateFollowUpEmail(
      data.company,
      data.role,
      data.daysSinceApplication,
      data.stage
    );

    return NextResponse.json({ email });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/ai/follow-up error:", error);
    return NextResponse.json({ error: "Failed to generate email" }, { status: 500 });
  }
}
