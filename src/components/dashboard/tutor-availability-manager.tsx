"use client";

import * as React from "react";
import {
  CalendarDays,
  Clock,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { TutorAvailabilitySlot } from "@/types";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

const WEEKDAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const PRESET_SLOTS = [
  "9:00 AM - 11:00 AM",
  "10:00 AM - 12:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM",
  "6:00 PM - 8:00 PM",
  "8:00 PM - 10:00 PM",
];

interface TutorAvailabilityManagerProps {
  initialAvailability?: TutorAvailabilitySlot[];
  onSaved?: (updated: TutorAvailabilitySlot[]) => void;
}

export function TutorAvailabilityManager({
  initialAvailability,
  onSaved,
}: TutorAvailabilityManagerProps) {
  const [schedule, setSchedule] = React.useState<TutorAvailabilitySlot[]>(() => {
    if (initialAvailability && initialAvailability.length > 0) {
      return WEEKDAYS.map((day) => {
        const found = initialAvailability.find((item) => item.day === day);
        return (
          found || {
            day,
            isAvailable: day !== "Thursday" && day !== "Friday",
            slots: ["6:00 PM - 8:00 PM"],
          }
        );
      });
    }
    return WEEKDAYS.map((day) => ({
      day,
      isAvailable: day !== "Thursday" && day !== "Friday",
      slots: ["6:00 PM - 8:00 PM"],
    }));
  });

  const [saving, setSaving] = React.useState(false);

  const toggleDay = (day: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              isAvailable: !item.isAvailable,
              slots:
                !item.isAvailable && item.slots.length === 0
                  ? ["6:00 PM - 8:00 PM"]
                  : item.slots,
            }
          : item
      )
    );
  };

  const addSlot = (day: string, slot: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        if (item.slots.includes(slot)) return item;
        return {
          ...item,
          slots: [...item.slots, slot],
        };
      })
    );
  };

  const removeSlot = (day: string, slotIdx: number) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        const newSlots = item.slots.filter((_, idx) => idx !== slotIdx);
        return {
          ...item,
          slots: newSlots,
          isAvailable: newSlots.length > 0 ? item.isAvailable : false,
        };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ availability: schedule }),
      });
      toast.success("Weekly availability schedule saved!");
      if (onSaved) onSaved(schedule);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save availability."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sage-border">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-forest dark:text-[#8EE0BA]">
            <CalendarDays className="h-5 w-5 text-clay" />
            Manage Weekly Availability &amp; Free Slots
          </h3>
          <p className="mt-0.5 text-xs text-muted dark:text-[#9DB3A6]">
            Configure which days and hours you are available to take tuition classes. Students will see this when viewing your listings and profile.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="gap-1.5 shrink-0"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saving ? "Saving..." : "Save Availability"}</span>
        </Button>
      </div>

      <div className="space-y-3">
        {schedule.map((item) => (
          <div
            key={item.day}
            className={`rounded-xl border p-4 transition-colors ${
              item.isAvailable
                ? "border-forest/30 bg-emerald-50/30 dark:bg-[#1C2B22]/30"
                : "border-sage-border/60 bg-sage-bg/30 dark:bg-[#101A14] opacity-70"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleDay(item.day)}
                  className={`flex h-6 w-11 cursor-pointer rounded-full transition-colors p-0.5 ${
                    item.isAvailable
                      ? "bg-forest dark:bg-[#8EE0BA]"
                      : "bg-sage-border dark:bg-[#25362B]"
                  }`}
                  aria-label={`Toggle availability for ${item.day}`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                      item.isAvailable ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
                  {item.day}
                </span>
              </div>
              <span
                className={`text-xs font-semibold ${
                  item.isAvailable
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-muted dark:text-[#9DB3A6]"
                }`}
              >
                {item.isAvailable ? "Available" : "Off Day"}
              </span>
            </div>

            {item.isAvailable && (
              <div className="mt-3.5 pt-3 border-t border-sage-border/60 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-muted dark:text-[#9DB3A6] uppercase tracking-wider">
                    Active Slots:
                  </span>
                  {item.slots.map((slot, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#141F18] border border-sage-border px-2.5 py-1 text-xs font-medium text-ink dark:text-[#EFF5F0]"
                    >
                      <Clock className="h-3 w-3 text-clay shrink-0" />
                      <span>{slot}</span>
                      <button
                        type="button"
                        onClick={() => removeSlot(item.day, idx)}
                        className="text-muted hover:text-rose-500 cursor-pointer ml-0.5"
                        aria-label={`Remove slot ${slot}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Preset quick add chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-muted dark:text-[#9DB3A6]">
                    + Add Preset:
                  </span>
                  {PRESET_SLOTS.filter((s) => !item.slots.includes(s)).map(
                    (preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addSlot(item.day, preset)}
                        className="inline-flex items-center gap-1 rounded-md border border-dashed border-sage-border bg-white dark:bg-[#18261E] px-2 py-0.5 text-[11px] text-muted dark:text-[#9DB3A6] hover:text-forest hover:border-forest dark:hover:text-[#8EE0BA] cursor-pointer transition-colors"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        <span>{preset}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
