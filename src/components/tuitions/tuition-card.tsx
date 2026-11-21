"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  MapPin,
  Monitor,
  Star,
  User,
} from "lucide-react";
import type { Tuition } from "@/types";
import { cn, formatFee, isValidImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/context/bookmark-context";
import { VerifiedBadge } from "@/components/tutors/verified-badge";

interface TuitionCardProps {
  tuition: Tuition;
  onBookmarkToggle?: (tuitionId: string, newState: boolean) => void;
}

export function TuitionCard({ tuition, onBookmarkToggle }: TuitionCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(tuition._id);
  const [toggling, setToggling] = React.useState(false);

  const hasBanner = isValidImageUrl(tuition.bannerImage);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      const newState = await toggleBookmark(tuition._id);
      onBookmarkToggle?.(tuition._id, newState);
    } finally {
      setToggling(false);
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sage-border bg-white shadow-[0_2px_10px_rgba(30,58,47,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(30,58,47,0.09)]">
      {/* Uniform Banner Container */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-sage-subtle">
        {hasBanner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tuition.bannerImage!}
            alt={tuition.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-forest to-forest-soft p-6 text-white">
            <BookOpen className="h-9 w-9 text-amber-200/90 mb-2" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/75">
              {tuition.subject}
            </span>
          </div>
        )}

        {/* Category & Mode Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="default" className="bg-forest/90 backdrop-blur-sm">
            {tuition.subject}
          </Badge>
          <Badge
            variant={tuition.mode === "Online" ? "sage" : "clay"}
            className="bg-white/95 dark:bg-[#141F18]/95 backdrop-blur-sm"
          >
            {tuition.mode === "Online" ? (
              <Monitor className="h-3 w-3" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            {tuition.mode}
          </Badge>
        </div>

        {/* Bookmark Button */}
        <div className="absolute right-3 top-3 z-10">
          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={toggling}
            aria-label={bookmarked ? "Remove bookmark" : "Save tuition"}
            title={bookmarked ? "Remove bookmark" : "Save tuition"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-xs cursor-pointer",
              bookmarked
                ? "bg-forest text-amber-300 dark:bg-[#1E3A2F] dark:text-amber-300 hover:scale-110"
                : "bg-white/85 text-muted hover:text-forest hover:bg-white dark:bg-[#141F18]/85 dark:text-[#9DB3A6] dark:hover:text-[#8EE0BA] dark:hover:bg-[#1C2B22]"
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

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-medium text-muted">
          <span className="truncate rounded-md bg-sage-subtle dark:bg-[#1C2B22] px-2 py-0.5 font-semibold text-forest dark:text-[#8EE0BA]">
            {tuition.classLevel}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {typeof tuition.totalReviews === "number" && tuition.totalReviews > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {tuition.averageRating?.toFixed(1)}
                <span className="text-[10px] font-normal text-muted dark:text-[#9DB3A6]">
                  ({tuition.totalReviews})
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted dark:text-[#9DB3A6]">
                <Star className="h-3 w-3 text-sage-border dark:text-[#23352B]" />
                New
              </span>
            )}
            {tuition.daysPerWeek ? (
              <span className="inline-flex shrink-0 items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-clay" />
                {tuition.daysPerWeek}d/wk
              </span>
            ) : null}
          </div>
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-forest dark:text-[#8EE0BA] group-hover:text-clay dark:group-hover:text-[#E58E58] transition-colors">
          {tuition.title}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Link
            href={`/tutors/${encodeURIComponent(tuition.tutorEmail)}`}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-clay dark:hover:text-[#E58E58] transition-colors w-fit"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-subtle dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA]">
              <User className="h-3.5 w-3.5" />
            </span>
            <span className="truncate font-semibold text-ink dark:text-[#EFF5F0] hover:underline">
              {tuition.tutorName}
            </span>
          </Link>
          <VerifiedBadge size="sm" />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-sage-border pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Monthly Fee
            </p>
            <p className="text-lg font-extrabold text-clay">
              {formatFee(tuition.monthlyFee)}
            </p>
          </div>
          <Link href={`/tuitions/${tuition._id}`}>
            <Button size="sm">
              View Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
