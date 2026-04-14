import Link from "next/link";

const features = [
  {
    title: "Kanban Pipeline",
    description: "Drag-and-drop board: Wishlist → Applied → Interview → Offer → Rejected",
    icon: "📋",
  },
  {
    title: "AI Resume Match",
    description: "Semantic scoring against job descriptions with actionable insights",
    icon: "🧠",
  },
  {
    title: "Smart Reminders",
    description: "Auto follow-ups, interview alerts, and deadline notifications via email",
    icon: "🔔",
  },
  {
    title: "Interview Prep",
    description: "AI-generated technical, behavioral, and company-specific questions",
    icon: "🎯",
  },
  {
    title: "Follow-up Generator",
    description: "Personalized recruiter emails based on application context",
    icon: "✉️",
  },
  {
    title: "Analytics Dashboard",
    description: "Response rates, conversion metrics, source analysis, CV performance",
    icon: "📊",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-8">
              <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              AI-Powered Career Intelligence
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-7xl">
              Career<span className="text-indigo-600">OS</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Not just a job tracker — an intelligent career operating system.
              Track applications, analyze CV-job fit, automate follow-ups,
              and make data-driven decisions about your job search.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Open Dashboard
              </Link>
              <Link
                href="/applications"
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                View Kanban Board
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Decision Intelligence, Not CRUD
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Every feature is designed to optimize your hiring outcomes, not just store data.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500 dark:text-zinc-400">
            <span>Next.js 16</span>
            <span>·</span>
            <span>TypeScript</span>
            <span>·</span>
            <span>Tailwind CSS</span>
            <span>·</span>
            <span>PostgreSQL</span>
            <span>·</span>
            <span>Prisma</span>
            <span>·</span>
            <span>OpenAI</span>
            <span>·</span>
            <span>Resend</span>
          </div>
        </div>
      </div>
    </div>
  );
}
