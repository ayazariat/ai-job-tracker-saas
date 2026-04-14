import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    secondary: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    outline: "border border-zinc-200 text-zinc-800 dark:border-zinc-700 dark:text-zinc-300",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
