"use client";

import * as React from "react";
import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { TutorAvailabilitySlot } from "@/types";
import { Badge } from "@/components/ui/badge";

interface TutorAvailabilityCalendarProps {
  availability?: TutorAvailabilitySlot[];
  daysPerWeek?: number;
  tutorName?: string;
}

const DEFAULT_DAYS: TutorAvailabilitySlot[] = [
  {
    day: "Saturday",
    isAvailable: true,
    slots: ["10:00 AM - 12:00 PM", "6:00 PM - 8:00 PM"],
  },
  {
    day: "Sunday",
    isAvailable: true,
    slots: ["6:00 PM - 8:00 PM"],
  },
  {
    day: "Monday",
    isAvailable: true,
    slots: ["6:00 PM - 8:00 PM"],
  },
  {
    day: "Tuesday",
    isAvailable: true,
    slots: ["6:00 PM - 8:00 PM"],
  },
  {
    day: "Wednesday",
    isAvailable: true,
    slots: ["6:00 PM - 8:00 PM"],
  },
  {
    day: "Thursday",
    isAvailable: false,
    slots: [],
  },
  {
    day: "Friday",
    isAvailable: false,
    slots: [],
  },
];

export function TutorAvailabilityCalendar({
  availability,
  daysPerWeek,
  tutorName = "Tutor",
}: TutorAvailabilityCalendarProps) {
  const schedule =
    availability && availability.length > 0 ? availability : DEFAULT_DAYS;

  const availableDaysCount = schedule.filter((s) => s.isAvailable).length;

  return (
    <div className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sage-border">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-forest dark:text-[#8EE0BA]">
            <CalendarDays className="h-4 w-4 text-clay" />
            Weekly Availability Calendar
          </h3>
          <p className="text-xs text-muted dark:text-[#9DB3A6] mt-0.5">
            {tutorName}&apos;s weekly schedule and open teaching hours
          </p>
        </div>
        <div className="flex items-center gap-2">
          {daysPerWeek && (
            <Badge variant="sage" className="text-xs">
              Batch: {daysPerWeek} days/week
            </Badge>
          )}
          <Badge
            variant={availableDaysCount > 0 ? "success" : "outline"}
            className="text-xs"
          >
            {availableDaysCount} Days Active
          </Badge>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4">
        {schedule.map((item) => {
          const isOff = !item.isAvailable || item.slots.length === 0;

          return (
            <div
              key={item.day}
              className={`flex flex-col rounded-xl border p-3 transition-colors ${
                isOff
                  ? "border-sage-border/50 bg-sage-bg/30 dark:bg-[#101A14] opacity-75"
                  : "border-forest/20 bg-emerald-50/50 dark:bg-[#1C2B22]/50 shadow-2xs"
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-forest dark:text-[#8EE0BA]">
                  {item.day.slice(0, 3)}
                </span>
                {isOff ? (
                  <XCircle className="h-3.5 w-3.5 text-muted/60 dark:text-[#9DB3A6]/60" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>

              {/* Status */}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isOff
                    ? "text-muted dark:text-[#9DB3A6]"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {isOff ? "Off Day" : "Available"}
              </span>

              {/* Time Slots */}
              <div className="mt-2.5 flex-1 flex flex-col gap-1.5">
                {isOff ? (
                  <span className="text-[10px] italic text-muted dark:text-[#9DB3A6]">
                    No classes
                  </span>
                ) : (
                  item.slots.map((slot, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-[#141F18] border border-sage-border/80 px-2 py-1 text-[10px] font-medium text-ink dark:text-[#EFF5F0] leading-tight"
                    >
                      <Clock className="h-2.5 w-2.5 text-clay shrink-0" />
                      <span className="truncate">{slot}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3.5 text-center text-[11px] text-muted dark:text-[#9DB3A6]">
        * Times are in Bangladesh Standard Time (BST, UTC+6). Specific batch hours can be agreed upon after applying.
      </p>
    </div>
  );
}
