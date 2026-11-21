"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { ReportRecord } from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const REASON_LABELS: Record<string, { label: string; tone: "amber" | "rose" | "purple" | "slate" }> = {
  inaccurate_info: { label: "Inaccurate Info", tone: "amber" },
  fake_fee: { label: "Fake Fee / Overcharging", tone: "rose" },
  unresponsive_tutor: { label: "Unresponsive Tutor", tone: "purple" },
  inappropriate_content: { label: "Inappropriate Content", tone: "rose" },
  other: { label: "Other Violation", tone: "slate" },
};

export default function AdminReportsPage() {
  const [reports, setReports] = React.useState<ReportRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const loadReports = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ reports?: ReportRecord[] }>("/api/reports");
      const list = extractList<ReportRecord>(res, "reports");
      setReports(list);
    } catch {
      toast.error("Failed to load listing reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    async function fetchInitial() {
      try {
        const res = await apiFetch<{ reports?: ReportRecord[] }>("/api/reports");
        if (active) {
          const list = extractList<ReportRecord>(res, "reports");
          setReports(list);
        }
      } catch {
        if (active) toast.error("Failed to load listing reports.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchInitial();
    return () => {
      active = false;
    };
  }, []);

  const handleUpdateStatus = async (
    id: string,
    newStatus: "pending" | "investigating" | "resolved" | "dismissed"
  ) => {
    setUpdatingId(id);
    try {
      await apiFetch(`/api/reports/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      );
      toast.success(`Report marked as ${newStatus}.`);
    } catch {
      toast.error("Failed to update report status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const investigatingCount = reports.filter(
    (r) => r.status === "investigating"
  ).length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  const filteredReports = reports.filter((r) => {
    const matchesStatus =
      filterStatus === "all" || r.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.reporterEmail.toLowerCase().includes(q) ||
      r.reporterName.toLowerCase().includes(q) ||
      r.tuitionId?.title.toLowerCase().includes(q) ||
      r.tuitionId?.tutorName.toLowerCase().includes(q) ||
      r.details.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-forest dark:text-[#8EE0BA] sm:text-3xl flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-rose-500" />
            Listing Reports Moderation
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
            Inspect user reports on fake fees, incorrect qualifications, or fraudulent tuition listings.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadReports()}
          disabled={loading}
          className="gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Metric Stat Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-4 shadow-2xs">
          <span className="text-xs font-bold text-muted dark:text-[#9DB3A6]">
            Total Reports
          </span>
          <p className="mt-1 text-2xl font-black text-forest dark:text-[#8EE0BA]">
            {reports.length}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 dark:bg-rose-950/20 dark:border-rose-900/40 p-4 shadow-2xs">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
            Pending Action
          </span>
          <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-300">
            {pendingCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 shadow-2xs">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
            Under Investigation
          </span>
          <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-300">
            {investigatingCount}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            Resolved / Handled
          </span>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-300">
            {resolvedCount}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted dark:text-[#9DB3A6]" />
          <input
            type="search"
            placeholder="Search by tuition, reporter, tutor, or detail keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-sage-border bg-white dark:bg-[#141F18] pl-9 pr-4 py-2 text-sm text-ink dark:text-[#EFF5F0] placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-forest/30"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-muted dark:text-[#9DB3A6] shrink-0" />
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "investigating", label: "Investigating" },
            { key: "resolved", label: "Resolved" },
            { key: "dismissed", label: "Dismissed" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                filterStatus === tab.key
                  ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-2xs"
                  : "bg-sage-subtle/70 dark:bg-[#1C2B22] text-muted dark:text-[#9DB3A6] hover:text-forest dark:hover:text-[#8EE0BA]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Reported Listings ({loading ? "…" : filteredReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/40 dark:bg-[#101A14] p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
                No reports matching the criteria!
              </p>
              <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6]">
                All tuition listings currently adhere to community guidelines.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const reasonMeta =
                  REASON_LABELS[report.reason] || {
                    label: report.reason,
                    tone: "slate",
                  };
                const isPending = report.status === "pending";
                const isInvestigating = report.status === "investigating";
                const isResolved = report.status === "resolved";
                const isDismissed = report.status === "dismissed";

                return (
                  <div
                    key={report._id}
                    className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-4 sm:p-5 shadow-2xs transition-all hover:border-forest/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-sage-border/60 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                            <AlertTriangle className="h-3 w-3" />
                            {reasonMeta.label}
                          </span>
                          <Badge
                            variant={
                              isPending
                                ? "danger"
                                : isInvestigating
                                ? "outline"
                                : isResolved
                                ? "success"
                                : "outline"
                            }
                            className="capitalize text-xs"
                          >
                            {report.status}
                          </Badge>
                        </div>

                        {/* Tuition details */}
                        {report.tuitionId ? (
                          <div className="mt-2 flex items-center gap-2">
                            <h3 className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                              {report.tuitionId.title}
                            </h3>
                            <Link
                              href={`/tuitions/${report.tuitionId._id}`}
                              target="_blank"
                              className="text-clay hover:underline inline-flex items-center gap-0.5 text-xs font-semibold"
                            >
                              <span>View Listing</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm italic text-muted">
                            [Listing deleted or not found]
                          </p>
                        )}

                        {report.tuitionId && (
                          <p className="text-xs text-muted dark:text-[#9DB3A6] mt-0.5">
                            Tutor: <span className="font-semibold text-ink dark:text-[#EFF5F0]">{report.tuitionId.tutorName}</span> ({report.tuitionId.tutorEmail}) • Subject: {report.tuitionId.subject}
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right text-xs text-muted dark:text-[#9DB3A6] shrink-0">
                        <span className="flex items-center gap-1 sm:justify-end">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(report.createdAt)}
                        </span>
                        <p className="mt-0.5">
                          Reported by: <strong className="text-ink dark:text-[#EFF5F0]">{report.reporterName}</strong> ({report.reporterEmail})
                        </p>
                      </div>
                    </div>

                    {/* Report Description */}
                    <div className="mt-3 rounded-xl bg-sage-bg/60 dark:bg-[#18261E] p-3 text-sm text-ink dark:text-[#EFF5F0]">
                      <p className="text-xs font-bold text-muted dark:text-[#9DB3A6] uppercase tracking-wider mb-1">
                        User Complaint Details:
                      </p>
                      <p className="whitespace-pre-line text-sm leading-relaxed">
                        {report.details}
                      </p>
                    </div>

                    {/* Status Actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2">
                      <span className="text-xs text-muted dark:text-[#9DB3A6]">
                        Take moderation action:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {!isInvestigating && !isResolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingId === report._id}
                            onClick={() => handleUpdateStatus(report._id, "investigating")}
                            className="text-amber-700 border-amber-300 hover:bg-amber-50 cursor-pointer"
                          >
                            Investigate
                          </Button>
                        )}

                        {!isResolved && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={updatingId === report._id}
                            onClick={() => handleUpdateStatus(report._id, "resolved")}
                            className="gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Resolve &amp; Close
                          </Button>
                        )}

                        {!isDismissed && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingId === report._id}
                            onClick={() => handleUpdateStatus(report._id, "dismissed")}
                            className="text-muted hover:text-rose-600 cursor-pointer gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Dismiss
                          </Button>
                        )}
                      </div>
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
