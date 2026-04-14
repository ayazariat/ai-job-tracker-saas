import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { id: "demo-user" },
    create: {
      id: "demo-user",
      email: "demo@career-os.dev",
      name: "Demo User",
    },
    update: {},
  });

  console.log("Created user:", user.email);

  // Create sample applications
  const apps = [
    {
      company: "Google",
      role: "Senior Software Engineer",
      status: "INTERVIEW" as const,
      source: "LinkedIn",
      salaryRange: "$180k-$250k",
      notes: "Phone screen completed. On-site scheduled.",
      appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      company: "Stripe",
      role: "Full Stack Engineer",
      status: "APPLIED" as const,
      source: "Referral",
      salaryRange: "$160k-$200k",
      notes: "Referred by John from engineering team.",
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      company: "Vercel",
      role: "Frontend Engineer",
      status: "WISHLIST" as const,
      source: "Company Website",
      salaryRange: "$140k-$180k",
      notes: "Great culture. Need to tailor CV.",
    },
    {
      company: "Netflix",
      role: "Senior Frontend Engineer",
      status: "OFFER" as const,
      source: "LinkedIn",
      salaryRange: "$200k-$350k",
      notes: "Offer received! Negotiating terms.",
      appliedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      company: "Amazon",
      role: "SDE II",
      status: "REJECTED" as const,
      source: "Direct",
      salaryRange: "$150k-$200k",
      notes: "Didn't make it past loop interviews.",
      appliedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    },
    {
      company: "Shopify",
      role: "Staff Engineer",
      status: "APPLIED" as const,
      source: "AngelList",
      salaryRange: "$170k-$220k",
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      company: "Figma",
      role: "Product Engineer",
      status: "INTERVIEW" as const,
      source: "Referral",
      salaryRange: "$160k-$210k",
      notes: "Technical round next week.",
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      company: "Linear",
      role: "Software Engineer",
      status: "WISHLIST" as const,
      source: "Twitter",
      salaryRange: "$130k-$170k",
      notes: "Love the product. Applied via website.",
    },
  ];

  for (let i = 0; i < apps.length; i++) {
    const app = await prisma.application.upsert({
      where: {
        id: `seed-app-${i}`,
      },
      create: {
        id: `seed-app-${i}`,
        userId: user.id,
        company: apps[i].company,
        role: apps[i].role,
        status: apps[i].status,
        source: apps[i].source,
        salaryRange: apps[i].salaryRange,
        notes: apps[i].notes || null,
        appliedAt: apps[i].appliedAt || null,
        order: i,
      },
      update: {},
    });

    console.log(`Created application: ${app.company} - ${app.role} (${app.status})`);

    // Create follow-up reminder for APPLIED status
    if (apps[i].status === "APPLIED" && apps[i].appliedAt) {
      await prisma.reminder.upsert({
        where: { id: `seed-reminder-${i}` },
        create: {
          id: `seed-reminder-${i}`,
          applicationId: app.id,
          type: "FOLLOW_UP",
          sendAt: new Date(apps[i].appliedAt!.getTime() + 5 * 24 * 60 * 60 * 1000),
          message: `Follow up with ${apps[i].company} about ${apps[i].role}`,
        },
        update: {},
      });
    }
  }

  // Create a sample CV version
  await prisma.cvVersion.upsert({
    where: { id: "seed-cv-1" },
    create: {
      id: "seed-cv-1",
      userId: user.id,
      name: "General Tech CV v1",
      content: "John Doe - Software Engineer with 5 years of experience in React, Node.js, TypeScript, PostgreSQL...",
    },
    update: {},
  });

  console.log("\nSeed completed successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
