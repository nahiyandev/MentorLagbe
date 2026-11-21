"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, BookOpen, Search } from "lucide-react";
import type { BookmarkItem } from "@/types";
import { apiFetch } from "@/lib/api";
import { TuitionCard } from "@/components/tuitions/tuition-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentBookmarksPage() {
  const [bookmarks, setBookmarks] = React.useState<BookmarkItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const loadBookmarks = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ bookmarks: BookmarkItem[] }>("/api/bookmarks");
      setBookmarks(res?.bookmarks || []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load saved tuitions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await apiFetch<{ bookmarks: BookmarkItem[] }>("/api/bookmarks");
        if (active) {
          setBookmarks(res?.bookmarks || []);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load saved tuitions."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleBookmarkToggle = (tuitionId: string, newState: boolean) => {
    if (!newState) {
      setBookmarks((prev) => prev.filter((b) => b.tuition?._id !== tuitionId));
    }
  };

  const filteredBookmarks = React.useMemo(() => {
    if (!searchTerm.trim()) return bookmarks;
    const term = searchTerm.toLowerCase().trim();
    return bookmarks.filter(
      (b) =>
        b.tuition?.title?.toLowerCase().includes(term) ||
        b.tuition?.subject?.toLowerCase().includes(term) ||
        b.tuition?.tutorName?.toLowerCase().includes(term) ||
        b.tuition?.location?.toLowerCase().includes(term)
    );
  }, [bookmarks, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-forest dark:text-[#8EE0BA]">
              Saved Tuitions
            </h1>
            {!loading && (
              <Badge variant="outline" className="border-forest/30 text-forest dark:text-[#8EE0BA]">
                {bookmarks.length} Saved
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6] sm:text-sm">
            Keep track of tuition posts you want to review, compare, or apply for.
          </p>
        </div>

        <Link href="/tuitions">
          <Button size="sm" className="gap-2 shrink-0">
            <BookOpen className="h-4 w-4" />
            <span>Browse More Tuitions</span>
          </Button>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      {bookmarks.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-[#9DB3A6]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved tuitions by subject, tutor, title..."
            className="pl-9 text-sm"
          />
        </div>
      )}

      {/* Content State */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-4 space-y-4 shadow-xs"
            >
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-4 border-t border-sage-border flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 dark:bg-rose-950/20 p-8 text-center">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
            {error}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 border-rose-300 text-rose-800 hover:bg-rose-100"
            onClick={loadBookmarks}
          >
            Retry Loading
          </Button>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sage-border bg-white/70 dark:bg-[#141F18]/70 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-subtle dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA]">
            <Bookmark className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-forest dark:text-[#8EE0BA]">
            No saved tuitions yet
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted dark:text-[#9DB3A6] sm:text-sm">
            Click the bookmark icon on any tuition card while browsing to save it
            here for quick access.
          </p>
          <Link href="/tuitions" className="mt-6 inline-block">
            <Button size="sm" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Explore Available Tuitions</span>
            </Button>
          </Link>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-8 text-center">
          <p className="text-sm font-semibold text-muted dark:text-[#9DB3A6]">
            No saved tuitions matched &quot;{searchTerm}&quot;
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={() => setSearchTerm("")}
          >
            Clear Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBookmarks.map((b) => (
            <TuitionCard
              key={b.tuition._id}
              tuition={b.tuition}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
