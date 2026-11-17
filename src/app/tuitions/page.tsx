"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpenCheck,
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  CLASS_LEVEL_OPTIONS,
  MODE_OPTIONS,
  SUBJECT_OPTIONS,
  type Tuition,
} from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { SiteShell } from "@/components/layout/site-shell";
import { TuitionCard } from "@/components/tuitions/tuition-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function BrowseTuitionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = React.useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = React.useState(
    searchParams.get("search") || ""
  );
  const [subject, setSubject] = React.useState(
    searchParams.get("subject") || ""
  );
  const [classLevel, setClassLevel] = React.useState(
    searchParams.get("classLevel") || ""
  );
  const [mode, setMode] = React.useState(searchParams.get("mode") || "");

  const [tuitions, setTuitions] = React.useState<Tuition[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (subject) params.set("subject", subject);
    if (classLevel) params.set("classLevel", classLevel);
    if (mode) params.set("mode", mode);

    const queryString = params.toString();
    const targetUrl = queryString ? `/tuitions?${queryString}` : "/tuitions";
    router.replace(targetUrl, { scroll: false });

    async function fetchTuitions() {
      try {
        const res = await apiFetch<unknown>(
          queryString ? `/api/tuitions?${queryString}` : "/api/tuitions"
        );
        const list = extractList<Tuition>(res, "tuitions");
        if (active) {
          setTuitions(list);
        }
      } catch (err) {
        if (active) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to load tuition listings.";
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchTuitions();
    return () => {
      active = false;
    };
  }, [debouncedSearch, subject, classLevel, mode, router]);

  const hasFilters = Boolean(searchInput || subject || classLevel || mode);

  const resetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSubject("");
    setClassLevel("");
    setMode("");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-clay">
            Tuition Catalog
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-forest sm:text-4xl">
            Browse Approved Tuitions
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            Search and filter active, admin-verified tuition batches and 1-on-1
            mentorship sessions tailored to your academic goals.
          </p>
        </div>
        {!loading && (
          <p className="text-sm font-semibold text-forest">
            {tuitions.length}{" "}
            {tuitions.length === 1 ? "listing found" : "listings found"}
          </p>
        )}
      </div>

      {/* Server-side Search & Filter Bar */}
      <div className="mb-8 rounded-2xl border border-sage-border bg-white p-4 sm:p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest">
            <Filter className="h-3.5 w-3.5 text-clay" />
            Search &amp; Filter
          </span>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 px-2.5 text-xs text-clay hover:text-clay-hover"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="search"
              placeholder="Search by title or subject..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
              aria-label="Search tuitions"
            />
          </div>

          <Select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Filter by subject"
          >
            <option value="">All Subjects</option>
            {SUBJECT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <Select
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            aria-label="Filter by class level"
          >
            <option value="">All Class Levels</option>
            {CLASS_LEVEL_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            aria-label="Filter by mode"
          >
            <option value="">All Modes (Online &amp; Offline)</option>
            {MODE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-sage-border bg-white p-5 space-y-4"
            >
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-sage-border bg-white p-12 text-center">
          <p className="text-lg font-bold text-forest">
            Could not load tuitions
          </p>
          <p className="mt-1.5 text-sm text-muted">{error}</p>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : tuitions.length === 0 ? (
        <div className="rounded-2xl border border-sage-border bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-subtle text-forest">
            <BookOpenCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-forest">
            No matching tuitions found
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
            {hasFilters
              ? "Try adjusting your search keywords or clearing one of the filters to see more listings."
              : "There are currently no approved active tuition listings available."}
          </p>
          {hasFilters && (
            <Button variant="outline" className="mt-5" onClick={resetFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tuitions.map((tuition) => (
            <TuitionCard key={tuition._id} tuition={tuition} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function BrowseTuitionsPage() {
  return (
    <SiteShell>
      <React.Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        }
      >
        <BrowseTuitionsContent />
      </React.Suspense>
    </SiteShell>
  );
}
