"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  CheckCircle2,
  Crown,
  Eye,
  PlusCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Application, Tuition } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatFee } from "@/lib/utils";
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
  conversionRate: number;
}

interface TutorAnalyticsData {
  totals: {
    totalListings: number;
    totalViews: number;
    totalApplicants: number;
    totalAccepted: number;
    overallConversionRate: number;
  };
  breakdown: AnalyticsBreakdown[];
}

export default function TutorOverviewPage() {
  const { data: session } = useSession();
  const [tuitions, setTuitions] = React.useState<Tuition[]>([]);
  const [applicants, setApplicants] = React.useState<Application[]>([]);
  const [analytics, setAnalytics] = React.useState<TutorAnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const user = session?.user as { plan?: string } | undefined;
  const currentPlan = user?.plan === "pro" ? "Pro" : "Free";

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [tuitionRes, applicantRes, analyticsRes] = await Promise.all([
          apiFetch<unknown>("/api/tuitions/my-tuitions"),
          apiFetch<unknown>("/api/applications/tutor"),
          apiFetch<TutorAnalyticsData>("/api/tuitions/tutor/analytics").catch(
            () => null
          ),
        ]);
        if (active) {
          setTuitions(extractList<Tuition>(tuitionRes, "tuitions"));
          setApplicants(extractList<Application>(applicantRes, "applications"));
          if (analyticsRes) setAnalytics(analyticsRes);
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError(
              "Backend JWT token is required to load tutor data. Once POST /api/auth/jwt is live on the server, sign in again to sync."
            );
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Could not load tutor overview data."
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

  const totalPosted = tuitions.length;
  const activeApproved = tuitions.filter(
    (t) => t.approvalStatus === "approved" && t.isActive
  ).length;
  const totalApplicants = applicants.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
            Tutor Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your tuition listings, monitor approval status, and review
            student applications.
          </p>
        </div>
        <Link href="/dashboard/tutor/post-tuition">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Post a Tuition
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total Tuitions"
            value={totalPosted}
            helper={
              currentPlan === "Free"
                ? `${Math.max(0, 2 - totalPosted)} free posts left`
                : "Unlimited Pro posts"
            }
            icon={BookOpen}
            tone="forest"
          />
          <StatCard
            label="Active & Live"
            value={activeApproved}
            helper="Approved on platform"
            icon={CheckCircle2}
            tone="emerald"
          />
          <StatCard
            label="Total Applicants"
            value={totalApplicants}
            helper={`${
              applicants.filter((a) => a.status === "pending").length
            } pending review`}
            icon={Users}
            tone="amber"
          />
          <StatCard
            label="Listing Views"
            value={analytics?.totals?.totalViews ?? 0}
            helper="All-time impressions"
            icon={Eye}
            tone="clay"
          />
          <StatCard
            label="Apply Rate"
            value={`${analytics?.totals?.overallConversionRate ?? 0}%`}
            helper={`${analytics?.totals?.totalAccepted ?? 0} students accepted`}
            icon={TrendingUp}
            tone="emerald"
          />
          <StatCard
            label="Current Plan"
            value={currentPlan}
            helper={
              currentPlan === "Pro"
                ? "Unlimited tuition listings"
                : "Free limit: up to 2 posts"
            }
            icon={Crown}
            tone="clay"
          />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {/* Listing Views & Application Analytics Breakdown */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA]">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Tuition Analytics & Impressions</CardTitle>
              <p className="text-xs text-muted dark:text-[#9DB3A6] mt-0.5">
                Real-time tracking of student views, applications received, and conversion rates for each listing.
              </p>
            </div>
          </div>
          {analytics && (
            <div className="flex items-center gap-2">
              <Badge variant="sage" className="text-xs">
                {analytics.totals.totalViews} total views
              </Badge>
              <Badge variant="success" className="text-xs">
                {analytics.totals.overallConversionRate}% conversion
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : !analytics || analytics.breakdown.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/40 dark:bg-[#141F18] p-8 text-center">
              <BarChart2 className="mx-auto h-9 w-9 text-muted/40 mb-2" />
              <p className="text-sm font-semibold text-forest dark:text-[#8EE0BA]">
                No listing analytics yet
              </p>
              <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6] max-w-md mx-auto">
                Once you post tuitions and students browse them, your view counts, student inquiries, and conversion metrics will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sage-border text-xs font-semibold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    <th className="pb-3 pr-4">Tuition Listing</th>
                    <th className="pb-3 px-4">Subject & Fee</th>
                    <th className="pb-3 px-4 text-center">Views</th>
                    <th className="pb-3 px-4 text-center">Applicants</th>
                    <th className="pb-3 px-4 text-center">Accepted</th>
                    <th className="pb-3 px-4 text-center">Conversion</th>
                    <th className="pb-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-border">
                  {analytics.breakdown.map((row) => (
                    <tr
                      key={row.tuitionId}
                      className="hover:bg-sage-bg/30 dark:hover:bg-[#1C2B22]/30 transition-colors"
                    >
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-forest dark:text-[#8EE0BA] line-clamp-1">
                          {row.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant={
                              row.approvalStatus === "approved"
                                ? "success"
                                : row.approvalStatus === "rejected"
                                  ? "danger"
                                  : "warning"
                            }
                            className="text-[10px] uppercase font-bold py-0"
                          >
                            {row.approvalStatus}
                          </Badge>
                          <span className="text-xs text-muted dark:text-[#9DB3A6]">
                            {row.mode}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-medium text-ink dark:text-[#EFF5F0] block">
                          {row.subject}
                        </span>
                        <span className="font-bold text-clay mt-0.5 block">
                          {formatFee(row.monthlyFee)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-md bg-sage-bg dark:bg-[#1C2B22] px-2 py-1 text-xs font-bold text-forest dark:text-[#8EE0BA]">
                          <Eye className="h-3.5 w-3.5 text-muted" />
                          {row.views}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                          <Users className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          {row.applicantsCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          {row.acceptedCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            row.conversionRate > 20
                              ? "success"
                              : row.conversionRate > 0
                                ? "clay"
                                : "outline"
                          }
                          className="text-xs font-semibold"
                        >
                          {row.conversionRate}%
                        </Badge>
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <Link href={`/tuitions/${row.tuitionId}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                          >
                            View
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tuitions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Your Recent Tuitions</CardTitle>
            <Link href="/dashboard/tutor/my-tuitions">
              <Button variant="ghost" size="sm">
                Manage All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : tuitions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 p-7 text-center">
                <p className="text-sm font-semibold text-forest">
                  No tuition posts yet
                </p>
                <p className="mt-1 text-xs text-muted">
                  Create your first tuition batch to start receiving student
                  applications.
                </p>
                <Link
                  href="/dashboard/tutor/post-tuition"
                  className="mt-4 inline-block"
                >
                  <Button size="sm">Post a Tuition</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-sage-border">
                {tuitions.slice(0, 4).map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-forest">
                        {t.title}
                      </p>
                      <p className="text-xs text-muted">
                        {t.subject} &bull; {t.mode} &bull;{" "}
                        {formatFee(t.monthlyFee)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        t.approvalStatus === "approved"
                          ? "success"
                          : t.approvalStatus === "rejected"
                            ? "danger"
                            : "warning"
                      }
                      className="capitalize shrink-0"
                    >
                      {t.approvalStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applicants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Recent Applicants</CardTitle>
            <Link href="/dashboard/tutor/applicants">
              <Button variant="ghost" size="sm">
                Review All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : applicants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 p-7 text-center">
                <p className="text-sm font-semibold text-forest">
                  No student applications yet
                </p>
                <p className="mt-1 text-xs text-muted">
                  Once your tuition listings are approved, incoming student
                  requests will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-sage-border">
                {applicants.slice(0, 4).map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-forest">
                        {app.studentName}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {app.tuitionTitle} &bull; {app.studentPhone}
                      </p>
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
