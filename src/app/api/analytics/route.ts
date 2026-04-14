import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEMO_USER_ID = "demo-user";

export async function GET() {
  try {
    const applications = await db.application.findMany({
      where: { userId: DEMO_USER_ID },
      include: { aiMatches: { include: { cvVersion: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Applications per week
    const weeklyData: Record<string, number> = {};
    applications.forEach((app) => {
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
    const statusCounts = {
      WISHLIST: 0,
      APPLIED: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
    };
    applications.forEach((app) => {
      statusCounts[app.status]++;
    });

    const total = applications.length;
    const applied = applications.filter((a) => a.status !== "WISHLIST").length;
    const interviews = statusCounts.INTERVIEW;
    const offers = statusCounts.OFFER;
    const rejected = statusCounts.REJECTED;

    const responseRate = applied > 0 ? Math.round(((interviews + offers) / applied) * 100) : 0;
    const rejectionRate = applied > 0 ? Math.round((rejected / applied) * 100) : 0;
    const interviewConversion = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

    // Source breakdown
    const sourceCounts: Record<string, number> = {};
    applications.forEach((app) => {
      const source = app.source || "Unknown";
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const sourceBreakdown = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // CV version performance
    const cvPerformance: Record<string, { name: string; avgScore: number; count: number }> = {};
    applications.forEach((app) => {
      app.aiMatches.forEach((match) => {
        const cvId = match.cvVersionId;
        if (!cvPerformance[cvId]) {
          cvPerformance[cvId] = {
            name: match.cvVersion.name,
            avgScore: 0,
            count: 0,
          };
        }
        cvPerformance[cvId].avgScore += match.matchScore;
        cvPerformance[cvId].count++;
      });
    });

    Object.values(cvPerformance).forEach((cv) => {
      cv.avgScore = Math.round(cv.avgScore / cv.count);
    });

    // Company response speed
    const companyResponseSpeed = applications
      .filter((a) => a.appliedAt && a.status !== "WISHLIST" && a.status !== "APPLIED")
      .map((a) => ({
        company: a.company,
        role: a.role,
        daysToResponse: Math.floor(
          (new Date(a.updatedAt).getTime() - new Date(a.appliedAt!).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        status: a.status,
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
