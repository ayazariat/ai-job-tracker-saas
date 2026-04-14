"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  summary: {
    total: number;
    applied: number;
    interviews: number;
    offers: number;
    rejected: number;
    responseRate: number;
    rejectionRate: number;
    interviewConversion: number;
  };
  applicationsPerWeek: { week: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  cvPerformance: { name: string; avgScore: number; count: number }[];
  companyResponseSpeed: {
    company: string;
    role: string;
    daysToResponse: number;
    status: string;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  WISHLIST: "bg-blue-500",
  APPLIED: "bg-amber-500",
  INTERVIEW: "bg-purple-500",
  OFFER: "bg-emerald-500",
  REJECTED: "bg-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!data) return <p className="text-zinc-500">Failed to load analytics.</p>;

  const maxWeeklyCount = Math.max(...data.applicationsPerWeek.map((w) => w.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Analytics</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Data-driven insights into your job search performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{data.summary.total}</div>
            <p className="text-sm text-zinc-500">Total Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-emerald-600">{data.summary.responseRate}%</div>
            <p className="text-sm text-zinc-500">Response Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{data.summary.rejectionRate}%</div>
            <p className="text-sm text-zinc-500">Rejection Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600">{data.summary.interviewConversion}%</div>
            <p className="text-sm text-zinc-500">Interview → Offer</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Applications Per Week - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applications Per Week</CardTitle>
          </CardHeader>
          <CardContent>
            {data.applicationsPerWeek.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-2">
                {data.applicationsPerWeek.map((week) => (
                  <div key={week.week} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 w-20 shrink-0">
                      {new Date(week.week).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <div className="flex-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded transition-all"
                        style={{ width: `${(week.count / maxWeeklyCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{week.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {data.summary.total === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-3">
                {/* Stacked bar */}
                <div className="flex h-8 rounded-lg overflow-hidden">
                  {data.statusDistribution
                    .filter((s) => s.count > 0)
                    .map((s) => (
                      <div
                        key={s.status}
                        className={`${STATUS_COLORS[s.status]} transition-all`}
                        style={{ width: `${(s.count / data.summary.total) * 100}%` }}
                        title={`${STATUS_LABELS[s.status]}: ${s.count}`}
                      />
                    ))}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3">
                  {data.statusDistribution.map((s) => (
                    <div key={s.status} className="flex items-center gap-1.5">
                      <div className={`h-3 w-3 rounded-full ${STATUS_COLORS[s.status]}`} />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {STATUS_LABELS[s.status]} ({s.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {data.sourceBreakdown.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-2">
                {data.sourceBreakdown.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{source.source}</span>
                    <Badge variant="secondary">{source.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Response Speed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fastest Responders</CardTitle>
          </CardHeader>
          <CardContent>
            {data.companyResponseSpeed.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">
                Companies that respond will appear here as you progress
              </p>
            ) : (
              <div className="space-y-3">
                {data.companyResponseSpeed.map((company, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{company.company}</p>
                      <p className="text-xs text-zinc-500">{company.role}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={company.daysToResponse <= 7 ? "success" : "secondary"}>
                        {company.daysToResponse} days
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CV Performance */}
        {data.cvPerformance.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">CV Version Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {data.cvPerformance.map((cv) => (
                  <div
                    key={cv.name}
                    className="flex flex-col items-center rounded-lg border border-zinc-200 dark:border-zinc-700 p-4"
                  >
                    <div className="text-3xl font-bold text-indigo-600">{cv.avgScore}%</div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">{cv.name}</p>
                    <p className="text-xs text-zinc-500">{cv.count} analyses</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
