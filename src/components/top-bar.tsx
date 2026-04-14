"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function TopBar() {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <Input
            placeholder="Search applications, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">U</span>
        </div>
      </div>
    </header>
  );
}
