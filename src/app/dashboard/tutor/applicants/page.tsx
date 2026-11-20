"use client";

import * as React from "react";
import {
  CalendarClock,
  Check,
  Download,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
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
  const [slipApp, setSlipApp] = React.useState<Application | null>(null);
  const [slipOpen, setSlipOpen] = React.useState(false);

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
                        )}
                        <Button
                          size="sm"
                          disabled={isUpdating || app.status === "accepted"}
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
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 shrink-0 text-forest" />
                        <span className="truncate">
                          {app.preferredSchedule}
                        </span>
                      </div>
                    </div>

                    {app.studentNote && (
                      <div className="flex items-start gap-2 rounded-xl border border-sage-border bg-white p-3 text-xs text-muted">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                        <p className="leading-relaxed text-ink">
                          {app.studentNote}
                        </p>
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
    </div>
  );
}
