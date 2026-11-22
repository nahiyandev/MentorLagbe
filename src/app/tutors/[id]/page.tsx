"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Crown,
  GraduationCap,
  Mail,
  MessageCircle,
  Phone,
  Star,
  Zap,
} from "lucide-react";
import type { TutorProfileData } from "@/types";
import { apiFetch } from "@/lib/api";
import {
  formatDate,
  formatWhatsAppUrl,
  getInitials,
  isValidImageUrl,
} from "@/lib/utils";
import { SiteShell } from "@/components/layout/site-shell";
import { TuitionCard } from "@/components/tuitions/tuition-card";
import { ReviewList } from "@/components/reviews/review-list";
import { TutorAvailabilityCalendar } from "@/components/tutors/tutor-availability-calendar";
import { VerifiedBadge } from "@/components/tutors/verified-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function TutorProfilePage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = React.useState<TutorProfileData | null>(null);
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
        const res = await apiFetch<TutorProfileData>(
          `/api/profile/tutor/${encodeURIComponent(identifier)}`
        );
        if (active) {
          setData(res);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Tutor profile could not be loaded."
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          </div>
        ) : error || !data ? (
          <div className="rounded-3xl border border-dashed border-sage-border bg-white dark:bg-[#141F18] p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted/40 mb-3" />
            <h2 className="text-xl font-bold text-forest dark:text-[#8EE0BA]">
              Tutor Not Found
            </h2>
            <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
              {error || "The requested tutor profile is unavailable or has no active listings."}
            </p>
            <Link href="/tuitions" className="mt-5 inline-block">
              <Button>Browse Available Tuitions</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Tutor Header Card */}
            <div className="relative overflow-hidden rounded-3xl border border-sage-border bg-white dark:bg-[#141F18] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {isValidImageUrl(data.tutor.image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.tutor.image!}
                      alt={data.tutor.name}
                      className="h-24 w-24 rounded-2xl object-cover ring-4 ring-sage-border shadow-md"
                    />
                  ) : (
                    <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-forest dark:bg-[#8EE0BA] text-3xl font-black text-white dark:text-[#0C130F] ring-4 ring-sage-border shadow-md">
                      {getInitials(data.tutor.name)}
                    </span>
                  )}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black text-forest dark:text-[#8EE0BA]">
                        {data.tutor.name}
                      </h1>
                      <VerifiedBadge size="md" />
                      {data.tutor.plan === "pro" && (
                        <Badge variant="clay" className="gap-1">
                          <Crown className="h-3 w-3" /> Pro Educator
                        </Badge>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs">
                        <Zap className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500 shrink-0" />
                        <span>Fast Responder &bull; ~1 hr response time</span>
                      </span>
                    </div>

                    <p className="max-w-2xl text-sm leading-relaxed text-muted dark:text-[#9DB3A6]">
                      {data.tutor.bio}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted dark:text-[#9DB3A6]">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA]" />
                        {data.tutor.email}
                      </span>
                      {data.tutor.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-clay" />
                          {data.tutor.phone}
                        </span>
                      )}
                      {data.tutor.createdAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted" />
                          Member since {formatDate(data.tutor.createdAt)}
                        </span>
                      )}
                    </div>

                    {data.tutor.phone && (
                      <div className="pt-2">
                        <a
                          href={formatWhatsAppUrl(data.tutor.phone, data.tutor.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <MessageCircle className="h-4 w-4 fill-white" />
                          <span>Direct Message on WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Ribbon */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-sage-border pt-6 sm:grid-cols-4">
                <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Active Batches
                  </p>
                  <p className="mt-1 text-2xl font-black text-forest dark:text-[#8EE0BA]">
                    {data.stats.totalBatches}
                  </p>
                  <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
                    Approved &amp; open
                  </p>
                </div>

                <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Subjects
                  </p>
                  <p className="mt-1 text-2xl font-black text-clay">
                    {data.stats.subjects.length}
                  </p>
                  <p className="truncate text-[11px] text-muted dark:text-[#9DB3A6]">
                    {data.stats.subjects.slice(0, 2).join(", ")}
                    {data.stats.subjects.length > 2 ? "..." : ""}
                  </p>
                </div>

                <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Average Rating
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-2xl font-black text-forest dark:text-[#8EE0BA]">
                      {data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : "N/A"}
                    </span>
                    {data.stats.averageRating > 0 && (
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
                    Student evaluated
                  </p>
                </div>

                <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Total Reviews
                  </p>
                  <p className="mt-1 text-2xl font-black text-forest dark:text-[#8EE0BA]">
                    {data.stats.totalReviews}
                  </p>
                  <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
                    Accepted student reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Weekly Availability Calendar */}
            <TutorAvailabilityCalendar
              availability={data.tutor.availability}
              tutorName={data.tutor.name}
            />

            {/* Active Tuitions Section */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-forest dark:text-[#8EE0BA]">
                    Tuition Batches by {data.tutor.name}
                  </h2>
                  <p className="text-xs text-muted dark:text-[#9DB3A6]">
                    Browse and apply directly to scheduled batches
                  </p>
                </div>
                <Badge variant="sage">{data.tuitions.length} Batches</Badge>
              </div>

              {data.tuitions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-sage-border bg-white dark:bg-[#141F18] p-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted/40 mb-2" />
                  <p className="text-sm font-semibold text-forest dark:text-[#8EE0BA]">
                    No active tuitions currently available
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {data.tuitions.map((t) => (
                    <TuitionCard key={t._id} tuition={t} />
                  ))}
                </div>
              )}
            </div>

            {/* Student Reviews Section */}
            <div className="space-y-5 border-t border-sage-border pt-8">
              <div>
                <h2 className="text-xl font-black text-forest dark:text-[#8EE0BA]">
                  Student Feedback &amp; Ratings
                </h2>
                <p className="text-xs text-muted dark:text-[#9DB3A6]">
                  Genuine experiences from students accepted into batches
                </p>
              </div>

              <ReviewList
                reviews={data.reviews}
                averageRating={data.stats.averageRating}
                totalReviews={data.stats.totalReviews}
              />
            </div>
          </>
        )}
      </div>
    </SiteShell>
  );
}
