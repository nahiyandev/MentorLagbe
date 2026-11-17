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
  forest: "bg-sage-subtle text-forest",
  clay: "bg-clay-soft text-clay",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
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
