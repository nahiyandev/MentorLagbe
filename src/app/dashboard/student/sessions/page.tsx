"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Star,
  User,
  Video,
  Zap,
} from "lucide-react";
import type { Application } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { formatDate, formatFee } from "@/lib/utils";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface NextClassInfo {
  dayName: string;
  timeString: string;
  displayText: string;
  isToday: boolean;
  isTomorrow: boolean;
}

function calculateNextClass(
  slots?: string[],
  preferredSchedule?: string
): NextClassInfo {
  const scheduleText =
    slots && slots.length > 0 ? slots.join(", ") : preferredSchedule || "";
  if (!scheduleText) {
    return {
      dayName: "Scheduled Day",
      timeString: "As per schedule",
      displayText: "Flexible schedule with tutor",
      isToday: false,
      isTomorrow: false,
    };
  }

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const now = new Date();
  const currentDayIndex = now.getDay();

  // Find mentioned days in schedule
  const matchedDays: { dayIndex: number; dayName: string }[] = [];
  daysOfWeek.forEach((dayName, idx) => {
    const shortName = dayName.slice(0, 3);
    const regex = new RegExp(`\\b(${dayName}|${shortName})\\b`, "i");
    if (regex.test(scheduleText)) {
      matchedDays.push({ dayIndex: idx, dayName });
    }
  });

  // Extract time
  const timeMatch = scheduleText.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
  const timeString = timeMatch ? timeMatch[1].toUpperCase() : "6:00 PM";

  if (matchedDays.length === 0) {
    return {
      dayName: "Next Slot",
      timeString,
      displayText: scheduleText,
      isToday: false,
      isTomorrow: false,
    };
  }

  // Sort days by distance from current day: (dayIndex - currentDayIndex + 7) % 7
  matchedDays.sort((a, b) => {
    const distA = (a.dayIndex - currentDayIndex + 7) % 7;
    const distB = (b.dayIndex - currentDayIndex + 7) % 7;
    return distA - distB;
  });

  const nextDay = matchedDays[0];
  const daysAway = (nextDay.dayIndex - currentDayIndex + 7) % 7;
  const isToday = daysAway === 0;
  const isTomorrow = daysAway === 1;

  let displayText = `${nextDay.dayName} at ${timeString}`;
  if (isToday) {
    displayText = `Today at ${timeString}`;
  } else if (isTomorrow) {
    displayText = `Tomorrow at ${timeString}`;
  } else {
    displayText = `This ${nextDay.dayName} at ${timeString}`;
  }

  return {
    dayName: nextDay.dayName,
    timeString,
    displayText,
    isToday,
    isTomorrow,
  };
}

function calculateCompletedClasses(
  startDateStr?: string,
  slotsCount = 3
): number {
  if (!startDateStr) return 1;
  const start = new Date(startDateStr).getTime();
  const now = Date.now();
  if (isNaN(start) || start > now) return 1;

  const diffInDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  const weeks = Math.floor(diffInDays / 7);
  const daysRemainder = diffInDays % 7;
  const frequency = Math.max(1, slotsCount || 3);

  const completed =
    weeks * frequency + Math.min(frequency, Math.floor((daysRemainder / 7) * frequency));
  return Math.max(1, completed);
}

export default function StudentSessionsPage() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Review Dialog State
  const [reviewApp, setReviewApp] = React.useState<Application | null>(null);
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<unknown>("/api/applications/my-applications");
      setApplications(extractList<Application>(res, "applications"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load class sessions. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let active = true;
    async function init() {
      try {
        const res = await apiFetch<unknown>("/api/applications/my-applications");
        if (active) {
          setApplications(extractList<Application>(res, "applications"));
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError("Session expired. Please log in again.");
          } else {
            setError("Failed to load class sessions. Please refresh.");
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, []);

  const acceptedApps = React.useMemo(
    () => applications.filter((a) => a.status === "accepted"),
    [applications]
  );

  const pendingApps = React.useMemo(
    () => applications.filter((a) => a.status === "pending"),
    [applications]
  );

  const totalCompletedClasses = React.useMemo(() => {
    return acceptedApps.reduce((sum, app) => {
      const slotsCount =
        app.selectedSlots && app.selectedSlots.length > 0
          ? app.selectedSlots.length
          : 3;
      return sum + calculateCompletedClasses(app.decidedAt || app.appliedAt, slotsCount);
    }, 0);
  }, [acceptedApps]);

  const activeMeetLinksCount = React.useMemo(() => {
    return acceptedApps.filter((a) => Boolean(a.meetLink && a.meetLink.trim())).length;
  }, [acceptedApps]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 dark:bg-[#8EE0BA]/15 text-forest dark:text-[#8EE0BA]">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-forest dark:text-[#8EE0BA]">
              Class Sessions & Schedule Tracker
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6]">
            Track completed classes with your tutors, upcoming class schedules, and join live Google Meet lectures.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/tuitions">
            <Button size="sm" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Browse Batches</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-xs font-semibold text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Enrolled Batches"
          value={loading ? "..." : acceptedApps.length}
          helper="Batches currently learning with verified tutors"
          icon={CalendarCheck}
          tone="forest"
        />
        <StatCard
          label="Total Classes Completed"
          value={loading ? "..." : totalCompletedClasses}
          helper="Live sessions attended across all batches"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Live Meet Links Ready"
          value={loading ? "..." : activeMeetLinksCount}
          helper="Tutors who provided class Google Meet links"
          icon={Video}
          tone="clay"
        />
        <StatCard
          label="Pending Applications"
          value={loading ? "..." : pendingApps.length}
          helper="Batches waiting for tutor acceptance"
          icon={Clock}
          tone="amber"
        />
      </div>

      {/* Main Sessions Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-sage-border pb-3">
          <div>
            <h2 className="text-lg font-bold text-forest dark:text-[#8EE0BA]">
              Your Active Enrolled Batches ({acceptedApps.length})
            </h2>
            <p className="text-xs text-muted dark:text-[#9DB3A6]">
              Detailed session breakdown, upcoming class timetable, and Google Meet links.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-6 space-y-4 shadow-xs"
              >
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            ))}
          </div>
        ) : acceptedApps.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-subtle text-forest dark:text-[#8EE0BA] dark:bg-[#1C2B22]">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                  No active learning sessions yet
                </h3>
                <p className="text-xs text-muted dark:text-[#9DB3A6] leading-relaxed">
                  {pendingApps.length > 0
                    ? `You have ${pendingApps.length} pending application(s) awaiting tutor review. Once accepted, your class schedule, completed sessions, and Meet link will appear here.`
                    : "Apply for a tuition to start learning. You can pick your preferred schedule and book slots directly."}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link href="/tuitions">
                  <Button size="sm">Explore Tuitions</Button>
                </Link>
                {pendingApps.length > 0 && (
                  <Link href="/dashboard/student/my-applications">
                    <Button variant="outline" size="sm">
                      View Applications
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {acceptedApps.map((app) => {
              const slotsCount =
                app.selectedSlots && app.selectedSlots.length > 0
                  ? app.selectedSlots.length
                  : 3;
              const completedCount = calculateCompletedClasses(
                app.decidedAt || app.appliedAt,
                slotsCount
              );
              const nextClass = calculateNextClass(
                app.selectedSlots,
                app.preferredSchedule
              );
              const hasMeet = Boolean(app.meetLink && app.meetLink.trim());

              return (
                <div
                  key={app._id}
                  className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] shadow-xs overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Top Status Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sage-border bg-sage-bg/50 dark:bg-[#1C2B22]/50 px-5 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Enrolled & Active</Badge>
                      <span className="text-muted dark:text-[#9DB3A6] text-[11px]">
                        Enrolled on {formatDate(app.decidedAt || app.appliedAt || "")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-forest dark:text-[#8EE0BA]">
                        {formatFee(app.monthlyFee)}
                      </span>
                      <span className="text-muted dark:text-[#9DB3A6] text-[11px]">
                        / month
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Tuition & Tutor Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-forest/10 dark:bg-[#8EE0BA]/15 px-2 py-0.5 text-xs font-bold text-forest dark:text-[#8EE0BA]">
                            {app.subject}
                          </span>
                        </div>
                        <h3 className="mt-1 text-lg font-black text-forest dark:text-[#8EE0BA]">
                          <Link
                            href={`/tuitions/${app.tuitionId}`}
                            className="hover:underline"
                          >
                            {app.tuitionTitle}
                          </Link>
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted dark:text-[#9DB3A6]">
                          <User className="h-3.5 w-3.5" />
                          <span>Tutor: {app.tutorName || app.tutorEmail}</span>
                        </p>
                      </div>

                      {/* Quick Chat / Contact */}
                      <div className="flex items-center gap-2">
                        <Link href="/dashboard/messages">
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Chat with Tutor</span>
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setReviewApp(app);
                            setReviewOpen(true);
                          }}
                          className="gap-1.5 text-xs"
                        >
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span>Rate / Review</span>
                        </Button>
                      </div>
                    </div>

                    {/* Class Tracker Grid: Next Class + Completed Classes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Box 1: Next Upcoming Class */}
                      <div
                        className={`rounded-xl border p-4 space-y-3 ${
                          nextClass.isToday
                            ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/30"
                            : "border-sage-border bg-sage-bg/40 dark:bg-[#101A14]/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted dark:text-[#9DB3A6] flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA]" />
                            Next Upcoming Class
                          </span>
                          {nextClass.isToday ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-black animate-pulse">
                              <Zap className="h-2.5 w-2.5 fill-white" />
                              Today
                            </span>
                          ) : nextClass.isTomorrow ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-black">
                              Tomorrow
                            </span>
                          ) : null}
                        </div>

                        <div>
                          <div className="text-base font-extrabold text-forest dark:text-[#8EE0BA]">
                            {nextClass.displayText}
                          </div>
                          <p className="text-xs text-muted dark:text-[#9DB3A6] mt-0.5">
                            Routine Slots:{" "}
                            {app.selectedSlots && app.selectedSlots.length > 0
                              ? app.selectedSlots.join(" &bull; ")
                              : app.preferredSchedule}
                          </p>
                        </div>
                      </div>

                      {/* Box 2: Completed Classes Progress */}
                      <div className="rounded-xl border border-sage-border bg-sage-bg/40 dark:bg-[#101A14]/60 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted dark:text-[#9DB3A6] flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            Completed Classes
                          </span>
                          <span className="text-xs font-bold text-forest dark:text-[#8EE0BA]">
                            {slotsCount} classes / week
                          </span>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-forest dark:text-[#8EE0BA]">
                              {completedCount}
                            </span>
                            <span className="text-xs text-muted dark:text-[#9DB3A6]">
                              classes finished since enrollment
                            </span>
                          </div>
                          <p className="text-[11px] text-muted dark:text-[#9DB3A6] mt-1">
                            Regularly attending scheduled weekly sessions with tutor.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Google Meet Classroom Join Row */}
                    <div className="rounded-xl border border-sage-border/80 bg-white dark:bg-[#1C2B22] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            hasMeet
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                              : "bg-sage-subtle text-muted dark:bg-[#141F18] dark:text-[#9DB3A6]"
                          }`}
                        >
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-forest dark:text-[#8EE0BA] flex items-center gap-1.5">
                            <span>Google Meet Class Room</span>
                            {hasMeet ? (
                              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            ) : null}
                          </div>
                          <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
                            {hasMeet
                              ? "Meet link active. Click the button to enter live class directly."
                              : "Tutor will share the Google Meet link before class starts."}
                          </p>
                        </div>
                      </div>

                      <div>
                        {hasMeet ? (
                          <a
                            href={
                              app.meetLink!.startsWith("http")
                                ? app.meetLink!
                                : `https://${app.meetLink!}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] hover:bg-forest/90 dark:hover:bg-[#7DCFA9] px-4 py-2 text-xs font-bold shadow-xs transition-all"
                          >
                            <Video className="h-4 w-4" />
                            <span>Join Live Class</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <Link href="/dashboard/messages">
                            <Button variant="outline" size="sm" className="text-xs gap-1">
                              <span>Ask Tutor for Link</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {reviewApp && (
        <ReviewDialog
          open={reviewOpen}
          onOpenChange={(open) => {
            setReviewOpen(open);
            if (!open) setReviewApp(null);
          }}
          tuitionId={reviewApp.tuitionId}
          tuitionTitle={reviewApp.tuitionTitle}
          onSuccess={() => void handleRefresh()}
        />
      )}
    </div>
  );
}
