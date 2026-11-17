"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  DollarSign,
  FileCheck2,
  GraduationCap,
  Receipt,
  Users,
} from "lucide-react";
import type { AdminStats } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  totalTutors: 0,
  pendingTuitions: 0,
  approvedTuitions: 0,
  totalRevenue: 0,
};

export default function AdminOverviewPage() {
  const [stats, setStats] = React.useState<AdminStats>(EMPTY_STATS);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch<AdminStats | { data?: AdminStats }>(
          "/api/admin/stats"
        );
        const parsed =
          res && typeof res === "object" && "totalUsers" in res
            ? (res as AdminStats)
            : (res as { data?: AdminStats })?.data || EMPTY_STATS;
        if (active) setStats(parsed);
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError(
              "Backend JWT token is missing or expired. Once POST /api/auth/jwt is live on the server, sign in again to load admin analytics."
            );
          } else if (err instanceof ApiError && err.status === 403) {
            setError("Admin privileges are required to view these statistics.");
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Could not load platform statistics."
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
          Admin Overview
        </h1>
        <p className="mt-1 text-sm text-muted">
          Monitor platform growth, moderate tutor listings, manage user roles,
          and track Stripe revenue.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value={stats.totalUsers}
            helper="Registered accounts"
            icon={Users}
            tone="forest"
          />
          <StatCard
            label="Total Tutors"
            value={stats.totalTutors}
            helper="Educators on platform"
            icon={GraduationCap}
            tone="emerald"
          />
          <StatCard
            label="Pending / Approved"
            value={`${stats.pendingTuitions} / ${stats.approvedTuitions}`}
            helper="Pending vs. approved tuitions"
            icon={FileCheck2}
            tone="amber"
          />
          <StatCard
            label="Total Stripe Revenue"
            value={`$${Number(stats.totalRevenue || 0).toLocaleString("en-US")}`}
            helper="Verified Pro plan payments"
            icon={DollarSign}
            tone="clay"
          />
        </div>
      )}

      {/* Quick Admin Actions */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="h-full">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-subtle text-forest">
                <Users className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-forest">
                User Management
              </h2>
              <p className="mt-1 text-sm text-muted">
                View all registered users and update roles between Student,
                Tutor, and Admin.
              </p>
            </div>
            <Link href="/dashboard/admin/users" className="mt-5 inline-block">
              <Button variant="outline" size="sm">
                Manage Users
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <FileCheck2 className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-forest">
                Tuition Approvals
              </h2>
              <p className="mt-1 text-sm text-muted">
                Review tutor-submitted listings and approve or reject posts
                before they go public.
              </p>
            </div>
            <Link
              href="/dashboard/admin/tuitions"
              className="mt-5 inline-block"
            >
              <Button variant="outline" size="sm">
                Moderate Tuitions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-soft text-clay">
                <Receipt className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-forest">
                Stripe Transactions
              </h2>
              <p className="mt-1 text-sm text-muted">
                Inspect all Pro Student and Pro Tutor checkout transactions and
                revenue history.
              </p>
            </div>
            <Link
              href="/dashboard/admin/transactions"
              className="mt-5 inline-block"
            >
              <Button variant="outline" size="sm">
                View Transactions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
