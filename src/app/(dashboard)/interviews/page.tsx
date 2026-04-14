"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InterviewQuestions {
  technical: string[];
  behavioral: string[];
  companySpecific: string[];
}

export default function InterviewsPage() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null);
  const [loading, setLoading] = useState(false);

  // Follow-up email state
  const [followUpCompany, setFollowUpCompany] = useState("");
  const [followUpRole, setFollowUpRole] = useState("");
  const [followUpDays, setFollowUpDays] = useState("5");
  const [followUpStage, setFollowUpStage] = useState("Applied");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const handleGenerateQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, jobDescription: jobDescription || undefined }),
      });
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error("Failed to generate questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFollowUp = async () => {
    setEmailLoading(true);
    try {
      const res = await fetch("/api/ai/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: followUpCompany,
          role: followUpRole,
          daysSinceApplication: parseInt(followUpDays),
          stage: followUpStage,
        }),
      });
      const data = await res.json();
      setGeneratedEmail(data.email);
    } catch (err) {
      console.error("Failed to generate email:", err);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Interview Prep & Follow-ups</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          AI-powered preparation tools to ace your interviews
        </p>
      </div>

      {/* Interview Prep Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interview Question Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Company</label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Job Description (optional)</label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description for more targeted questions..."
              rows={4}
            />
          </div>
          <Button onClick={handleGenerateQuestions} disabled={loading || !company || !role}>
            {loading ? "Generating..." : "Generate Questions"}
          </Button>
        </CardContent>
      </Card>

      {questions && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="default">Technical</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal list-inside">
                {questions.technical.map((q, i) => (
                  <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300">{q}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="warning">Behavioral</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal list-inside">
                {questions.behavioral.map((q, i) => (
                  <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300">{q}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="secondary">Company-Specific</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal list-inside">
                {questions.companySpecific.map((q, i) => (
                  <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300">{q}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Follow-up Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Follow-up Email Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Company</label>
              <Input
                value={followUpCompany}
                onChange={(e) => setFollowUpCompany(e.target.value)}
                placeholder="e.g. Meta"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
              <Input
                value={followUpRole}
                onChange={(e) => setFollowUpRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Days Since Applied</label>
              <Input
                type="number"
                value={followUpDays}
                onChange={(e) => setFollowUpDays(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Current Stage</label>
              <Input
                value={followUpStage}
                onChange={(e) => setFollowUpStage(e.target.value)}
                placeholder="e.g. Applied, Phone Screen"
              />
            </div>
          </div>
          <Button onClick={handleGenerateFollowUp} disabled={emailLoading || !followUpCompany || !followUpRole}>
            {emailLoading ? "Generating..." : "Generate Follow-up Email"}
          </Button>

          {generatedEmail && (
            <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Generated Email</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(generatedEmail)}
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{generatedEmail}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
