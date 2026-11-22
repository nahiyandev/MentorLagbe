"use client";

import * as React from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  MessageSquare,
  Quote,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import type { Review } from "@/types";
import { formatDate, getInitials, isValidImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function ReviewList({
  reviews,
  averageRating,
  totalReviews,
}: ReviewListProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<"carousel" | "grid">("carousel");
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

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

  // Touch Swipe handlers for mobile
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
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (totalReviews === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sage-border bg-sage-bg/40 dark:bg-[#1A2821]/40 p-8 text-center">
        <MessageSquare className="mx-auto h-8 w-8 text-muted/40 mb-2" />
        <h4 className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
          No Student Reviews Yet
        </h4>
        <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6]">
          Accepted students who enrolled in this batch will be able to share their ratings and feedback here.
        </p>
      </div>
    );
  }

  const currentReview = reviews[currentIndex] || reviews[0];

  return (
    <div className="space-y-6">
      {/* Rating Score Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-sage-border bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-xs">
            <span className="text-2xl font-black">{averageRating.toFixed(1)}</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4.5 w-4.5 ${
                    star <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-sage-border stroke-1"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs font-bold text-forest dark:text-[#8EE0BA]">
              Based on {totalReviews} student review{totalReviews > 1 ? "s" : ""}
            </p>
            <p className="text-[11px] text-muted dark:text-[#9DB3A6]">
              Verified feedback from accepted batch candidates
            </p>
          </div>
        </div>

        {total > 1 && (
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <Button
              type="button"
              variant={viewMode === "carousel" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("carousel")}
              className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Swipe View</span>
            </Button>
            <Button
              type="button"
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid View</span>
            </Button>
          </div>
        )}
      </div>

      {/* 1-Line Swipeable View (Default) */}
      {viewMode === "carousel" && currentReview ? (
        <div
          className="relative select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main 1-Line Showcase Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-sage-border/80 dark:border-[#1E3024] bg-linear-to-b from-white via-sage-bg/30 to-white dark:from-[#141F18] dark:via-[#19271E] dark:to-[#141F18] p-6 sm:p-8 shadow-sm">
            <Quote className="pointer-events-none absolute -top-3 -right-3 h-28 w-28 text-forest/5 dark:text-[#8EE0BA]/5 select-none" />

            {/* Top Row: Stars + Rating badge + Counter */}
            <div className="flex items-center justify-between gap-3 border-b border-sage-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= currentReview.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-sage-border stroke-1"
                      }`}
                    />
                  ))}
                </div>
                <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  {currentReview.rating.toFixed(1)} ★
                </span>
              </div>

              {total > 1 && (
                <span className="font-mono text-xs font-bold text-muted dark:text-[#9DB3A6] bg-sage-bg/70 dark:bg-[#101A14] px-2.5 py-1 rounded-full border border-sage-border/50">
                  {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              )}
            </div>

            {/* Feedback Content */}
            <div className="my-5 min-h-16 flex items-center">
              <blockquote className="text-base sm:text-lg leading-relaxed text-ink dark:text-[#EFF5F0] italic font-medium">
                &ldquo;{currentReview.feedback}&rdquo;
              </blockquote>
            </div>

            {/* Bottom Row: Student Profile & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-sage-border pt-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {isValidImageUrl(currentReview.studentImage) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentReview.studentImage!}
                      alt={currentReview.studentName}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-forest dark:ring-[#8EE0BA]"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest dark:bg-[#8EE0BA] text-xs font-bold text-white dark:text-[#0C130F]">
                      {getInitials(currentReview.studentName)}
                    </span>
                  )}
                  <span
                    className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-1 ring-white dark:ring-[#141F18]"
                    title="Verified Student"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-forest dark:text-[#8EE0BA]">
                    {currentReview.studentName}
                  </p>
                  <p className="flex items-center gap-1.5 text-[10px] text-muted dark:text-[#9DB3A6]">
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

              {total > 1 && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous review"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-sage-border bg-white dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA] shadow-xs hover:bg-forest hover:text-white dark:hover:bg-[#8EE0BA] dark:hover:text-[#0C130F] transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next review"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-sage-border bg-white dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA] shadow-xs hover:bg-forest hover:text-white dark:hover:bg-[#8EE0BA] dark:hover:text-[#0C130F] transition-all cursor-pointer active:scale-95"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dots Indicator */}
          {total > 1 && (
            <div className="mt-4 flex items-center justify-center gap-1.5">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                    currentIndex === idx
                      ? "w-6 bg-forest dark:bg-[#8EE0BA]"
                      : "w-2 bg-sage-border dark:bg-[#1C2B22] hover:bg-clay"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Multi-column Grid View */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {reviews.map((rev) => (
            <Card key={rev._id} className="overflow-hidden border-sage-border shadow-xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {isValidImageUrl(rev.studentImage) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rev.studentImage!}
                        alt={rev.studentName}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-sage-border"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
                        {getInitials(rev.studentName)}
                      </span>
                    )}
                    <div>
                      <p className="text-xs font-bold text-forest dark:text-[#8EE0BA]">
                        {rev.studentName}
                      </p>
                      <p className="text-[10px] text-muted dark:text-[#9DB3A6]">
                        {formatDate(rev.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-sage-border stroke-1"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-ink dark:text-[#EFF5F0] italic">
                  &ldquo;{rev.feedback}&rdquo;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
