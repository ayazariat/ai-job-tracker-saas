"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ThemeProvider } from "@/components/theme-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
        <Sidebar />
        <div className="flex flex-1 flex-col pl-64">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
