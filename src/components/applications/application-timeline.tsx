"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";
import type { Application } from "@/types";
import { formatDate } from "@/lib/utils";

interface ApplicationTimelineProps {
  application: Application;
  compact?: boolean;
}

export function ApplicationTimeline({
  application,
  compact = false,
}: ApplicationTimelineProps) {
  const isPending = application.status === "pending";
  const isAccepted = application.status === "accepted";
  const isRejected = application.status === "rejected";

  const appliedTime = formatDate(application.appliedAt || application.createdAt);
  const decidedTime = application.decidedAt
    ? formatDate(application.decidedAt)
    : application.updatedAt && !isPending
      ? formatDate(application.updatedAt)
      : null;

  const steps = [
    {
      id: "applied",
      label: "Applied",
      description: `Submitted on ${appliedTime}`,
      completed: true,
      current: false,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500",
    },
    {
      id: "review",
      label: "Under Review",
      description: isPending
        ? "Tutor is reviewing your profile & schedule"
        : "Profile reviewed by tutor",
      completed: !isPending,
      current: isPending,
      icon: isPending ? Clock : CheckCircle2,
      color: isPending
        ? "text-amber-500 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400",
      bgColor: isPending ? "bg-amber-500 animate-pulse" : "bg-emerald-500",
    },
    {
      id: "decision",
      label: isAccepted
        ? "Accepted 🎉"
        : isRejected
          ? "Application Closed"
          : "Decision Pending",
      description: isAccepted
        ? `Accepted on ${decidedTime || "recently"}. Admission confirmed!`
        : isRejected
          ? `Application was not selected. Feel free to explore other batches.`
          : "Awaiting final tutor confirmation",
      completed: isAccepted,
      failed: isRejected,
      current: false,
      icon: isAccepted ? CheckCircle2 : isRejected ? XCircle : Clock,
      color: isAccepted
        ? "text-emerald-600 dark:text-emerald-400"
        : isRejected
          ? "text-rose-500 dark:text-rose-400"
          : "text-muted dark:text-[#9DB3A6]",
      bgColor: isAccepted
        ? "bg-emerald-500"
        : isRejected
          ? "bg-rose-500"
          : "bg-sage-border dark:bg-[#25362B]",
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted dark:text-[#9DB3A6]">
        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          <span>Applied</span>
        </span>
        <span>→</span>
        <span
          className={`flex items-center gap-1 font-semibold ${
            isPending
              ? "text-amber-500 dark:text-amber-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {isPending ? (
            <Clock className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          <span>Under Review</span>
        </span>
        <span>→</span>
        <span
          className={`flex items-center gap-1 font-semibold ${
            isAccepted
              ? "text-emerald-600 dark:text-emerald-400"
              : isRejected
                ? "text-rose-500 dark:text-rose-400"
                : "text-muted"
          }`}
        >
          {isAccepted ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : isRejected ? (
            <XCircle className="h-3 w-3" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          <span>{isAccepted ? "Accepted" : isRejected ? "Rejected" : "Pending"}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sage-border bg-sage-bg/30 dark:bg-[#141F18] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest dark:text-[#8EE0BA]">
          <FileText className="h-4 w-4 text-clay" />
          Application Progress Tracker
        </h4>
        <span className="text-[11px] text-muted dark:text-[#9DB3A6]">
          Status: <strong className="capitalize text-forest dark:text-[#8EE0BA]">{application.status}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="relative flex items-start gap-3 rounded-xl border border-sage-border/60 bg-white dark:bg-[#18261E] p-3.5 shadow-2xs"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${step.bgColor}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-muted dark:text-[#9DB3A6]">
                    Step {idx + 1}
                  </span>
                </div>
                <p className={`text-xs font-bold ${step.color}`}>{step.label}</p>
                <p className="mt-0.5 text-[11px] text-muted dark:text-[#9DB3A6] leading-tight">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {(application.preferredSchedule || application.studentNote) && (
        <div className="mt-4 pt-3 border-t border-sage-border text-xs text-muted dark:text-[#9DB3A6] grid grid-cols-1 sm:grid-cols-2 gap-2">
          {application.preferredSchedule && (
            <p>
              <span className="font-semibold text-ink dark:text-[#EFF5F0]">Preferred Time:</span>{" "}
              {application.preferredSchedule}
            </p>
          )}
          {application.studentPhone && (
            <p>
              <span className="font-semibold text-ink dark:text-[#EFF5F0]">Contact:</span>{" "}
              {application.studentPhone}
            </p>
          )}
          {application.studentNote && (
            <p className="sm:col-span-2">
              <span className="font-semibold text-ink dark:text-[#EFF5F0]">Your Note:</span>{" "}
              &ldquo;{application.studentNote}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
