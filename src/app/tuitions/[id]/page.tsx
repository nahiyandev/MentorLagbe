"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Flag,
  GraduationCap,
  Info,
  Mail,
  MapPin,
  Monitor,
  ShieldCheck,
  Star,
  User,
  Users,
  MessageCircle,
  Zap,
} from "lucide-react";
import type { Review, Tuition } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  cn,
  formatDate,
  formatFee,
  formatWhatsAppUrl,
  getInitials,
  isValidImageUrl,
  normalizeRole,
} from "@/lib/utils";
import { SiteShell } from "@/components/layout/site-shell";
import { useBookmarks } from "@/context/bookmark-context";
import { ApplyModal } from "@/components/tuitions/apply-modal";
import { TuitionChatDialog } from "@/components/chat/tuition-chat-dialog";
import { ReportListingDialog } from "@/components/tuitions/report-listing-dialog";
import { VerifiedBadge } from "@/components/tutors/verified-badge";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { ReviewList } from "@/components/reviews/review-list";
import { TutorAvailabilityCalendar } from "@/components/tutors/tutor-availability-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { data: session, isPending: sessionLoading } = useSession();

  const [tuition, setTuition] = React.useState<Tuition | null>(null);
  const [loadedId, setLoadedId] = React.useState<string | null>(null);
  const [notFoundError, setNotFoundError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [applyOpen, setApplyOpen] = React.useState(false);
  const [applied, setApplied] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);

  // Bookmarks state
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = tuition ? isBookmarked(tuition._id) : false;
  const [bookmarkLoading, setBookmarkLoading] = React.useState(false);

  const handleToggleBookmark = async () => {
    if (!tuition || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      await toggleBookmark(tuition._id);
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Reviews state
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [averageRating, setAverageRating] = React.useState(0);
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [canReview, setCanReview] = React.useState(false);
  const [existingReview, setExistingReview] = React.useState<Review | null>(null);
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const loading = loadedId !== id;

  const user = session?.user as
    | {
        name?: string;
        email?: string;
        role?: string;
        phone?: string;
      }
    | undefined;
  const role = user ? normalizeRole(user.role) : null;

  React.useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await apiFetch<Tuition | { tuition?: Tuition; data?: Tuition }>(
          `/api/tuitions/${encodeURIComponent(id)}`
        );
        const item =
          res && typeof res === "object" && "_id" in res
            ? (res as Tuition)
            : (res as { tuition?: Tuition; data?: Tuition })?.tuition ||
              (res as { tuition?: Tuition; data?: Tuition })?.data ||
              null;

        if (active) {
          if (!item) {
            setTuition(null);
            setNotFoundError(true);
            setErrorMessage(null);
          } else {
            setTuition(item);
            setNotFoundError(false);
            setErrorMessage(null);
          }
        }

        // Concurrently fetch reviews
        try {
          const revRes = await apiFetch<{
            reviews?: Review[];
            averageRating?: number;
            totalReviews?: number;
          }>(`/api/reviews/tuition/${encodeURIComponent(id)}`);
          if (active && revRes?.reviews) {
            setReviews(revRes.reviews);
            setAverageRating(revRes.averageRating || 0);
            setTotalReviews(revRes.totalReviews || 0);
          }
        } catch {
          // non-blocking
        }

        // Concurrently check review eligibility
        if (session?.user?.email && role === "student") {
          try {
            const eligRes = await apiFetch<{
              canReview?: boolean;
              existingReview?: Review | null;
            }>(`/api/reviews/can-review/${encodeURIComponent(id)}`);
            if (active) {
              setCanReview(!!eligRes?.canReview);
              setExistingReview(eligRes?.existingReview || null);
            }
          } catch {
            if (active) setCanReview(false);
          }
        }
      } catch (err) {
        if (active) {
          setTuition(null);
          if (err instanceof ApiError && err.status === 404) {
            setNotFoundError(true);
            setErrorMessage(null);
          } else {
            setNotFoundError(false);
            setErrorMessage(
              err instanceof Error
                ? err.message
                : "Could not load tuition details."
            );
          }
        }
      } finally {
        if (active) setLoadedId(id);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [id, session, role]);

  const refreshReviews = React.useCallback(async () => {
    try {
      const res = await apiFetch<{
        reviews?: Review[];
        averageRating?: number;
        totalReviews?: number;
      }>(`/api/reviews/tuition/${encodeURIComponent(id)}`);
      if (res?.reviews) {
        setReviews(res.reviews);
        setAverageRating(res.averageRating || 0);
        setTotalReviews(res.totalReviews || 0);
      }
      if (session?.user?.email && role === "student") {
        const eligRes = await apiFetch<{
          canReview?: boolean;
          existingReview?: Review | null;
        }>(`/api/reviews/can-review/${encodeURIComponent(id)}`);
        setCanReview(!!eligRes?.canReview);
        setExistingReview(eligRes?.existingReview || null);
      }
    } catch {
      // non-blocking
    }
  }, [id, session, role]);

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/tuitions"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-forest transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse Tuitions
        </Link>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-72 w-full rounded-2xl" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        ) : notFoundError || !tuition ? (
          <Card className="p-12 text-center">
            <h1 className="text-2xl font-extrabold text-forest">
              Tuition listing not found
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              {errorMessage ||
                "This tuition may be pending approval, closed by the tutor, or removed."}
            </p>
            <Link href="/tuitions" className="mt-6 inline-block">
              <Button>Explore Available Tuitions</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main Details Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Banner */}
              <div className="overflow-hidden rounded-2xl border border-sage-border bg-white shadow-xs">
                <div className="relative h-64 sm:h-80 w-full bg-sage-subtle">
                  {isValidImageUrl(tuition.bannerImage) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tuition.bannerImage!}
                      alt={tuition.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-forest to-forest-soft text-white p-8">
                      <BookOpen className="h-12 w-12 text-amber-200 mb-3" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white/80">
                        {tuition.subject} — {tuition.classLevel}
                      </span>
                    </div>
                  )}
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge variant="default" className="px-3 py-1">
                      {tuition.subject}
                    </Badge>
                    <Badge
                      variant={tuition.mode === "Online" ? "sage" : "clay"}
                      className="bg-white/95 px-3 py-1"
                    >
                      {tuition.mode === "Online" ? (
                        <Monitor className="h-3.5 w-3.5" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5" />
                      )}
                      {tuition.mode}
                    </Badge>
                  </div>

                  {/* Bookmark Button */}
                  <div className="absolute right-4 top-4 z-10">
                    <button
                      type="button"
                      onClick={handleToggleBookmark}
                      disabled={bookmarkLoading}
                      aria-label={bookmarked ? "Remove bookmark" : "Save tuition"}
                      title={bookmarked ? "Remove bookmark" : "Save tuition"}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-xs cursor-pointer",
                        bookmarked
                          ? "bg-forest text-amber-300 dark:bg-[#1E3A2F] dark:text-amber-300 hover:scale-110"
                          : "bg-white/90 text-forest hover:bg-white hover:text-clay dark:bg-[#141F18]/90 dark:text-[#8EE0BA] dark:hover:bg-[#1C2B22]"
                      )}
                    >
                      <Bookmark
                        className={cn(
                          "h-4 w-4 transition-transform",
                          bookmarked ? "fill-amber-300 text-amber-300 scale-110" : ""
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
                    <span className="inline-flex items-center gap-1 rounded-full bg-sage-bg dark:bg-[#1C2B22] px-3 py-1 text-forest dark:text-[#8EE0BA]">
                      <GraduationCap className="h-3.5 w-3.5 text-clay" />
                      {tuition.classLevel}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Admin Approved
                    </span>
                    {totalReviews > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {averageRating.toFixed(1)} ({totalReviews} review{totalReviews > 1 ? "s" : ""})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sage-bg dark:bg-[#1C2B22] px-3 py-1 text-muted dark:text-[#9DB3A6] border border-sage-border">
                        <Star className="h-3.5 w-3.5 text-sage-border" />
                        New Batch
                      </span>
                    )}
                    {tuition.createdAt && (
                      <span className="text-muted dark:text-[#9DB3A6]">
                        Posted {formatDate(tuition.createdAt)}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-4 text-2xl font-extrabold text-forest sm:text-3xl">
                    {tuition.title}
                  </h1>

                  {/* Key Facts Grid */}
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-sage-border bg-sage-bg/60 p-3.5">
                      <p className="text-xs font-semibold text-muted">
                        Weekly Schedule
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-forest">
                        <CalendarDays className="h-4 w-4 text-clay" />
                        {tuition.daysPerWeek} days / week
                      </p>
                    </div>
                    <div className="rounded-xl border border-sage-border bg-sage-bg/60 p-3.5">
                      <p className="text-xs font-semibold text-muted">
                        Mode &amp; Format
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-forest">
                        <Monitor className="h-4 w-4 text-clay" />
                        {tuition.mode}
                      </p>
                    </div>
                    <div className="rounded-xl border border-sage-border bg-sage-bg/60 p-3.5">
                      <p className="text-xs font-semibold text-muted">
                        Location
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-bold text-forest">
                        <MapPin className="h-4 w-4 shrink-0 text-clay" />
                        <span className="truncate">
                          {tuition.location || "Online / Flexible"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-8 border-t border-sage-border pt-6">
                    <h2 className="text-lg font-bold text-forest dark:text-[#8EE0BA]">
                      About This Tuition
                    </h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink dark:text-[#EFF5F0] sm:text-base">
                      {tuition.description}
                    </p>
                  </div>

                  {/* Tutor Availability Calendar */}
                  <div className="mt-8 border-t border-sage-border pt-6">
                    <TutorAvailabilityCalendar
                      availability={tuition.tutorAvailability}
                      daysPerWeek={tuition.daysPerWeek}
                      tutorName={tuition.tutorName}
                    />
                  </div>

                  {/* Student Reviews & Ratings */}
                  <div className="mt-10 border-t border-sage-border pt-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-forest dark:text-[#8EE0BA]">
                          Student Reviews &amp; Ratings
                        </h2>
                        <p className="text-xs text-muted dark:text-[#9DB3A6]">
                          Feedback from students accepted into this tuition
                        </p>
                      </div>

                      {canReview && (
                        <Button
                          size="sm"
                          variant="accent"
                          className="gap-1.5 shrink-0"
                          onClick={() => setReviewOpen(true)}
                        >
                          <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                          <span>{existingReview ? "Update Review" : "Write a Review"}</span>
                        </Button>
                      )}
                    </div>

                    <ReviewList
                      reviews={reviews}
                      averageRating={averageRating}
                      totalReviews={totalReviews}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Fee & Apply Card */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      Monthly Tuition Fee
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-clay">
                      {formatFee(tuition.monthlyFee)}
                      <span className="text-sm font-medium text-muted">
                        {" "}
                        / month
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2 border-y border-sage-border py-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Subject</span>
                      <span className="font-semibold text-forest">
                        {tuition.subject}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Class Level</span>
                      <span className="font-semibold text-forest">
                        {tuition.classLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Days / Week</span>
                      <span className="font-semibold text-forest">
                        {tuition.daysPerWeek} days
                      </span>
                    </div>
                  </div>

                  {/* Batch Seat Capacity */}
                  <div className="mt-4 rounded-xl border border-sage-border/80 bg-sage-bg/50 dark:bg-[#1C2B22]/60 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-muted dark:text-[#9DB3A6] flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA]" />
                        <span>ব্যাচ সিট ক্যাপাসিটি</span>
                      </span>
                      {tuition.isFull || (tuition.remainingSeats !== undefined && tuition.remainingSeats <= 0) ? (
                        <span className="text-red-600 dark:text-red-400 font-black">ভর্তি পূর্ণ (০ সিট)</span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-black">
                          {tuition.remainingSeats ?? 5}টি সিট বাকি
                        </span>
                      )}
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-sage-border/60 dark:bg-[#141F18]">
                      <div
                        className={cn(
                          "transition-all duration-500",
                          tuition.isFull || (tuition.remainingSeats !== undefined && tuition.remainingSeats <= 0)
                            ? "bg-red-500"
                            : "bg-emerald-500"
                        )}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(((tuition.enrolledCount || 0) / (tuition.seatLimit || 5)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted dark:text-[#9DB3A6]">
                      <span>{tuition.enrolledCount || 0} জন ভর্তি হয়েছে</span>
                      <span>সর্বোচ্চ আসন: {tuition.seatLimit || 5}</span>
                    </div>
                  </div>

                  {/* Role-Restricted Application Action */}
                  {sessionLoading ? (
                    <Skeleton className="h-11 w-full rounded-xl" />
                  ) : applied ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                      <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-700" />
                      <p className="mt-1.5 text-sm font-bold text-emerald-900">
                        Application Submitted
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-800">
                        Track its status anytime in your dashboard.
                      </p>
                      <Link
                        href="/dashboard/student/my-applications"
                        className="mt-3 inline-block"
                      >
                        <Button variant="outline" size="sm">
                          View My Applications
                        </Button>
                      </Link>
                    </div>
                  ) : tuition.isFull || (tuition.remainingSeats !== undefined && tuition.remainingSeats <= 0) ? (
                    <div className="space-y-2">
                      <Button
                        size="lg"
                        disabled
                        className="w-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-bold border border-red-200 dark:border-red-900 cursor-not-allowed opacity-90"
                      >
                        ভর্তি পূর্ণ (Batch Full)
                      </Button>
                      <p className="text-center text-xs text-red-600 dark:text-red-400">
                        এই ব্যাচের সব আসন ইতিমধ্যে পূর্ণ হয়ে গেছে। নতুন আবেদন গ্রহণ বন্ধ আছে।
                      </p>
                    </div>
                  ) : !user ? (
                    <div className="space-y-2.5">
                      <Link
                        href={`/sign-in?callbackUrl=${encodeURIComponent(
                          `/tuitions/${tuition._id}`
                        )}`}
                        className="block"
                      >
                        <Button size="lg" className="w-full">
                          Sign In to Apply
                        </Button>
                      </Link>
                      <p className="text-center text-xs text-muted">
                        Sign in with a Student account to submit your
                        application.
                      </p>
                    </div>
                  ) : role === "student" ? (
                    applied ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                        <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-700" />
                        <p className="mt-1.5 text-sm font-bold text-emerald-900">
                          Application Submitted
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-800">
                          Track its status anytime in your dashboard.
                        </p>
                        <Link
                          href="/dashboard/student/my-applications"
                          className="mt-3 inline-block"
                        >
                          <Button variant="outline" size="sm">
                            View My Applications
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        variant="accent"
                        className="w-full"
                        onClick={() => setApplyOpen(true)}
                      >
                        Apply Now
                      </Button>
                    )
                  ) : (
                    <div className="space-y-3">
                      <Button size="lg" className="w-full" disabled>
                        Apply Now
                      </Button>
                      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                        <span>
                          Only accounts with the <strong>Student</strong> role
                          can apply for tuitions. You are currently signed in as{" "}
                          <strong className="capitalize">{role}</strong>.
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Direct Student-Tutor Inquiry Chat Button */}
                  <div className="pt-2 border-t border-sage-border">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2 border-forest/30 text-forest dark:text-[#8EE0BA] hover:bg-sage-subtle dark:hover:bg-[#1C2B22]"
                      onClick={() => setChatOpen(true)}
                    >
                      <MessageCircle className="h-4 w-4 text-clay" />
                      <span>Chat with Tutor / Ask Question</span>
                    </Button>
                    <p className="mt-1.5 text-center text-[11px] text-muted dark:text-[#9DB3A6]">
                      Ask about timings, fee flexibility, or syllabus before applying.
                    </p>
                  </div>

                  {/* Bookmark Tuition Button */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant={bookmarked ? "default" : "outline"}
                      className={cn(
                        "w-full gap-2 transition-all",
                        bookmarked
                          ? "bg-forest text-amber-300 hover:bg-forest-soft dark:bg-[#1E3A2F]"
                          : "border-forest/30 text-forest dark:text-[#8EE0BA] hover:bg-sage-subtle dark:hover:bg-[#1C2B22]"
                      )}
                      onClick={handleToggleBookmark}
                      disabled={bookmarkLoading}
                    >
                      <Bookmark
                        className={cn(
                          "h-4 w-4",
                          bookmarked && "fill-amber-300 text-amber-300"
                        )}
                      />
                      <span>
                        {bookmarked
                          ? "Saved in Bookmarks"
                          : "Save / Bookmark Tuition"}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tutor Summary Card */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                    Tutor Profile
                  </h2>
                  <div className="mt-4 flex items-center gap-3.5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest dark:bg-[#8EE0BA] text-sm font-bold text-white dark:text-[#0C130F]">
                      {getInitials(tuition.tutorName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-forest dark:text-[#8EE0BA]">
                        {tuition.tutorName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <VerifiedBadge size="sm" />
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                          <Zap className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500 shrink-0" />
                          <span>~1 hr response</span>
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted dark:text-[#9DB3A6]">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{tuition.tutorEmail}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-sage-bg/70 dark:bg-[#1C2B22]/60 px-3 py-2 text-xs text-muted dark:text-[#9DB3A6]">
                    <User className="h-4 w-4 text-forest dark:text-[#8EE0BA] shrink-0" />
                    <span>Verified MentorLagbe Tutor Listing</span>
                  </div>

                  {/* Public Tutor Profile link & WhatsApp */}
                  <div className="mt-4 border-t border-sage-border pt-4 space-y-2">
                    {tuition.tutorPhone && (
                      <a
                        href={formatWhatsAppUrl(tuition.tutorPhone, tuition.tutorName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 px-3 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4 fill-white" />
                        <span>Chat via WhatsApp</span>
                      </a>
                    )}

                    <Link
                      href={`/tutors/${encodeURIComponent(tuition.tutorEmail)}`}
                      className="block"
                    >
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        <GraduationCap className="h-4 w-4" />
                        <span>View Tutor Profile &amp; Batches</span>
                      </Button>
                    </Link>

                    {/* Report listing button */}
                    <button
                      type="button"
                      onClick={() => setReportOpen(true)}
                      className="flex w-full items-center justify-center gap-1.5 py-1 text-[11px] font-semibold text-muted hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Flag className="h-3 w-3" />
                      <span>Report this listing for incorrect info</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </section>

      {tuition && (
        <>
          <ApplyModal
            open={applyOpen}
            onClose={() => setApplyOpen(false)}
            tuition={tuition}
            defaultPhone={user?.phone || ""}
            onSuccess={() => setApplied(true)}
          />

          <ReviewDialog
            tuitionId={tuition._id}
            tuitionTitle={tuition.title}
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            existingRating={existingReview?.rating}
            existingFeedback={existingReview?.feedback}
            onSuccess={() => {
              void refreshReviews();
            }}
          />

          <TuitionChatDialog
            tuitionId={tuition._id}
            tuitionTitle={tuition.title}
            tutorEmail={tuition.tutorEmail}
            tutorName={tuition.tutorName}
            open={chatOpen}
            onOpenChange={setChatOpen}
          />

          <ReportListingDialog
            open={reportOpen}
            onClose={() => setReportOpen(false)}
            tuitionId={tuition._id}
            tuitionTitle={tuition.title}
          />
        </>
      )}
    </SiteShell>
  );
}
