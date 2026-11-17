"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crown,
} from "lucide-react";
import type { Application } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate, formatFee } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentOverviewPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const user = session?.user as { name?: string; plan?: string } | undefined;
  const currentPlan = user?.plan === "pro" ? "Pro" : "Free";

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch<unknown>("/api/applications/my-applications");
        const list = extractList<Application>(res, "applications");
        if (active) setApplications(list);
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError(
              "Backend JWT token is required to load your applications. Once POST /api/auth/jwt is live on the server, sign in again to sync."
            );
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Could not load application statistics."
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

  const totalApplied = applications.length;
  const acceptedCount = applications.filter((a) => a.status === "accepted").length;
  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
            Student Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track your tuition applications, acceptance status, and plan details.
          </p>
        </div>
        <Link href="/tuitions">
          <Button>
            <BookOpen className="h-4 w-4" />
            Browse Tuitions
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Applied Tuitions"
            value={totalApplied}
            helper="All submitted applications"
            icon={ClipboardList}
            tone="forest"
          />
          <StatCard
            label="Accepted Applications"
            value={acceptedCount}
            helper="Approved by tutors"
            icon={CheckCircle2}
            tone="emerald"
          />
          <StatCard
            label="Pending Applications"
            value={pendingCount}
            helper="Awaiting tutor response"
            icon={Clock}
            tone="amber"
          />
          <StatCard
            label="Current Plan"
            value={currentPlan}
            helper={
              currentPlan === "Pro"
                ? "Priority booking enabled"
                : "Upgrade for priority booking"
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

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Recent Applications</CardTitle>
          <Link href="/dashboard/student/my-applications">
            <Button variant="ghost" size="sm">
              View All
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
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 p-8 text-center">
              <p className="text-sm font-semibold text-forest">
                You haven&apos;t applied to any tuitions yet.
              </p>
              <p className="mt-1 text-xs text-muted">
                Browse approved tuitions and submit your first application.
              </p>
              <Link href="/tuitions" className="mt-4 inline-block">
                <Button size="sm">Explore Tuitions</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-sage-border">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app._id}
                  className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-forest">
                      {app.tuitionTitle}
                    </p>
                    <p className="text-xs text-muted">
                      {app.subject} &bull; {app.tutorEmail} &bull; Applied{" "}
                      {formatDate(app.appliedAt || app.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-clay">
                      {formatFee(app.monthlyFee)}
                    </span>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
