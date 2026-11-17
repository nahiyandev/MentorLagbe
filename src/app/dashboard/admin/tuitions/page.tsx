"use client";

import * as React from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import type { ApprovalStatus, Tuition } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { cn, formatDate, formatFee, isValidImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatusFilter = "all" | ApprovalStatus;

export default function AdminTuitionsPage() {
  const [tuitions, setTuitions] = React.useState<Tuition[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<StatusFilter>("all");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<unknown>("/api/admin/tuitions");
        if (active) setTuitions(extractList<Tuition>(res, "tuitions"));
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError(
              "Backend JWT token is missing or expired. Once POST /api/auth/jwt is live on the server, sign in again to moderate tuitions."
            );
          } else {
            setError(
              err instanceof Error ? err.message : "Could not load tuitions."
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

  const handleModerate = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      await apiFetch(
        `/api/admin/tuitions/${encodeURIComponent(id)}/${action}`,
        { method: "PATCH" }
      );
      const nextStatus: ApprovalStatus =
        action === "approve" ? "approved" : "rejected";
      setTuitions((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, approvalStatus: nextStatus } : item
        )
      );
      toast.success(
        action === "approve"
          ? "Tuition approved and published."
          : "Tuition rejected."
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Could not ${action} tuition listing.`
      );
    } finally {
      setBusyId(null);
    }
  };

  const filtered =
    filter === "all"
      ? tuitions
      : tuitions.filter((t) => t.approvalStatus === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
            Admin Tuition Approvals
          </h1>
          <p className="mt-1 text-sm text-muted">
            Review tutor submissions and approve or reject listings before they
            appear on Browse Tuitions.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-sage-border bg-white p-1">
          {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-colors cursor-pointer",
                  filter === tab
                    ? "bg-forest text-white"
                    : "text-muted hover:bg-sage-subtle hover:text-forest"
                )}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Tuition Submissions ({loading ? "…" : filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 p-10 text-center">
              <p className="text-sm font-semibold text-forest">
                No tuition posts match this filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((t) => {
                const isBusy = busyId === t._id;
                return (
                  <div
                    key={t._id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-sage-border bg-sage-bg/35 p-4 sm:p-5 lg:flex-row lg:items-center"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {isValidImageUrl(t.bannerImage) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.bannerImage!}
                          alt={t.title}
                          className="hidden sm:block h-18 w-26 shrink-0 rounded-xl object-cover border border-sage-border"
                        />
                      ) : (
                        <div className="hidden sm:flex h-18 w-26 shrink-0 items-center justify-center rounded-xl bg-forest text-xs font-bold text-white">
                          {t.subject}
                        </div>
                      )}

                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant={
                              t.approvalStatus === "approved"
                                ? "success"
                                : t.approvalStatus === "rejected"
                                  ? "danger"
                                  : "warning"
                            }
                            className="capitalize"
                          >
                            {t.approvalStatus}
                          </Badge>
                          <Badge variant={t.isActive ? "sage" : "outline"}>
                            {t.isActive ? "Active" : "Closed"}
                          </Badge>
                          <Badge variant="outline">{t.mode}</Badge>
                        </div>

                        <h3 className="truncate text-base font-bold text-forest">
                          {t.title}
                        </h3>
                        <p className="text-xs text-muted">
                          By <strong className="text-ink">{t.tutorName}</strong>{" "}
                          ({t.tutorEmail}) &bull; {t.subject} ({t.classLevel})
                          &bull;{" "}
                          <span className="font-bold text-clay">
                            {formatFee(t.monthlyFee)}/mo
                          </span>
                          {t.createdAt ? ` • ${formatDate(t.createdAt)}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        disabled={isBusy || t.approvalStatus === "approved"}
                        onClick={() => handleModerate(t._id, "approve")}
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Approve
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isBusy || t.approvalStatus === "rejected"}
                        onClick={() => handleModerate(t._id, "reject")}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
