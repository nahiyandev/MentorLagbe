"use client";

import * as React from "react";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Application } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { AdmissionSlipDialog } from "@/components/tuitions/admission-slip-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TutorApplicantsPage() {
  const [applicants, setApplicants] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [markingAttendanceId, setMarkingAttendanceId] = React.useState<string | null>(null);
  const [slipApp, setSlipApp] = React.useState<Application | null>(null);
  const [slipOpen, setSlipOpen] = React.useState(false);
  const [meetModalApp, setMeetModalApp] = React.useState<Application | null>(null);
  const [meetUrlInput, setMeetUrlInput] = React.useState("");
  const [savingMeet, setSavingMeet] = React.useState(false);

  // Track already accepted slots per tuition to highlight conflicts
  const acceptedSlotsByTuition = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const a of applicants) {
      if (a.status === "accepted") {
        if (!map.has(a.tuitionId)) {
          map.set(a.tuitionId, new Set());
        }
        const set = map.get(a.tuitionId)!;
        if (Array.isArray(a.selectedSlots)) {
          for (const s of a.selectedSlots) set.add(s);
        }
        if (a.preferredSchedule) set.add(a.preferredSchedule);
      }
    }
    return map;
  }, [applicants]);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<unknown>("/api/applications/tutor");
        if (active) {
          setApplicants(extractList<Application>(res, "applications"));
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError(
              "Backend JWT token is missing or expired. Once POST /api/auth/jwt is live on the server, sign in again to manage applicants."
            );
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Could not load student applications."
            );
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const updateStatus = async (
    id: string,
    status: "accepted" | "rejected"
  ) => {
    setUpdatingId(id);
    try {
      await apiFetch(`/api/applications/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setApplicants((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status } : item))
      );
      toast.success(
        status === "accepted"
          ? "Application accepted!"
          : "Application rejected."
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const markAttendance = async (
    applicationId: string,
    action: "increment" | "decrement" = "increment"
  ) => {
    setMarkingAttendanceId(applicationId);
    try {
      const res = await apiFetch<Application>(
        `/api/applications/${encodeURIComponent(applicationId)}/attendance`,
        {
          method: "PATCH",
          body: JSON.stringify({ action }),
        }
      );
      setApplicants((prev) =>
        prev.map((item) =>
          item._id === applicationId
            ? { ...item, completedClasses: res.completedClasses }
            : item
        )
      );
      toast.success(
        action === "increment"
          ? `Class marked completed! Total: ${res.completedClasses || 1} classes done.`
          : `Class count adjusted to ${res.completedClasses || 0}.`
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not update class attendance."
      );
    } finally {
      setMarkingAttendanceId(null);
    }
  };

  const handleSaveMeetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetModalApp) return;
    setSavingMeet(true);
    try {
      const updated = await apiFetch<Application>(
        `/api/applications/${encodeURIComponent(meetModalApp._id)}/meet-link`,
        {
          method: "PATCH",
          body: JSON.stringify({ meetLink: meetUrlInput }),
        }
      );
      setApplicants((prev) =>
        prev.map((item) =>
          item._id === meetModalApp._id
            ? { ...item, meetLink: updated.meetLink }
            : item
        )
      );
      toast.success("Google Meet link saved successfully! Student notified.");
      setMeetModalApp(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update Google Meet link"
      );
    } finally {
      setSavingMeet(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
          Manage Applicants
        </h1>
        <p className="mt-1 text-sm text-muted">
          Review incoming student requests across your tuition posts and accept
          or reject each application.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Student Applications ({loading ? "…" : applicants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : applicants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 p-10 text-center">
              <p className="text-base font-bold text-forest">
                No applicants received yet
              </p>
              <p className="mt-1 text-sm text-muted">
                When students apply to your approved tuition listings, their
                details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((app) => {
                const isUpdating = updatingId === app._id;
                const acceptedSet = acceptedSlotsByTuition.get(app.tuitionId);
                const isPending = app.status === "pending";
                const hasSlotConflict = Boolean(
                  isPending &&
                  acceptedSet &&
                  ((Array.isArray(app.selectedSlots) &&
                    app.selectedSlots.some((s) => acceptedSet.has(s))) ||
                    (app.preferredSchedule &&
                      acceptedSet.has(app.preferredSchedule)))
                );

                return (
                  <div
                    key={app._id}
                    className="rounded-2xl border border-sage-border bg-sage-bg/35 p-5 space-y-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-forest">
                            {app.studentName}
                          </h3>
                          <Badge
                            variant={
                              app.status === "accepted"
                                ? "success"
                                : app.status === "rejected"
                                  ? "danger"
                                  : "warning"
                            }
                            className="capitalize"
                          >
                            {app.status}
                          </Badge>
                          {hasSlotConflict && (
                            <Badge variant="danger" className="text-[10px]">
                              Slot Conflict (Already Booked)
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-clay">
                          Tuition: {app.tuitionTitle}
                        </p>
                        <p className="text-xs text-muted">
                          Applied {formatDate(app.appliedAt || app.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {app.status === "accepted" && (
                          <>
                            {/* Attendance Marking Control */}
                            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-1 text-xs">
                              <span className="font-bold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                                {app.completedClasses || 0} done
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-1.5 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 font-black gap-1 cursor-pointer"
                                disabled={markingAttendanceId === app._id}
                                onClick={() => void markAttendance(app._id, "increment")}
                                title="Click after finishing a class to mark Done (+1)"
                              >
                                {markingAttendanceId === app._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                )}
                                <span>Done (+1)</span>
                              </Button>
                              {(app.completedClasses || 0) > 0 && (
                                <button
                                  type="button"
                                  className="text-[10px] text-muted hover:text-red-500 px-1 py-0.5 rounded cursor-pointer"
                                  disabled={markingAttendanceId === app._id}
                                  onClick={() => void markAttendance(app._id, "decrement")}
                                  title="Reduce 1 class if marked by mistake"
                                >
                                  -1
                                </button>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-xs border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              onClick={() => {
                                setMeetModalApp(app);
                                setMeetUrlInput(app.meetLink || "");
                              }}
                            >
                              <Video className="h-3.5 w-3.5" />
                              <span>{app.meetLink ? "Edit Meet Link" : "Set Meet Link"}</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-xs"
                              onClick={() => {
                                setSlipApp(app);
                                setSlipOpen(true);
                              }}
                            >
                              <Download className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA]" />
                              <span>Slip</span>
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          disabled={
                            isUpdating ||
                            app.status === "accepted" ||
                            hasSlotConflict
                          }
                          title={
                            hasSlotConflict
                              ? "Cannot accept: this time slot is already taken by another student."
                              : undefined
                          }
                          onClick={() => updateStatus(app._id, "accepted")}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isUpdating || app.status === "rejected"}
                          onClick={() => updateStatus(app._id, "rejected")}
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 border-t border-sage-border pt-3 text-xs text-ink sm:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-forest" />
                        <span className="truncate">{app.studentEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-forest" />
                        <span>{app.studentPhone}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 shrink-0 text-forest dark:text-[#8EE0BA]" />
                          <span className="font-medium text-forest dark:text-[#8EE0BA]">
                            {app.preferredSchedule}
                          </span>
                        </div>
                        {app.selectedSlots && app.selectedSlots.length > 0 && (
                          <div className="flex flex-wrap gap-1 pl-6">
                            {app.selectedSlots.map((slot) => (
                              <span
                                key={slot}
                                className="inline-flex items-center rounded-md bg-sage-subtle dark:bg-[#1C2B22] px-2 py-0.5 text-[10px] font-bold text-forest dark:text-[#8EE0BA]"
                              >
                                {slot}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {app.studentNote && (
                      <div className="flex items-start gap-2 rounded-xl border border-sage-border bg-white dark:bg-[#141F18] p-3 text-xs text-muted">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                        <p className="leading-relaxed text-ink dark:text-[#EFF5F0]">
                          {app.studentNote}
                        </p>
                      </div>
                    )}

                    {app.status === "accepted" && app.meetLink && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 px-3.5 py-2.5 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Video className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="font-bold text-blue-900 dark:text-blue-200">
                            Class Meet Link:
                          </span>
                          <a
                            href={app.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-700 dark:text-blue-300 hover:underline truncate"
                          >
                            {app.meetLink}
                          </a>
                        </div>
                        <a
                          href={app.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                        >
                          <span>Open Meet</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AdmissionSlipDialog
        application={slipApp}
        open={slipOpen}
        onOpenChange={setSlipOpen}
      />

      {/* Set / Edit Google Meet Dialog */}
      {meetModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-forest dark:text-[#8EE0BA] flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Class Google Meet Link
                </h3>
                <p className="text-xs text-muted dark:text-[#9DB3A6]">
                  For student: <strong>{meetModalApp.studentName}</strong> ({meetModalApp.tuitionTitle})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMeetModalApp(null)}
                className="rounded-lg p-1 text-muted hover:bg-sage-subtle dark:hover:bg-[#1C2B22] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeetLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink dark:text-[#EFF5F0]">
                  Google Meet / Class URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={meetUrlInput}
                  onChange={(e) => setMeetUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-sage-border bg-sage-bg/30 dark:bg-[#1C2B22]/50 px-3.5 py-2.5 text-xs text-ink dark:text-[#EFF5F0] focus:border-forest dark:focus:border-[#8EE0BA] focus:outline-hidden"
                />
                <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
                  The student will see a &quot;Join Class&quot; button on their application dashboard and admission slip.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMeetModalApp(null)}
                  disabled={savingMeet}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingMeet}
                  className="bg-[#1a73e8] hover:bg-[#1557b0] text-white gap-1.5"
                >
                  {savingMeet ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Video className="h-3.5 w-3.5" />
                  )}
                  Save &amp; Notify Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
