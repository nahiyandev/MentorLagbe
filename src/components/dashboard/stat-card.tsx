import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
  tone?: "forest" | "clay" | "emerald" | "amber";
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  forest: "bg-sage-subtle dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA]",
  clay: "bg-clay-soft dark:bg-[#34241B] text-clay dark:text-[#E58E58]",
  emerald: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  amber: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
};

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "forest",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-forest sm:text-3xl">
            {value}
          </p>
          {helper && (
            <p className="mt-1.5 text-xs text-muted truncate">{helper}</p>
          )}
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            TONE_CLASSES[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}
