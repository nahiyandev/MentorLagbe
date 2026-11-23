"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Crown,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Star,
} from "lucide-react";
import type { StudentProfileData } from "@/types";
import { apiFetch } from "@/lib/api";
import { formatDate, getInitials, isValidImageUrl } from "@/lib/utils";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function fullyDecode(str: string): string {
  let decoded = str || "";
  try {
    while (decoded.includes("%")) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    // Safe fallback
  }
  return decoded.trim();
}

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = React.useState<StudentProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const rawId = params?.id || "";
  const identifier = React.useMemo(() => fullyDecode(rawId), [rawId]);

  React.useEffect(() => {
    if (!identifier) return;
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const res = await apiFetch<StudentProfileData>(
          `/api/profile/student/${encodeURIComponent(identifier)}`
        );
        if (active) {
          setData(res);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Student profile could not be loaded."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [identifier]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/tuitions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-[#8EE0BA] hover:text-clay transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Tuitions</span>
        </Link>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : error || !data ? (
          <div className="rounded-3xl border border-dashed border-sage-border bg-white dark:bg-[#141F18] p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted/40 mb-3" />
            <h2 className="text-xl font-bold text-forest dark:text-[#8EE0BA]">
              Student Not Found
            </h2>
            <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
              {error || "The requested student profile could not be loaded."}
            </p>
            <Link href="/tuitions" className="mt-5 inline-block">
              <Button>Browse Available Tuitions</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Student Header Card */}
            <div className="relative overflow-hidden rounded-3xl border border-sage-border bg-white dark:bg-[#141F18] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {isValidImageUrl(data.student.image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.student.image!}
                      alt={data.student.name}
                      className="h-24 w-24 rounded-2xl object-cover ring-4 ring-sage-border shadow-md"
                    />
                  ) : (
                    <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-forest dark:bg-[#8EE0BA] text-3xl font-black text-white dark:text-[#0C130F] ring-4 ring-sage-border shadow-md">
                      {getInitials(data.student.name)}
                    </span>
                  )}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black text-forest dark:text-[#8EE0BA]">
                        {data.student.name}
                      </h1>
                      <Badge variant="sage" className="capitalize text-xs font-bold">
                        Student
                      </Badge>
                      {data.student.plan === "pro" ? (
                        <Badge variant="clay" className="gap-1 text-xs font-bold">
                          <Crown className="h-3 w-3" /> Pro Student
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs font-bold capitalize">
                          Free Plan
                        </Badge>
                      )}
                    </div>

                    <p className="max-w-2xl text-sm leading-relaxed text-muted dark:text-[#9DB3A6]">
                      {data.student.bio}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted dark:text-[#9DB3A6]">
                      {data.student.createdAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted" />
                          Member since {formatDate(data.student.createdAt)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                        <Sparkles className="h-3.5 w-3.5" />
                        Verified Member
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Ribbon */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-sage-border pt-6 sm:grid-cols-4">
                <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Applications
                  </p>
                  <p className="mt-1 text-2xl font-black text-forest dark:text-[#8EE0BA]">
                    {data.stats.applicationsTotal}
                  </p>
                  <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
                    Total submitted
                  </p>
                </div>

                <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Accepted
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {data.stats.applicationsAccepted}
                  </p>
                  <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
                    Confirmed by tutors
                  </p>
                </div>

                <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Reviews Given
                  </p>
                  <p className="mt-1 text-2xl font-black text-forest dark:text-[#8EE0BA]">
                    {data.stats.reviewsGiven}
                  </p>
                  <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
                    Feedback shared
                  </p>
                </div>

                <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Average Rating
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-2xl font-black text-forest dark:text-[#8EE0BA]">
                      {data.stats.averageRating > 0
                        ? data.stats.averageRating.toFixed(1)
                        : "—"}
                    </span>
                    {data.stats.averageRating > 0 && (
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
                    Given across tuitions
                  </p>
                </div>
              </div>
            </div>

            {/* Student Reviews Given Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-forest dark:text-[#8EE0BA]" />
                <h2 className="text-xl font-bold text-forest dark:text-[#8EE0BA]">
                  Reviews &amp; Feedback Given
                </h2>
                <Badge variant="outline" className="text-xs">
                  {data.reviews.length}
                </Badge>
              </div>

              {data.reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-sage-border bg-white dark:bg-[#141F18] p-8 text-center">
                  <p className="text-sm text-muted dark:text-[#9DB3A6]">
                    No reviews submitted yet by this student.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {data.reviews.map((rev, idx) => (
                    <Card
                      key={idx}
                      className="border-sage-border bg-white dark:bg-[#141F18] shadow-2xs"
                    >
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/tuitions/${rev.tuitionId}`}
                              className="font-bold text-sm text-forest dark:text-[#8EE0BA] hover:underline line-clamp-1"
                            >
                              {rev.tuitionTitle}
                            </Link>
                            <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
                              {formatDate(rev.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>

                        <p className="text-xs text-ink/80 dark:text-[#EFF5F0]/80 leading-relaxed italic bg-sage-subtle/30 dark:bg-[#1C2B22]/30 p-3 rounded-xl border border-sage-border/60">
                          &ldquo;{rev.feedback}&rdquo;
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SiteShell>
  );
}
