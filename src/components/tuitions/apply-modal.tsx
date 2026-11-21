"use client";

import * as React from "react";
import { CalendarClock, Check, Clock, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import type { Tuition, TutorAvailabilitySlot } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  tuition: Tuition;
  defaultPhone?: string;
  onSuccess: () => void;
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

export function ApplyModal({
  open,
  onClose,
  tuition,
  defaultPhone = "",
  onSuccess,
}: ApplyModalProps) {
  const { data: session } = useSession();
  const [studentPhone, setStudentPhone] = React.useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = React.useState<string[]>([]);
  const [preferredSchedule, setPreferredSchedule] = React.useState("");
  const [studentNote, setStudentNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const phoneValue = studentPhone ?? defaultPhone;

  const schedule = React.useMemo(() => {
    return tuition.tutorAvailability && tuition.tutorAvailability.length > 0
      ? tuition.tutorAvailability
      : DEFAULT_DAYS;
  }, [tuition.tutorAvailability]);

  const activeDaysWithSlots = React.useMemo(() => {
    return schedule.filter(
      (day) => day.isAvailable && day.slots && day.slots.length > 0
    );
  }, [schedule]);

  const handleToggleSlot = (dayName: string, slotTime: string) => {
    const slotKey = `${dayName.slice(0, 3)}: ${slotTime}`;
    setSelectedSlots((prev) => {
      const exists = prev.includes(slotKey);
      const updated = exists
        ? prev.filter((s) => s !== slotKey)
        : [...prev, slotKey];

      if (updated.length > 0) {
        setPreferredSchedule(updated.join(", "));
      } else {
        setPreferredSchedule("");
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneValue.trim() || phoneValue.trim().length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    if (!preferredSchedule.trim()) {
      toast.error("Please select a slot or specify your preferred schedule.");
      return;
    }
    if (!studentNote.trim() || studentNote.trim().length < 10) {
      toast.error("Please add a brief learning note (at least 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          tuitionId: tuition._id,
          studentPhone: phoneValue.trim(),
          preferredSchedule: preferredSchedule.trim(),
          selectedSlots,
          studentNote: studentNote.trim(),
          studentName: session?.user?.name?.trim() || "Student",
        }),
      });

      toast.success("Application submitted! The tutor will review it soon.");
      setSelectedSlots([]);
      setPreferredSchedule("");
      setStudentNote("");
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("You have already applied for this tuition.");
        } else if (err.status === 401) {
          toast.error(
            "Your backend session token is missing or expired. Please sign in again."
          );
        } else if (err.status === 403) {
          toast.error("Only student accounts can apply for tuitions.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Apply for Tuition"
      description={`${tuition.title} — ${tuition.subject} (${tuition.classLevel})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="studentPhone">Contact Phone Number</Label>
          <Input
            id="studentPhone"
            type="tel"
            placeholder="e.g., +880 1711-000000"
            value={phoneValue}
            onChange={(e) => setStudentPhone(e.target.value)}
            required
          />
        </div>

        {/* Slot Booking Section */}
        <div className="space-y-2 rounded-xl border border-sage-border bg-sage-bg/40 dark:bg-[#1C2B22]/40 p-3 sm:p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-forest dark:text-[#8EE0BA]" />
              <Label className="text-xs font-bold text-forest dark:text-[#8EE0BA]">
                Choose Class Slot(s)
              </Label>
            </div>
            {tuition.daysPerWeek && (
              <span className="text-[11px] font-semibold text-clay dark:text-amber-300">
                Batch requirement: {tuition.daysPerWeek} days/week
              </span>
            )}
          </div>

          <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
            Select one or more available weekly slots from {tuition.tutorName || "the tutor"}&apos;s schedule:
          </p>

          {activeDaysWithSlots.length > 0 ? (
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {activeDaysWithSlots.map((item) => (
                <div key={item.day} className="space-y-1">
                  <span className="text-[11px] font-bold text-forest dark:text-[#8EE0BA]">
                    {item.day}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.slots.map((slot) => {
                      const slotKey = `${item.day.slice(0, 3)}: ${slot}`;
                      const isSelected = selectedSlots.includes(slotKey);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleToggleSlot(item.day, slot)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                            isSelected
                              ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-xs"
                              : "bg-white dark:bg-[#141F18] border border-sage-border text-muted dark:text-[#9DB3A6] hover:border-forest/40 hover:text-forest dark:hover:text-[#8EE0BA]"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          <span>{slot}</span>
                          {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-muted">
              Tutor has not set fixed weekly slots. Please specify your timing below.
            </p>
          )}

          {selectedSlots.length > 0 && (
            <div className="flex items-center justify-between border-t border-sage-border/60 pt-2 text-[11px]">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                ✓ {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""} selected
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedSlots([]);
                  setPreferredSchedule("");
                }}
                className="text-muted hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferredSchedule">
            Preferred Schedule / Timing Note
          </Label>
          <Input
            id="preferredSchedule"
            type="text"
            placeholder="e.g., Sat/Mon/Wed evenings or custom time"
            value={preferredSchedule}
            onChange={(e) => setPreferredSchedule(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="studentNote">Learning Goals &amp; Note</Label>
          <Textarea
            id="studentNote"
            rows={3}
            placeholder="Share your current class/level, topics you want to focus on, and any questions for the tutor..."
            value={studentNote}
            onChange={(e) => setStudentNote(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
