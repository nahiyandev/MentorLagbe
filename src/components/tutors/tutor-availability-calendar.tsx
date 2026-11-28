"use client";

import * as React from "react";
import { CalendarDays, CheckCircle2, Lock, PlusCircle, XCircle } from "lucide-react";
import type { TutorAvailabilitySlot } from "@/types";
import { Badge } from "@/components/ui/badge";
import { BookSlotDialog } from "@/components/tuitions/book-slot-dialog";

interface TutorAvailabilityCalendarProps {
  availability?: TutorAvailabilitySlot[];
  daysPerWeek?: number;
  tutorName?: string;
  tuitionId?: string;
  tuitionTitle?: string;
  monthlyFee?: number;
  bookedSlots?: string[];
  onSlotBooked?: (slotKey: string) => void;
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

function parseSlot(rawSlot: string): { start: string; end: string | null } {
  const trimmed = rawSlot.trim();
  const parts = trimmed.split(/\s*[-–—]\s*|\s+to\s+/i);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return {
      start: parts[0].trim(),
      end: parts[1].trim(),
    };
  }
  return { start: trimmed, end: null };
}

export function TutorAvailabilityCalendar({
  availability,
  daysPerWeek,
  tutorName = "Tutor",
  tuitionId,
  tuitionTitle = "Tuition Class",
  monthlyFee,
  bookedSlots = [],
  onSlotBooked,
}: TutorAvailabilityCalendarProps) {
  const schedule =
    availability && availability.length > 0 ? availability : DEFAULT_DAYS;

  const availableDaysCount = schedule.filter((s) => s.isAvailable).length;

  const [bookingSlot, setBookingSlot] = React.useState<{
    day: string;
    slot: string;
  } | null>(null);

  const handleSlotClick = (day: string, slot: string) => {
    if (!tuitionId) return; // Read-only mode if no tuition context
    const slotKey = `${day.slice(0, 3)}: ${slot.trim()}`;
    if (bookedSlots.includes(slotKey)) return; // already booked
    setBookingSlot({ day, slot });
  };

  const handleBookingSuccess = (slotKey: string) => {
    if (onSlotBooked) onSlotBooked(slotKey);
  };

  return (
    <div className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sage-border">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-forest dark:text-[#8EE0BA]">
            <CalendarDays className="h-4 w-4 text-clay" />
            Weekly Class Slots &amp; Availability
          </h3>
          <p className="text-xs text-muted dark:text-[#9DB3A6] mt-0.5">
            {tutorName}&apos;s weekly schedule. {tuitionId ? "Click any available slot to book directly." : "Open teaching hours."}
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

      {/* 7-Day Grid with Horizontal Scroll Protection for narrow viewports */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="min-w-[580px] sm:min-w-0 grid grid-cols-7 gap-2 pt-4">
          {schedule.map((item) => {
            const isOff = !item.isAvailable || item.slots.length === 0;

            return (
              <div
                key={item.day}
                className={`flex flex-col rounded-xl border p-2 sm:p-2.5 transition-colors ${
                  isOff
                    ? "border-sage-border/50 bg-sage-bg/30 dark:bg-[#101A14] opacity-75"
                    : "border-forest/20 bg-emerald-50/50 dark:bg-[#1C2B22]/50 shadow-2xs"
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-forest dark:text-[#8EE0BA]">
                    {item.day.slice(0, 3)}
                  </span>
                  {isOff ? (
                    <XCircle className="h-3.5 w-3.5 text-muted/60 dark:text-[#9DB3A6]/60 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider block text-center rounded-sm py-0.5 ${
                    isOff
                      ? "text-muted dark:text-[#9DB3A6] bg-sage-bg/60 dark:bg-[#141F18]"
                      : "text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60"
                  }`}
                >
                  {isOff ? "Off Day" : "Available"}
                </span>

                {/* Time Slots */}
                <div className="mt-2 flex-1 flex flex-col gap-1.5 justify-center">
                  {isOff ? (
                    <div className="py-3 text-center">
                      <span className="text-[10px] italic text-muted dark:text-[#9DB3A6]">
                        No classes
                      </span>
                    </div>
                  ) : (
                    item.slots.map((slot, sIdx) => {
                      const { start, end } = parseSlot(slot);
                      const slotKey = `${item.day.slice(0, 3)}: ${slot.trim()}`;
                      const isBooked = bookedSlots.includes(slotKey);
                      const canBook = Boolean(tuitionId) && !isBooked;

                      return (
                        <div
                          key={sIdx}
                          onClick={() => {
                            if (canBook) handleSlotClick(item.day, slot);
                          }}
                          className={`rounded-lg border px-1 py-1.5 text-center shadow-2xs transition-all ${
                            isBooked
                              ? "bg-sage-bg/80 dark:bg-[#101A14] border-red-200 dark:border-red-900/60 opacity-80 cursor-not-allowed"
                              : canBook
                              ? "bg-white dark:bg-[#18261E] border-emerald-300 dark:border-emerald-700 hover:border-forest dark:hover:border-[#8EE0BA] hover:ring-2 hover:ring-forest/20 cursor-pointer group"
                              : "bg-white dark:bg-[#18261E] border-sage-border/90"
                          }`}
                        >
                          <span className="block text-[11px] font-bold text-forest dark:text-[#8EE0BA] leading-tight">
                            {start}
                          </span>
                          {end && (
                            <span className="block text-[10px] font-medium text-muted dark:text-[#9DB3A6] leading-tight mt-0.5">
                              to {end}
                            </span>
                          )}

                          {/* Direct Booking Badge / Indicator */}
                          {isBooked ? (
                            <span className="mt-1 inline-flex items-center gap-0.5 rounded-sm bg-red-100 dark:bg-red-950/60 px-1 py-0.2 text-[8px] font-black text-red-700 dark:text-red-400">
                              <Lock className="h-2 w-2" /> Booked
                            </span>
                          ) : canBook ? (
                            <span className="mt-1 inline-flex items-center gap-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950/60 px-1 py-0.2 text-[8px] font-extrabold text-emerald-800 dark:text-emerald-300 group-hover:bg-forest group-hover:text-white transition-colors">
                              <PlusCircle className="h-2 w-2" /> Book Slot
                            </span>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3.5 text-center text-[11px] text-muted dark:text-[#9DB3A6]">
        * Times are in Bangladesh Standard Time (BST, UTC+6). {tuitionId ? "Clicking an open slot reserves that specific weekly time." : "Select preferred slots when booking."}
      </p>

      {/* Slot Booking Dialog */}
      {tuitionId && bookingSlot && (
        <BookSlotDialog
          open={Boolean(bookingSlot)}
          onClose={() => setBookingSlot(null)}
          tuitionId={tuitionId}
          tuitionTitle={tuitionTitle}
          tutorName={tutorName}
          slotDay={bookingSlot.day}
          slotTime={bookingSlot.slot}
          monthlyFee={monthlyFee}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
