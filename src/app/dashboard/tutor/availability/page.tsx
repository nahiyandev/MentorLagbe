"use client";

import * as React from "react";
import { CalendarDays, Info, Loader2, Sparkles } from "lucide-react";
import type { TutorAvailabilitySlot, UserRecord } from "@/types";
import { apiFetch } from "@/lib/api";
import { TutorAvailabilityManager } from "@/components/dashboard/tutor-availability-manager";
import { TutorAvailabilityCalendar } from "@/components/tutors/tutor-availability-calendar";
import { Badge } from "@/components/ui/badge";

export default function TutorAvailabilityPage() {
  const [profile, setProfile] = React.useState<UserRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [availability, setAvailability] = React.useState<TutorAvailabilitySlot[]>([]);

  React.useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const res = await apiFetch<{ user?: UserRecord } | UserRecord>("/api/profile");
        const user = (res && "user" in res && res.user ? res.user : res) as UserRecord;
        if (active && user) {
          setProfile(user);
          if (user.availability && user.availability.length > 0) {
            setAvailability(user.availability);
          }
        }
      } catch {
        // non-blocking
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleSaved = (updated: TutorAvailabilitySlot[]) => {
    setAvailability(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-forest dark:text-[#8EE0BA] sm:text-3xl">
              My Weekly Availability &amp; Class Slots
            </h1>
            <Badge variant="clay" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              Slot Booking
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
            Configure which days and hours you are available to teach. Students can select their preferred class times directly from these slots when applying.
          </p>
        </div>
      </div>

      {/* Info Tip */}
      <div className="flex items-start gap-3 rounded-2xl border border-sage-border bg-sage-bg/40 dark:bg-[#1C2B22]/50 p-4 text-xs text-muted dark:text-[#9DB3A6]">
        <Info className="h-4 w-4 shrink-0 text-clay mt-0.5" />
        <p className="leading-relaxed">
          Keeping your free slots updated helps avoid scheduling conflicts. Once a student is accepted into a time slot, that slot is automatically locked on the batch page to prevent double-booking.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-sage-border bg-white dark:bg-[#141F18]">
          <Loader2 className="h-7 w-7 animate-spin text-forest dark:text-[#8EE0BA]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Availability Editor Form */}
          <div className="lg:col-span-7">
            <TutorAvailabilityManager
              initialAvailability={availability}
              onSaved={handleSaved}
            />
          </div>

          {/* Live Calendar Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-sage-border mb-3">
                <CalendarDays className="h-4 w-4 text-forest dark:text-[#8EE0BA]" />
                <h3 className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
                  Live Student View Preview
                </h3>
              </div>
              <p className="text-xs text-muted dark:text-[#9DB3A6] mb-3">
                This is how prospective students see your weekly availability on your public profile and tuition listings:
              </p>
              <TutorAvailabilityCalendar
                availability={availability}
                tutorName={profile?.name || "Tutor"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
