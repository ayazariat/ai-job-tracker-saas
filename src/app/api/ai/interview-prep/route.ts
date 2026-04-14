import { NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/ai";
import { z } from "zod";

const schema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  jobDescription: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const questions = await generateInterviewQuestions(
      data.company,
      data.role,
      data.jobDescription
    );

    return NextResponse.json(questions);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/ai/interview-prep error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
