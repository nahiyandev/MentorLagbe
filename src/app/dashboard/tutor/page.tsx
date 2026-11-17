"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Crown,
  PlusCircle,
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

export default function TutorOverviewPage() {
  const { data: session } = useSession();
  const [tuitions, setTuitions] = React.useState<Tuition[]>([]);
  const [applicants, setApplicants] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const user = session?.user as { plan?: string } | undefined;
  const currentPlan = user?.plan === "pro" ? "Pro" : "Free";

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [tuitionRes, applicantRes] = await Promise.all([
          apiFetch<unknown>("/api/tuitions/my-tuitions"),
          apiFetch<unknown>("/api/applications/tutor"),
        ]);
        if (active) {
          setTuitions(extractList<Tuition>(tuitionRes, "tuitions"));
          setApplicants(extractList<Application>(applicantRes, "applications"));
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Tuitions Posted"
            value={totalPosted}
            helper={
              currentPlan === "Free"
                ? `${Math.max(0, 2 - totalPosted)} free posts remaining`
                : "Unlimited Pro posts"
            }
            icon={BookOpen}
            tone="forest"
          />
          <StatCard
            label="Active / Approved"
            value={activeApproved}
            helper="Visible on Browse Tuitions"
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
