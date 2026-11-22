"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  Banknote,
  BookOpen,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Smartphone,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Application, PayoutRequest, Tuition } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { formatDate, formatFee, formatWhatsAppUrl } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsBreakdown {
  tuitionId: string;
  title: string;
  subject: string;
  monthlyFee: number;
  mode: string;
  approvalStatus: string;
  isActive: boolean;
  views: number;
  applicantsCount: number;
  acceptedCount: number;
  tuitionEarnings?: number;
}

interface TutorAnalyticsData {
  totals: {
    totalListings: number;
    totalViews: number;
    totalApplicants: number;
    totalAccepted: number;
    totalEarnings?: number;
  };
  breakdown: AnalyticsBreakdown[];
}

interface MonthlyGroup {
  monthKey: string;
  monthName: string;
  year: number;
  enrolledCount: number;
  earnings: number;
}

export default function TutorEarningsPage() {
  const [tuitions, setTuitions] = React.useState<Tuition[]>([]);
  const [applicants, setApplicants] = React.useState<Application[]>([]);
  const [analytics, setAnalytics] = React.useState<TutorAnalyticsData | null>(null);
  const [payouts, setPayouts] = React.useState<PayoutRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [markingAttendanceId, setMarkingAttendanceId] = React.useState<string | null>(null);

  // Payout Request Modal States
  const [payoutModalOpen, setPayoutModalOpen] = React.useState(false);
  const [payoutAmount, setPayoutAmount] = React.useState("");
  const [payoutMethod, setPayoutMethod] = React.useState<"bkash" | "nagad" | "bank">("bkash");
  const [payoutAccount, setPayoutAccount] = React.useState("");
  const [submittingPayout, setSubmittingPayout] = React.useState(false);

  const handleMarkAttendance = async (
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
        err instanceof Error ? err.message : "Failed to update attendance."
      );
    } finally {
      setMarkingAttendanceId(null);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tuitionRes, applicantRes, analyticsRes, payoutsRes] = await Promise.all([
        apiFetch<unknown>("/api/tuitions/my-tuitions"),
        apiFetch<unknown>("/api/applications/tutor"),
        apiFetch<TutorAnalyticsData>("/api/tuitions/tutor/analytics").catch(() => null),
        apiFetch<unknown>("/api/payouts/my-requests").catch(() => []),
      ]);
      setTuitions(extractList<Tuition>(tuitionRes, "tuitions"));
      setApplicants(extractList<Application>(applicantRes, "applications"));
      if (analyticsRes) setAnalytics(analyticsRes);
      setPayouts(extractList<PayoutRequest>(payoutsRes, "payouts"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Session expired or unauthorized. Please re-authenticate.");
      } else {
        setError("Failed to load earnings data. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let active = true;
    async function init() {
      try {
        const [tuitionRes, applicantRes, analyticsRes, payoutsRes] = await Promise.all([
          apiFetch<unknown>("/api/tuitions/my-tuitions"),
          apiFetch<unknown>("/api/applications/tutor"),
          apiFetch<TutorAnalyticsData>("/api/tuitions/tutor/analytics").catch(() => null),
          apiFetch<unknown>("/api/payouts/my-requests").catch(() => []),
        ]);
        if (active) {
          setTuitions(extractList<Tuition>(tuitionRes, "tuitions"));
          setApplicants(extractList<Application>(applicantRes, "applications"));
          if (analyticsRes) setAnalytics(analyticsRes);
          setPayouts(extractList<PayoutRequest>(payoutsRes, "payouts"));
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError("Session expired or unauthorized. Please re-authenticate.");
          } else {
            setError("Failed to load earnings data. Please refresh.");
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

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    if (isNaN(amountNum) || amountNum < 100) {
      toast.error("Please enter a valid amount (minimum ৳100).");
      return;
    }
    if (!payoutAccount.trim() || payoutAccount.trim().length < 6) {
      toast.error("Please provide a valid account or mobile number.");
      return;
    }

    setSubmittingPayout(true);
    try {
      const res = await apiFetch<PayoutRequest>("/api/payouts", {
        method: "POST",
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod: payoutMethod,
          accountNumber: payoutAccount.trim(),
        }),
      });
      setPayouts((prev) => [res, ...prev]);
      toast.success("Payout request submitted successfully! Admin will review soon.");
      setPayoutModalOpen(false);
      setPayoutAmount("");
      setPayoutAccount("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit payout request.");
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Calculations
  const acceptedApps = React.useMemo(
    () => applicants.filter((a) => a.status === "accepted"),
    [applicants]
  );

  const pendingApps = React.useMemo(
    () => applicants.filter((a) => a.status === "pending"),
    [applicants]
  );

  // Total confirmed monthly earnings across all accepted students
  const totalEarnings = React.useMemo(() => {
    if (analytics?.totals?.totalEarnings !== undefined) {
      return analytics.totals.totalEarnings;
    }
    return acceptedApps.reduce((sum, a) => sum + (a.monthlyFee || 0), 0);
  }, [analytics, acceptedApps]);

  // Potential earnings in pipeline from pending applications
  const pendingEarnings = React.useMemo(() => {
    return pendingApps.reduce((sum, a) => sum + (a.monthlyFee || 0), 0);
  }, [pendingApps]);

  // Batches that have at least 1 accepted student
  const activeBatchesCount = React.useMemo(() => {
    if (analytics?.breakdown) {
      return analytics.breakdown.filter((b) => b.acceptedCount > 0).length;
    }
    const ids = new Set(acceptedApps.map((a) => a.tuitionId));
    return ids.size;
  }, [analytics, acceptedApps]);

  // Average fee per student
  const avgFeePerStudent = React.useMemo(() => {
    if (acceptedApps.length === 0) return 0;
    return Math.round(totalEarnings / acceptedApps.length);
  }, [totalEarnings, acceptedApps.length]);

  // Month-by-month calculation
  const monthlyGroups = React.useMemo(() => {
    const map = new Map<string, MonthlyGroup>();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize recent 4 months even if 0
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, {
        monthKey: key,
        monthName: `${months[d.getMonth()]} ${d.getFullYear()}`,
        year: d.getFullYear(),
        enrolledCount: 0,
        earnings: 0,
      });
    }

    acceptedApps.forEach((a) => {
      const appDate = a.appliedAt ? new Date(a.appliedAt) : now;
      const key = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, "0")}`;
      const existing = map.get(key) || {
        monthKey: key,
        monthName: `${months[appDate.getMonth()]} ${appDate.getFullYear()}`,
        year: appDate.getFullYear(),
        enrolledCount: 0,
        earnings: 0,
      };
      existing.enrolledCount += 1;
      existing.earnings += a.monthlyFee || 0;
      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [acceptedApps]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 dark:bg-[#8EE0BA]/15 text-forest dark:text-[#8EE0BA]">
              <Wallet className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-forest dark:text-[#8EE0BA]">
              Earnings & Revenue Analytics
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6]">
            Track your total tuition income, paid student enrollments, and month-by-month revenue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setPayoutModalOpen(true)}
            className="gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold cursor-pointer"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span>Request Payout</span>
          </Button>
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
          <Link href="/dashboard/tutor/post-tuition">
            <Button size="sm" className="gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Post New Batch</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-xs font-semibold text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* 4 Core StatCards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Monthly Revenue"
          value={loading ? "..." : formatFee(totalEarnings)}
          helper="Recurring monthly income from all accepted students"
          icon={Banknote}
          tone="forest"
        />
        <StatCard
          label="Active Enrolled Students"
          value={loading ? "..." : acceptedApps.length}
          helper="Students currently learning in your batches"
          icon={UserCheck}
          tone="emerald"
        />
        <StatCard
          label="Pending Fee Pipeline"
          value={loading ? "..." : formatFee(pendingEarnings)}
          helper={`${pendingApps.length} student application${pendingApps.length === 1 ? "" : "s"} awaiting review`}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Avg. Revenue Per Student"
          value={loading ? "..." : formatFee(avgFeePerStudent)}
          helper={`Across ${activeBatchesCount} earning tuition batch${activeBatchesCount === 1 ? "" : "es"}`}
          icon={TrendingUp}
          tone="clay"
        />
      </div>

      {/* Paid vs Pending Breakdown Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-forest dark:text-[#8EE0BA] flex items-center justify-between">
            <span>Payment & Enrollment Pipeline</span>
            <span className="text-xs font-normal text-muted dark:text-[#9DB3A6]">
              {acceptedApps.length + pendingApps.length} Total Applications
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Visual Revenue Comparison Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-700 dark:text-emerald-400">
                Confirmed: {formatFee(totalEarnings)} ({acceptedApps.length} students)
              </span>
              <span className="text-amber-700 dark:text-amber-400">
                Pending: {formatFee(pendingEarnings)} ({pendingApps.length} students)
              </span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-sage-bg dark:bg-[#1C2B22]">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${
                    totalEarnings + pendingEarnings > 0
                      ? Math.round(
                          (totalEarnings / (totalEarnings + pendingEarnings)) * 100
                        )
                      : 100
                  }%`,
                }}
              />
              <div
                className="bg-amber-400 transition-all duration-500"
                style={{
                  width: `${
                    totalEarnings + pendingEarnings > 0
                      ? Math.round(
                          (pendingEarnings / (totalEarnings + pendingEarnings)) * 100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmed & Paid Revenue</span>
              </div>
              <p className="mt-1 text-xl font-black text-emerald-900 dark:text-emerald-200">
                {formatFee(totalEarnings)}
                <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">
                  {" "}
                  / month
                </span>
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                From {acceptedApps.length} active accepted students
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/20 p-3.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Clock className="h-4 w-4" />
                <span>Pending Review Pipeline</span>
              </div>
              <p className="mt-1 text-xl font-black text-amber-900 dark:text-amber-200">
                {formatFee(pendingEarnings)}
                <span className="text-xs font-normal text-amber-700 dark:text-amber-400">
                  {" "}
                  potential
                </span>
              </p>
              <div className="mt-0.5 flex items-center justify-between">
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  From {pendingApps.length} applications awaiting decision
                </p>
                {pendingApps.length > 0 && (
                  <Link
                    href="/dashboard/tutor/applicants"
                    className="text-[11px] font-bold text-forest dark:text-[#8EE0BA] underline hover:no-underline"
                  >
                    Review Now &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout & Withdrawal Requests Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-forest dark:text-[#8EE0BA] flex items-center gap-2">
                <ArrowDownToLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Payout & Withdrawal Requests</span>
              </CardTitle>
              <p className="text-xs text-muted dark:text-[#9DB3A6]">
                Withdraw your earned tuition income directly to your bKash, Nagad, or Bank account.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setPayoutModalOpen(true)}
              className="gap-1.5 text-xs bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] cursor-pointer"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
              <span>Request Payout</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border p-6 text-center text-xs text-muted dark:text-[#9DB3A6]">
              No payout requests submitted yet. Click &quot;Request Payout&quot; to withdraw your confirmed earnings.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sage-border text-muted dark:text-[#9DB3A6]">
                    <th className="pb-2 font-bold">Request Date</th>
                    <th className="pb-2 font-bold">Amount</th>
                    <th className="pb-2 font-bold">Method & Account</th>
                    <th className="pb-2 font-bold">Status</th>
                    <th className="pb-2 font-bold">Admin Ref / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-border/60">
                  {payouts.map((p) => (
                    <tr key={p._id} className="hover:bg-sage-bg/30">
                      <td className="py-2.5 font-medium">{formatDate(p.requestedAt)}</td>
                      <td className="py-2.5 font-black text-forest dark:text-[#8EE0BA]">
                        {formatFee(p.amount)}
                      </td>
                      <td className="py-2.5">
                        <span className="uppercase font-bold text-[10px] bg-sage-subtle dark:bg-[#1C2B22] px-1.5 py-0.5 rounded border border-sage-border">
                          {p.paymentMethod}
                        </span>{" "}
                        <span className="font-mono text-muted">{p.accountNumber}</span>
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant={
                            p.status === "approved"
                              ? "success"
                              : p.status === "rejected"
                                ? "danger"
                                : "warning"
                          }
                          className="capitalize"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-muted">
                        {p.transactionReference || p.adminNote || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Month-by-Month Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-forest dark:text-[#8EE0BA]">
              Month-by-Month Revenue Breakdown
            </h2>
            <p className="text-xs text-muted dark:text-[#9DB3A6]">
              Historical and active monthly earnings performance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthlyGroups.map((group) => (
            <div
              key={group.monthKey}
              className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-4 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted dark:text-[#9DB3A6] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA]" />
                  {group.monthName}
                </span>
                <Badge variant={group.earnings > 0 ? "success" : "default"}>
                  {group.enrolledCount} enrolled
                </Badge>
              </div>
              <div className="pt-1">
                <span className="text-xl font-black text-forest dark:text-[#8EE0BA]">
                  {formatFee(group.earnings)}
                </span>
                <span className="text-[11px] text-muted dark:text-[#9DB3A6]">
                  {" "}
                  earned
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings per Tuition Batch Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                Revenue by Tuition Batch
              </CardTitle>
              <p className="text-xs text-muted dark:text-[#9DB3A6]">
                Breakdown of enrolled students and recurring income for each batch.
              </p>
            </div>
            <Link href="/dashboard/tutor/my-tuitions">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Manage Tuitions</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : tuitions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border p-8 text-center text-xs text-muted">
              You haven&apos;t posted any tuitions yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sage-border text-muted dark:text-[#9DB3A6]">
                    <th className="pb-2.5 font-bold">Tuition Batch</th>
                    <th className="pb-2.5 font-bold">Subject & Mode</th>
                    <th className="pb-2.5 font-bold">Fee / Student</th>
                    <th className="pb-2.5 font-bold">Enrolled</th>
                    <th className="pb-2.5 font-bold">Monthly Revenue</th>
                    <th className="pb-2.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-border/60">
                  {tuitions.map((t) => {
                    const batchEnrolled = acceptedApps.filter(
                      (a) => a.tuitionId === t._id
                    ).length;
                    const batchEarnings = batchEnrolled * (t.monthlyFee || 0);

                    return (
                      <tr key={t._id} className="hover:bg-sage-bg/30 dark:hover:bg-[#1C2B22]/30">
                        <td className="py-3 font-bold text-ink dark:text-[#EFF5F0] max-w-56 truncate">
                          <Link
                            href={`/tuitions/${t._id}`}
                            className="hover:text-forest dark:hover:text-[#8EE0BA] underline hover:no-underline"
                          >
                            {t.title}
                          </Link>
                        </td>
                        <td className="py-3 text-muted dark:text-[#9DB3A6]">
                          {t.subject} &bull; <span className="capitalize">{t.mode}</span>
                        </td>
                        <td className="py-3 font-semibold text-ink dark:text-[#EFF5F0]">
                          {formatFee(t.monthlyFee)}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 dark:bg-[#8EE0BA]/15 px-2 py-0.5 text-[11px] font-bold text-forest dark:text-[#8EE0BA]">
                            <UserCheck className="h-3 w-3" />
                            {batchEnrolled}
                          </span>
                        </td>
                        <td className="py-3 font-black text-forest dark:text-[#8EE0BA]">
                          {formatFee(batchEarnings)}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              t.approvalStatus === "approved"
                                ? "success"
                                : t.approvalStatus === "pending"
                                  ? "warning"
                                  : "default"
                            }
                          >
                            {t.approvalStatus}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Students Payment Ledger */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                Active Enrolled Students Ledger
              </CardTitle>
              <p className="text-xs text-muted dark:text-[#9DB3A6]">
                List of accepted students currently contributing to your monthly income.
              </p>
            </div>
            <Link href="/dashboard/tutor/applicants">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Users className="h-3.5 w-3.5" />
                <span>All Applicants</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : acceptedApps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border p-8 text-center text-xs text-muted">
              No accepted students yet. Accept pending applications to build your income stream.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sage-border text-muted dark:text-[#9DB3A6]">
                    <th className="pb-2.5 font-bold">Student</th>
                    <th className="pb-2.5 font-bold">Tuition Batch</th>
                    <th className="pb-2.5 font-bold">Monthly Fee</th>
                    <th className="pb-2.5 font-bold">Enrolled Schedule / Slot</th>
                    <th className="pb-2.5 font-bold">Classes Done</th>
                    <th className="pb-2.5 font-bold">Status</th>
                    <th className="pb-2.5 font-bold">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-border/60">
                  {acceptedApps.map((app) => (
                    <tr
                      key={app._id}
                      className="hover:bg-sage-bg/30 dark:hover:bg-[#1C2B22]/30"
                    >
                      <td className="py-3">
                        <div className="font-bold text-ink dark:text-[#EFF5F0]">
                          {app.studentName}
                        </div>
                        <div className="text-[11px] text-muted dark:text-[#9DB3A6]">
                          {app.studentEmail}
                        </div>
                      </td>
                      <td className="py-3 text-muted dark:text-[#9DB3A6] max-w-48 truncate">
                        {app.tuitionTitle}
                      </td>
                      <td className="py-3 font-bold text-forest dark:text-[#8EE0BA]">
                        {formatFee(app.monthlyFee)}
                      </td>
                      <td className="py-3 text-muted dark:text-[#9DB3A6]">
                        {app.selectedSlots && app.selectedSlots.length > 0
                          ? app.selectedSlots.join(", ")
                          : app.preferredSchedule || "Standard Schedule"}
                      </td>
                      <td className="py-3">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300">
                            {app.completedClasses || 0} done
                          </span>
                          <button
                            type="button"
                            disabled={markingAttendanceId === app._id}
                            onClick={() => void handleMarkAttendance(app._id, "increment")}
                            className="inline-flex items-center gap-1 font-black text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
                            title="Click Done after class completes to increment count"
                          >
                            {markingAttendanceId === app._id ? (
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            ) : (
                              "+1 Done"
                            )}
                          </button>
                          {(app.completedClasses || 0) > 0 && (
                            <button
                              type="button"
                              disabled={markingAttendanceId === app._id}
                              onClick={() => void handleMarkAttendance(app._id, "decrement")}
                              className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200 dark:bg-amber-950/60 rounded px-1.5 py-0.5 text-[10px] cursor-pointer transition-colors"
                              title="ভুল হলে আন্ডু করুন (Undo last class)"
                            >
                              <RotateCcw className="h-2.5 w-2.5" />
                              <span>Undo</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="success">Enrolled & Active</Badge>
                      </td>
                      <td className="py-3">
                        {app.studentPhone ? (
                          <a
                            href={formatWhatsAppUrl(app.studentPhone, app.studentName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors"
                          >
                            <MessageCircle className="h-3 w-3 fill-white" />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-muted">No phone</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Payout Modal */}
      {payoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-sage-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <ArrowDownToLine className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                  Request Earnings Payout
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPayoutModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-sage-subtle hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              {/* Confirmed Balance Highlight */}
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                    Confirmed Earnings
                  </span>
                  <div className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                    {formatFee(totalEarnings)}
                  </div>
                </div>
                <Badge variant="success">Available for Payout</Badge>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-ink dark:text-[#EFF5F0]">
                  Withdrawal Amount (BDT)
                </label>
                <input
                  type="number"
                  min={100}
                  max={totalEarnings > 0 ? totalEarnings : undefined}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 2000"
                  required
                  className="w-full rounded-xl border border-sage-border bg-white dark:bg-[#1C2B22] px-3 py-2 text-xs text-ink dark:text-[#EFF5F0] focus:outline-hidden focus:ring-2 focus:ring-forest/30"
                />
                <div className="flex items-center gap-1.5 pt-1">
                  {[500, 1000, 2000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPayoutAmount(String(preset))}
                      className="rounded-md border border-sage-border/80 bg-sage-bg dark:bg-[#1C2B22] px-2 py-0.5 text-[10px] font-semibold text-forest dark:text-[#8EE0BA] hover:bg-forest/10 cursor-pointer"
                    >
                      ৳{preset}
                    </button>
                  ))}
                  {totalEarnings > 0 && (
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(String(totalEarnings))}
                      className="rounded-md border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
                    >
                      Full Amount (৳{totalEarnings})
                    </button>
                  )}
                </div>
              </div>

              {/* Method Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-ink dark:text-[#EFF5F0]">
                  Payout Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("bkash")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                      payoutMethod === "bkash"
                        ? "border-[#E2136E] bg-[#E2136E]/10 text-[#E2136E] font-bold ring-1 ring-[#E2136E]"
                        : "border-sage-border bg-white dark:bg-[#1C2B22] text-muted hover:text-ink"
                    }`}
                  >
                    <Smartphone className="h-4 w-4 mb-1" />
                    <span>bKash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod("nagad")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                      payoutMethod === "nagad"
                        ? "border-[#F7941D] bg-[#F7941D]/10 text-[#F7941D] font-bold ring-1 ring-[#F7941D]"
                        : "border-sage-border bg-white dark:bg-[#1C2B22] text-muted hover:text-ink"
                    }`}
                  >
                    <Smartphone className="h-4 w-4 mb-1" />
                    <span>Nagad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod("bank")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                      payoutMethod === "bank"
                        ? "border-forest dark:border-[#8EE0BA] bg-forest/10 dark:bg-[#8EE0BA]/15 text-forest dark:text-[#8EE0BA] font-bold ring-1 ring-forest/30"
                        : "border-sage-border bg-white dark:bg-[#1C2B22] text-muted hover:text-ink"
                    }`}
                  >
                    <Building className="h-4 w-4 mb-1" />
                    <span>Bank</span>
                  </button>
                </div>
              </div>

              {/* Account Number Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-ink dark:text-[#EFF5F0]">
                  {payoutMethod === "bank"
                    ? "Bank Account Details (Bank Name, A/C No, Branch)"
                    : `${payoutMethod === "bkash" ? "bKash" : "Nagad"} Personal Number`}
                </label>
                <input
                  type="text"
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  placeholder={
                    payoutMethod === "bank"
                      ? "e.g. DBBL, A/C: 123456789, Dhanmondi Branch"
                      : "e.g. 017XXXXXXXX"
                  }
                  required
                  className="w-full rounded-xl border border-sage-border bg-white dark:bg-[#1C2B22] px-3 py-2 text-xs text-ink dark:text-[#EFF5F0] focus:outline-hidden focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sage-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPayoutModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingPayout}
                  className="gap-1.5 bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F]"
                >
                  {submittingPayout ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>Submit Payout Request</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
