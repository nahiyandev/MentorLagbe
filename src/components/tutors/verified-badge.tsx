"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function VerifiedBadge({ className, size = "sm" }: VerifiedBadgeProps) {
  const { language } = useLanguage();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-bold transition-colors select-none",
        size === "sm"
          ? "px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
          : "px-2.5 py-1 text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60",
        className
      )}
      title="This educator has been verified by MentorLagbe admin."
    >
      <CheckCircle2 className={size === "sm" ? "h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" : "h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"} />
      <span>{language === "bn" ? "যাচাইকৃত টিউটর" : "Verified Mentor"}</span>
    </span>
  );
}
