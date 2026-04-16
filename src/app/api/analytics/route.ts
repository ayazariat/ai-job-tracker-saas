import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ApplicationModel } from "@/models/Application";
import { AiMatchModel } from "@/models/AiMatch";
import { CvVersionModel } from "@/models/CvVersion";

const DEMO_USER_ID = "demo-user";

type StatusKey = "WISHLIST" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export async function GET() {
  try {
    await connectDB();
    // Ensure model registrations are in scope for populate
    void AiMatchModel;
    void CvVersionModel;

    const applications = await ApplicationModel
      .find({ userId: DEMO_USER_ID })
      .populate({ path: "aiMatches", populate: { path: "cvVersion" } })
      .sort({ createdAt: 1 })
      .lean({ virtuals: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apps = applications as any[];

    // Applications per week
    const weeklyData: Record<string, number> = {};
    apps.forEach((app) => {
      const date = new Date(app.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toISOString().split("T")[0];
      weeklyData[key] = (weeklyData[key] || 0) + 1;
    });

    const applicationsPerWeek = Object.entries(weeklyData)
      .map(([week, count]) => ({ week, count }))
      .slice(-12);

    // Status distribution
    const statusCounts: Record<StatusKey, number> = {
      WISHLIST: 0,
      APPLIED: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
    };
    apps.forEach((app) => {
      statusCounts[app.status as StatusKey]++;
    });

    const total = apps.length;
    const applied = apps.filter((a) => a.status !== "WISHLIST").length;
    const interviews = statusCounts.INTERVIEW;
    const offers = statusCounts.OFFER;
    const rejected = statusCounts.REJECTED;

    const responseRate = applied > 0 ? Math.round(((interviews + offers) / applied) * 100) : 0;
    const rejectionRate = applied > 0 ? Math.round((rejected / applied) * 100) : 0;
    const interviewConversion = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

    // Source breakdown
    const sourceCounts: Record<string, number> = {};
    apps.forEach((app) => {
      const source = (app.source as string) || "Unknown";
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const sourceBreakdown = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // CV version performance
    const cvPerformance: Record<string, { name: string; avgScore: number; count: number }> = {};
    apps.forEach((app) => {
      (app.aiMatches as any[] ?? []).forEach((match: any) => {
        const cvId = match.cvVersionId as string;
        if (!cvPerformance[cvId]) {
          cvPerformance[cvId] = {
            name: match.cvVersion?.name ?? cvId,
            avgScore: 0,
            count: 0,
          };
        }
        cvPerformance[cvId].avgScore += match.matchScore as number;
        cvPerformance[cvId].count++;
      });
    });

    Object.values(cvPerformance).forEach((cv) => {
      cv.avgScore = Math.round(cv.avgScore / cv.count);
    });

    // Company response speed
    const companyResponseSpeed = apps
      .filter((a) => a.appliedAt && a.status !== "WISHLIST" && a.status !== "APPLIED")
      .map((a) => ({
        company: a.company as string,
        role: a.role as string,
        daysToResponse: Math.floor(
          (new Date(a.updatedAt).getTime() - new Date(a.appliedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        status: a.status as string,
      }))
      .sort((a, b) => a.daysToResponse - b.daysToResponse)
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        total,
        applied,
        interviews,
        offers,
        rejected,
        responseRate,
        rejectionRate,
        interviewConversion,
      },
      applicationsPerWeek,
      statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })),
      sourceBreakdown,
      cvPerformance: Object.values(cvPerformance),
      companyResponseSpeed,
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
