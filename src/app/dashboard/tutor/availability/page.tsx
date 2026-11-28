"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  MessageCircle,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import type { TutorAvailabilitySlot, TutorBookedSlot, UserRecord } from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { TutorAvailabilityManager } from "@/components/dashboard/tutor-availability-manager";
import { TutorAvailabilityCalendar } from "@/components/tutors/tutor-availability-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TutorAvailabilityPage() {
  const [profile, setProfile] = React.useState<UserRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [availability, setAvailability] = React.useState<TutorAvailabilitySlot[]>([]);
  const [bookedSlots, setBookedSlots] = React.useState<TutorBookedSlot[]>([]);

  React.useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [profileRes, bookedRes] = await Promise.allSettled([
          apiFetch<{ user?: UserRecord } | UserRecord>("/api/profile"),
          apiFetch<TutorBookedSlot[]>("/api/applications/tutor/booked-slots"),
        ]);

        if (!active) return;

        if (profileRes.status === "fulfilled") {
          const res = profileRes.value;
          const user = (res && "user" in res && res.user ? res.user : res) as UserRecord;
          if (user) {
            setProfile(user);
            if (user.availability && user.availability.length > 0) {
              setAvailability(user.availability);
            }
          }
        }

        if (bookedRes.status === "fulfilled") {
          const list = extractList<TutorBookedSlot>(bookedRes.value);
          setBookedSlots(list);
        }
      } catch {
        // non-blocking
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, []);

  const handleSaved = (updated: TutorAvailabilitySlot[]) => {
    setAvailability(updated);
  };

  const bookedSlotKeys = bookedSlots.map((b) => b.slot);

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
            Configure which days and hours you are available to teach. Students can select and book their preferred class times directly from these slots.
          </p>
        </div>
      </div>

      {/* Info Tip */}
      <div className="flex items-start gap-3 rounded-2xl border border-sage-border bg-sage-bg/40 dark:bg-[#1C2B22]/50 p-4 text-xs text-muted dark:text-[#9DB3A6]">
        <Info className="h-4 w-4 shrink-0 text-clay mt-0.5" />
        <p className="leading-relaxed">
          Keeping your free slots updated helps avoid scheduling conflicts. Once a student books an open time slot, that slot is automatically locked on the batch page to prevent double-booking.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-sage-border bg-white dark:bg-[#141F18]">
          <Loader2 className="h-7 w-7 animate-spin text-forest dark:text-[#8EE0BA]" />
        </div>
      ) : (
        <div className="space-y-6">
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
                  This is how prospective students see your weekly availability and open booking slots on your profile:
                </p>
                <TutorAvailabilityCalendar
                  availability={availability}
                  tutorName={profile?.name || "Tutor"}
                  bookedSlots={bookedSlotKeys}
                />
              </div>
            </div>
          </div>

          {/* Booked Slots & Enrolled Students Section */}
          <Card className="border-sage-border shadow-xs">
            <CardHeader className="pb-3 border-b border-sage-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold text-forest dark:text-[#8EE0BA]">
                      Currently Booked Class Slots ({bookedSlots.length})
                    </CardTitle>
                    <p className="text-xs text-muted dark:text-[#9DB3A6]">
                      Students who have secured slots for active tuition batches
                    </p>
                  </div>
                </div>
                <Badge variant={bookedSlots.length > 0 ? "success" : "outline"} className="text-xs">
                  {bookedSlots.length} Booked
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {bookedSlots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-sage-border p-8 text-center bg-sage-bg/20 dark:bg-[#1C2B22]/20">
                  <Clock className="mx-auto h-8 w-8 text-muted/50 mb-2" />
                  <p className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
                    No booked slots yet.
                  </p>
                  <p className="text-xs text-muted dark:text-[#9DB3A6] mt-1 max-w-md mx-auto">
                    When students view your tuition listings and book your available time slots, their reservations will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {bookedSlots.map((b) => (
                    <div
                      key={b._id}
                      className="rounded-xl border border-sage-border/80 bg-white dark:bg-[#18261E] p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="clay" className="text-[10px] font-black uppercase">
                            {b.slot}
                          </Badge>
                          <h4 className="mt-1.5 text-xs font-bold text-forest dark:text-[#8EE0BA] line-clamp-1">
                            {b.tuitionTitle}
                          </h4>
                          <span className="text-[11px] text-muted dark:text-[#9DB3A6]">
                            Subject: {b.subject}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60 shrink-0">
                          <CheckCircle2 className="h-3 w-3" /> Confirmed
                        </span>
                      </div>

                      <div className="border-t border-sage-border/60 pt-2 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-ink dark:text-[#EFF5F0]">
                          <User className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA] shrink-0" />
                          <span className="truncate">{b.studentName}</span>
                        </div>
                        {b.studentPhone && b.studentPhone !== "—" && (
                          <div className="flex items-center gap-1.5 text-muted dark:text-[#9DB3A6]">
                            <Phone className="h-3.5 w-3.5 text-clay shrink-0" />
                            <span>{b.studentPhone}</span>
                          </div>
                        )}
                        {b.bookedAt && (
                          <p className="text-[10px] text-muted dark:text-[#9DB3A6] pt-0.5">
                            Booked on {formatDate(b.bookedAt)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href={`/dashboard/messages?user=${encodeURIComponent(b.studentEmail)}`}
                          className="w-full"
                        >
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="w-full gap-1.5 text-xs font-semibold h-8"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Message Student
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

