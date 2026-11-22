"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";
import type { Review } from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { formatDate, getInitials, isValidImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function TestimonialsSection() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  React.useEffect(() => {
    let active = true;

    async function loadFeaturedReviews() {
      try {
        const res = await apiFetch<Review[]>("/api/reviews/featured");
        const list = extractList<Review>(res);
        if (active) {
          setReviews(list);
          setCurrentIndex(0);
        }
      } catch {
        // Non-blocking
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFeaturedReviews();
    return () => {
      active = false;
    };
  }, []);

  const total = reviews.length;

  const nextSlide = React.useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = React.useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    if (idx === currentIndex) return;
    setCurrentIndex(idx);
  };

  // Auto-play / auto-swipe: advance to next slide every 5 seconds unless hovered
  React.useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, total, nextSlide]);

  // Touch Swipe handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const currentReview = reviews[currentIndex];

  return (
    <section className="border-t border-sage-border bg-sage-bg/35 dark:bg-[#0E1712] py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-clay">
            Community Voices
          </p>
          <h2 className="mt-1.5 text-3xl font-extrabold text-forest dark:text-[#8EE0BA]">
            Students Reviews
          </h2>
          <p className="mt-2 text-sm text-muted dark:text-[#9DB3A6] sm:text-base">
            Verified feedback submitted by students accepted into active tuition batches across Bangladesh.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 mx-auto max-w-4xl">
            <div className="rounded-3xl border border-sage-border bg-white dark:bg-[#141F18] p-8 sm:p-12 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-20 w-full rounded-2xl" />
              <div className="flex items-center justify-between pt-6 border-t border-sage-border">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : reviews.length > 0 && currentReview ? (
          /* 1-Line Swipeable Review Showcase */
          <div
            className="relative mt-12 mx-auto max-w-4xl select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* The Single Showcase Card */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-sage-border/80 dark:border-[#1E3024] bg-linear-to-b from-white via-sage-bg/30 to-white dark:from-[#141F18] dark:via-[#19271E] dark:to-[#141F18] p-6 sm:p-10 lg:p-12 shadow-[0_12px_36px_rgba(20,40,30,0.06)] transition-all">
              {/* Background Watermark Quote */}
              <Quote className="pointer-events-none absolute -top-4 -right-4 h-32 w-32 sm:h-44 sm:w-44 text-forest/5 dark:text-[#8EE0BA]/5 select-none" />

              {/* Top Row: Stars + Rating Badge + Batch Badge + Counter */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sage-border pb-5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(currentReview.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-sage-border dark:text-[#2A3E31]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-black text-amber-700 dark:text-amber-300">
                    {currentReview.rating.toFixed(1)} ★ Verified
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentReview.tuitionTitle && (
                    <span className="rounded-full bg-sage-subtle dark:bg-[#1C2B22] px-3 py-1 text-xs font-bold text-forest dark:text-[#8EE0BA] truncate max-w-56 sm:max-w-xs">
                      {currentReview.tuitionTitle}
                    </span>
                  )}
                  <span className="font-mono text-xs font-bold text-muted dark:text-[#9DB3A6] bg-sage-bg/70 dark:bg-[#101A14] px-2.5 py-1 rounded-full border border-sage-border/50">
                    {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Middle Row: The Review Feedback */}
              <div className="my-6 sm:my-8 min-h-24 sm:min-h-28 flex items-center">
                <blockquote className="text-lg sm:text-2xl leading-relaxed text-ink dark:text-[#EFF5F0] italic font-medium">
                  &ldquo;{currentReview.feedback}&rdquo;
                </blockquote>
              </div>

              {/* Bottom Row: Student Profile + Previous / Next Swipe Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-sage-border pt-6">
                {/* Student Profile Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    {isValidImageUrl(currentReview.studentImage) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentReview.studentImage!}
                        alt={currentReview.studentName}
                        className="h-13 w-13 rounded-full object-cover ring-2 ring-forest dark:ring-[#8EE0BA] shadow-xs"
                      />
                    ) : (
                      <span className="flex h-13 w-13 items-center justify-center rounded-full bg-forest dark:bg-[#8EE0BA] text-base font-extrabold text-white dark:text-[#0C130F] ring-2 ring-forest/20 shadow-xs">
                        {getInitials(currentReview.studentName)}
                      </span>
                    )}
                    <span
                      className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-[#141F18]"
                      title="Verified Enrolled Student"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="truncate text-base font-extrabold text-forest dark:text-[#8EE0BA]">
                      {currentReview.studentName}
                    </h4>
                    <p className="flex items-center gap-1.5 text-xs text-muted dark:text-[#9DB3A6]">
                      <span>Verified Student</span>
                      {currentReview.createdAt && (
                        <>
                          <span>&bull;</span>
                          <span>{formatDate(currentReview.createdAt)}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Previous & Next Swipe Control Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous review"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-sage-border bg-white dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA] shadow-xs hover:bg-forest hover:text-white dark:hover:bg-[#8EE0BA] dark:hover:text-[#0C130F] transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next review"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-sage-border bg-white dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA] shadow-xs hover:bg-forest hover:text-white dark:hover:bg-[#8EE0BA] dark:hover:text-[#0C130F] transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Centered Slide Indicator Dots (Names removed per design) */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  className={`h-2.5 transition-all duration-300 rounded-full cursor-pointer ${
                    currentIndex === idx
                      ? "w-8 bg-forest dark:bg-[#8EE0BA]"
                      : "w-2.5 bg-sage-border dark:bg-[#1C2B22] hover:bg-clay"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-sage-border bg-white/70 dark:bg-[#141F18]/70 p-10 text-center max-w-xl mx-auto space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-subtle text-forest dark:text-[#8EE0BA] dark:bg-[#1C2B22]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-forest dark:text-[#8EE0BA]">
              100% Verified Community Feedback
            </h3>
            <p className="text-xs text-muted dark:text-[#9DB3A6] leading-relaxed">
              Every review on MentorLagbe is authenticated through accepted student applications. Once a batch starts, students can rate and leave feedback.
            </p>
            <div className="pt-2">
              <Link href="/tuitions">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-clay" />
                  Browse Verified Batches
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
