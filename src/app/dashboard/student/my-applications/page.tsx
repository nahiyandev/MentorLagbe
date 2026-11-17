"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Application } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { formatDate, formatFee } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentMyApplicationsPage() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const fetchApplications = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<unknown>("/api/applications/my-applications");
      setApplications(extractList<Application>(res, "applications"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(
          "Backend JWT token is missing or expired. Once POST /api/auth/jwt is live on the server, sign in again to load your applications."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your applications."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  const handleCancel = async (app: Application) => {
    if (app.status !== "pending") return;
    setDeletingId(app._id);
    try {
      await apiFetch(`/api/applications/${encodeURIComponent(app._id)}`, {
        method: "DELETE",
      });
      setApplications((prev) => prev.filter((item) => item._id !== app._id));
      toast.success("Application cancelled successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not cancel application."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track every tuition you have applied for. Pending applications can
            be cancelled before a tutor responds.
          </p>
        </div>
        <Link href="/tuitions">
          <Button>
            <BookOpen className="h-4 w-4" />
            Browse More Tuitions
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Submitted Applications ({loading ? "…" : applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 p-10 text-center">
              <p className="text-base font-bold text-forest">
                No applications found
              </p>
              <p className="mt-1 text-sm text-muted">
                Browse approved tuitions and apply to get started.
              </p>
              <Link href="/tuitions" className="mt-5 inline-block">
                <Button size="sm">Browse Tuitions</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-sage-border text-xs uppercase tracking-wider text-muted">
                      <th className="pb-3 pr-4 font-bold">Tuition</th>
                      <th className="pb-3 px-4 font-bold">Tutor</th>
                      <th className="pb-3 px-4 font-bold">Monthly Fee</th>
                      <th className="pb-3 px-4 font-bold">Applied Date</th>
                      <th className="pb-3 px-4 font-bold">Status</th>
                      <th className="pb-3 pl-4 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-border">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-sage-bg/40">
                        <td className="py-4 pr-4">
                          <Link
                            href={`/tuitions/${app.tuitionId}`}
                            className="font-bold text-forest hover:text-clay transition-colors"
                          >
                            {app.tuitionTitle}
                          </Link>
                          <p className="text-xs text-muted">{app.subject}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-ink">
                            {app.tutorName || "Tutor"}
                          </p>
                          <p className="text-xs text-muted">{app.tutorEmail}</p>
                        </td>
                        <td className="py-4 px-4 font-bold text-clay">
                          {formatFee(app.monthlyFee)}
                        </td>
                        <td className="py-4 px-4 text-muted">
                          {formatDate(app.appliedAt || app.createdAt)}
                        </td>
                        <td className="py-4 px-4">
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
                        </td>
                        <td className="py-4 pl-4 text-right">
                          {app.status === "pending" ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deletingId === app._id}
                              onClick={() => handleCancel(app)}
                            >
                              {deletingId === app._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              Cancel
                            </Button>
                          ) : (
                            <span className="text-xs text-muted">Locked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="rounded-xl border border-sage-border bg-sage-bg/40 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/tuitions/${app.tuitionId}`}
                          className="font-bold text-forest hover:text-clay"
                        >
                          {app.tuitionTitle}
                        </Link>
                        <p className="text-xs text-muted">{app.subject}</p>
                      </div>
                      <Badge
                        variant={
                          app.status === "accepted"
                            ? "success"
                            : app.status === "rejected"
                              ? "danger"
                              : "warning"
                        }
                        className="capitalize shrink-0"
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted space-y-1">
                      <p>
                        <strong className="text-ink">Tutor:</strong>{" "}
                        {app.tutorName ? `${app.tutorName} (${app.tutorEmail})` : app.tutorEmail}
                      </p>
                      <p>
                        <strong className="text-ink">Fee:</strong>{" "}
                        <span className="font-bold text-clay">
                          {formatFee(app.monthlyFee)}
                        </span>
                      </p>
                      <p>
                        <strong className="text-ink">Applied:</strong>{" "}
                        {formatDate(app.appliedAt || app.createdAt)}
                      </p>
                    </div>
                    {app.status === "pending" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        disabled={deletingId === app._id}
                        onClick={() => handleCancel(app)}
                      >
                        {deletingId === app._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Cancel Application
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
