import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { analyzeResumeMatch } from "@/lib/ai";
import { UserModel } from "@/models/User";
import { CvVersionModel } from "@/models/CvVersion";
import { AiMatchModel } from "@/models/AiMatch";
import { ApplicationModel } from "@/models/Application";

const DEMO_USER_ID = "demo-user";

const matchSchema = z.object({
  cvContent: z.string().min(50, "CV content must be at least 50 characters"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  applicationId: z.string().optional(),
  cvName: z.string().default("Default CV"),
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const data = matchSchema.parse(body);

    // Ensure demo user exists
    await UserModel.findOneAndUpdate(
      { _id: DEMO_USER_ID },
      { $setOnInsert: { _id: DEMO_USER_ID, email: "demo@career-os.dev" } },
      { upsert: true }
    );

    // Save or find CV version
    let cvVersion = await CvVersionModel.findOne({ userId: DEMO_USER_ID, name: data.cvName });

    if (!cvVersion) {
      cvVersion = await CvVersionModel.create({
        userId: DEMO_USER_ID,
        name: data.cvName,
        content: data.cvContent,
      });
    }

    // Run AI analysis
    const result = await analyzeResumeMatch(data.cvContent, data.jobDescription);

    // Save to database
    const aiMatch = await AiMatchModel.create({
      applicationId: data.applicationId ?? null,
      cvVersionId: cvVersion._id,
      matchScore: result.matchScore,
      missingSkills: result.missingSkills,
      keywords: result.keywords,
      insights: result.insights,
      jobDescription: data.jobDescription,
    });

    return NextResponse.json({
      ...(aiMatch.toJSON() as Record<string, unknown>),
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
    await connectDB();
    void CvVersionModel;
    void ApplicationModel;
    const matches = await AiMatchModel
      .find()
      .populate("cvVersion")
      .populate("application")
      .sort({ createdAt: -1 })
      .limit(20);
    return NextResponse.json(matches);
  } catch (error) {
    console.error("GET /api/ai/match error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
