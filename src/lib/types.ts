export type ApplicationStatus = "WISHLIST" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  deadline: string | null;
  notes: string | null;
  salaryRange: string | null;
  source: string | null;
  url: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  reminders?: Reminder[];
}

export interface Reminder {
  id: string;
  applicationId: string;
  type: "FOLLOW_UP" | "INTERVIEW" | "DEADLINE";
  sendAt: string;
  sent: boolean;
  message: string | null;
}

export interface AiMatchResult {
  id: string;
  applicationId: string;
  cvVersionId: string;
  matchScore: number;
  missingSkills: string[];
  keywords: string[];
  insights: string | null;
  jobDescription: string;
  createdAt: string;
}

export interface CvVersion {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string }> = {
  WISHLIST: { label: "Wishlist", color: "text-blue-700 dark:text-blue-300", bgColor: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" },
  APPLIED: { label: "Applied", color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800" },
  INTERVIEW: { label: "Interview", color: "text-purple-700 dark:text-purple-300", bgColor: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800" },
  OFFER: { label: "Offer", color: "text-emerald-700 dark:text-emerald-300", bgColor: "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800" },
  REJECTED: { label: "Rejected", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" },
};

export const COLUMNS: ApplicationStatus[] = ["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
