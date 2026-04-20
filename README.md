# CareerOS — AI-Powered Job Application Tracker

An intelligent career management SaaS that goes beyond basic CRUD. Track applications with a Kanban pipeline, get AI-powered CV-job matching, automate follow-up reminders, generate interview prep, and analyze your job search with data-driven insights.

## Features

### Application Kanban Pipeline

Drag-and-drop board with columns: **Wishlist → Applied → Interview → Offer → Rejected**

Each card tracks company, role, salary, source, deadline, notes, and reminder badges.

### AI Resume Match

Upload your CV + paste a job description. The system returns:

- **Match score %** — semantic similarity analysis
- **Missing skills** — gaps between your CV and the JD
- **Recommended keywords** — terms to add to your CV
- **Improvement insights** — actionable advice

Results are persisted to compare CV versions over time.

### Smart Reminder Engine

Automated workflows:

- Follow-up reminder after 5 days of no response
- Interview reminder 24h before
- Deadline alerts

Email delivery via **Resend** with Vercel Cron scheduling.

### AI Follow-up Email Generator

Generate personalized recruiter follow-up emails based on company, role, days since application, and interview stage. One-click copy.

### Interview Prep Generator

AI generates likely questions in three categories:

- Technical questions
- Behavioral/HR questions
- Company-specific questions

### Analytics Dashboard

- Applications per week (bar chart)
- Response rate / Rejection rate / Interview conversion
- Pipeline distribution (stacked bar)
- Application source breakdown
- Company response speed ranking
- CV version performance comparison

## Tech Stack

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Frontend      | Next.js 16, React 19, Tailwind CSS 4 |
| UI Components | Custom shadcn-style primitives       |
| Drag & Drop   | @dnd-kit                             |
| Backend       | Next.js API Routes                   |
| Database      | PostgreSQL + Prisma ORM              |
| AI            | OpenAI GPT-4o-mini                   |
| Email         | Resend                               |
| Deployment    | Vercel + Neon/Supabase               |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted via Neon/Supabase)
- OpenAI API key
- Resend API key

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Fill in your DATABASE_URL, OPENAI_API_KEY, RESEND_API_KEY

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Dashboard layout group
│   │   ├── dashboard/        # Overview page
│   │   ├── applications/     # Kanban board
│   │   ├── ai-match/         # CV-job matching
│   │   ├── interviews/       # Interview prep + follow-ups
│   │   ├── analytics/        # Charts and insights
│   │   └── reminders/        # Reminder management
│   ├── api/
│   │   ├── applications/     # CRUD + status updates
│   │   ├── ai/               # Match, follow-up, interview-prep
│   │   ├── analytics/        # Aggregated metrics
│   │   └── reminders/        # Reminder CRUD + processing
│   ├── layout.tsx
│   └── page.tsx              # Landing page
├── components/
│   ├── kanban/               # Board, column, card, form
│   ├── ui/                   # Button, Card, Input, Badge, Dialog, etc.
│   ├── sidebar.tsx
│   ├── top-bar.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── ai.ts                 # OpenAI integration
│   ├── db.ts                 # Prisma client
│   ├── email.ts              # Resend integration
│   ├── env.ts                # Environment validation
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
prisma/
└── schema.prisma             # Database schema
```

## Database Schema

- **users** — User accounts
- **applications** — Job applications with status pipeline
- **reminders** — Scheduled notifications (follow-up, interview, deadline)
- **cv_versions** — Stored CV content for version comparison
- **ai_matches** — Persisted AI analysis results



## License

MIT
