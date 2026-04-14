import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MatchResult {
  matchScore: number;
  missingSkills: string[];
  keywords: string[];
  insights: string;
}

export async function analyzeResumeMatch(
  cvContent: string,
  jobDescription: string
): Promise<MatchResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert career advisor and ATS specialist. Analyze the match between a CV and job description. Return ONLY valid JSON with this exact structure:
{
  "matchScore": <number 0-100>,
  "missingSkills": [<array of missing skill strings>],
  "keywords": [<array of recommended keywords to add>],
  "insights": "<string with actionable CV improvement advice>"
}`,
      },
      {
        role: "user",
        content: `CV:\n${cvContent}\n\nJob Description:\n${jobDescription}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content) as MatchResult;
}

export async function generateFollowUpEmail(
  company: string,
  role: string,
  daysSinceApplication: number,
  stage: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional career coach. Write a concise, personalized follow-up email to a recruiter. Keep it under 150 words, professional but warm. Do not include subject line.",
      },
      {
        role: "user",
        content: `Company: ${company}\nRole: ${role}\nDays since application: ${daysSinceApplication}\nCurrent stage: ${stage}\n\nWrite a follow-up email.`,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateInterviewQuestions(
  company: string,
  role: string,
  jobDescription?: string
): Promise<{ technical: string[]; behavioral: string[]; companySpecific: string[] }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert interview coach. Generate likely interview questions. Return ONLY valid JSON:
{
  "technical": [<5 technical questions>],
  "behavioral": [<5 HR/behavioral questions>],
  "companySpecific": [<3 company-specific questions>]
}`,
      },
      {
        role: "user",
        content: `Company: ${company}\nRole: ${role}${jobDescription ? `\nJob Description: ${jobDescription}` : ""}`,
      },
    ],
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content);
}
