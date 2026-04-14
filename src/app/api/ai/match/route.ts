import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeResumeMatch } from "@/lib/ai";
import { z } from "zod";

const DEMO_USER_ID = "demo-user";

const matchSchema = z.object({
  cvContent: z.string().min(50, "CV content must be at least 50 characters"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  applicationId: z.string().optional(),
  cvName: z.string().default("Default CV"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = matchSchema.parse(body);

    // Ensure demo user exists
    await db.user.upsert({
      where: { id: DEMO_USER_ID },
      create: { id: DEMO_USER_ID, email: "demo@career-os.dev" },
      update: {},
    });

    // Save or find CV version
    let cvVersion = await db.cvVersion.findFirst({
      where: { userId: DEMO_USER_ID, name: data.cvName },
    });

    if (!cvVersion) {
      cvVersion = await db.cvVersion.create({
        data: {
          userId: DEMO_USER_ID,
          name: data.cvName,
          content: data.cvContent,
        },
      });
    }

    // Run AI analysis
    const result = await analyzeResumeMatch(data.cvContent, data.jobDescription);

    // Save to database
    const aiMatch = await db.aiMatch.create({
      data: {
        applicationId: data.applicationId || null,
        cvVersionId: cvVersion.id,
        matchScore: result.matchScore,
        missingSkills: result.missingSkills,
        keywords: result.keywords,
        insights: result.insights,
        jobDescription: data.jobDescription,
      },
    });

    return NextResponse.json({
      ...aiMatch,
      matchScore: result.matchScore,
      missingSkills: result.missingSkills,
      keywords: result.keywords,
      insights: result.insights,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/ai/match error:", error);
    return NextResponse.json({ error: "Failed to analyze match" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const matches = await db.aiMatch.findMany({
      include: { cvVersion: true, application: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(matches);
  } catch (error) {
    console.error("GET /api/ai/match error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
