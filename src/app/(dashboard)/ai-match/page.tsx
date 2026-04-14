"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MatchResult {
  matchScore: number;
  missingSkills: string[];
  keywords: string[];
  insights: string;
}

export default function AiMatchPage() {
  const [cvContent, setCvContent] = useState("");
  const [cvName, setCvName] = useState("Default CV");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvContent, jobDescription, cvName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800";
    if (score >= 60) return "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800";
    return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">AI Resume Match</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Upload your CV and a job description to get AI-powered matching insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your CV</CardTitle>
            <CardDescription>Paste your resume/CV content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={cvName}
              onChange={(e) => setCvName(e.target.value)}
              placeholder="CV Version Name"
            />
            <Textarea
              value={cvContent}
              onChange={(e) => setCvContent(e.target.value)}
              placeholder="Paste your CV content here..."
              rows={12}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Description</CardTitle>
            <CardDescription>Paste the job posting</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={15}
            />
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <Button
        onClick={handleAnalyze}
        disabled={loading || cvContent.length < 50 || jobDescription.length < 50}
        size="lg"
        className="w-full md:w-auto"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Analyzing...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            Analyze Match
          </>
        )}
      </Button>

      {result && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Score Card */}
          <Card className={`border-2 ${getScoreBg(result.matchScore)}`}>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className={`text-6xl font-bold ${getScoreColor(result.matchScore)}`}>
                {result.matchScore}%
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Match Score</p>
            </CardContent>
          </Card>

          {/* Missing Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Missing Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill) => (
                  <Badge key={skill} variant="destructive">{skill}</Badge>
                ))}
                {result.missingSkills.length === 0 && (
                  <p className="text-sm text-zinc-500">No major skills gaps found!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword) => (
                  <Badge key={keyword} variant="success">{keyword}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {result.insights}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
