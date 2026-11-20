"use client";

import * as React from "react";
import { MessageSquare, Star } from "lucide-react";
import type { Review } from "@/types";
import { formatDate, getInitials, isValidImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

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

  return (
    <div className="space-y-6">
      {/* Rating Score Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-sage-border bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F]">
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
      </div>

      {/* Reviews Cards Grid */}
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

                {/* Stars */}
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
    </div>
  );
}
