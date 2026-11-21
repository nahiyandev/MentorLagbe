"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Banknote,
  BookOpenCheck,
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  BANGLADESH_DISTRICTS,
  CLASS_LEVEL_OPTIONS,
  MODE_OPTIONS,
  POPULAR_LOCATIONS,
  SUBJECT_OPTIONS,
  type Tuition,
} from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { SiteShell } from "@/components/layout/site-shell";
import { TuitionCard } from "@/components/tuitions/tuition-card";
import { Pagination } from "@/components/ui/pagination";
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
  const [district, setDistrict] = React.useState(
    searchParams.get("district") || ""
  );
  const [minFee, setMinFee] = React.useState(
    searchParams.get("minFee") || ""
  );
  const [maxFee, setMaxFee] = React.useState(
    searchParams.get("maxFee") || ""
  );
  const [sort, setSort] = React.useState(
    searchParams.get("sort") || "newest"
  );

  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = React.useState(1);

  const [tuitions, setTuitions] = React.useState<Tuition[]>([]);
  const [loadedQuery, setLoadedQuery] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [filterKey, setFilterKey] = React.useState("");
  const currentFilterKey = `${debouncedSearch}|${subject}|${classLevel}|${mode}|${district}|${minFee}|${maxFee}|${sort}`;
  if (filterKey !== currentFilterKey) {
    setFilterKey(currentFilterKey);
    setCurrentPage(1);
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryString = React.useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (subject) params.set("subject", subject);
    if (classLevel) params.set("classLevel", classLevel);
    if (mode) params.set("mode", mode);
    if (district) params.set("district", district);
    if (minFee) params.set("minFee", minFee);
    if (maxFee) params.set("maxFee", maxFee);
    if (sort && sort !== "newest") params.set("sort", sort);
    return params.toString();
  }, [debouncedSearch, subject, classLevel, mode, district, minFee, maxFee, sort]);

  const loading = loadedQuery !== queryString;

  React.useEffect(() => {
    let active = true;

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
          setError(null);
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
        if (active) setLoadedQuery(queryString);
      }
    }

    void fetchTuitions();
    return () => {
      active = false;
    };
  }, [queryString, router]);

  const hasFilters = Boolean(
    searchInput ||
      subject ||
      classLevel ||
      mode ||
      district ||
      minFee ||
      maxFee ||
      (sort && sort !== "newest")
  );

  const resetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSubject("");
    setClassLevel("");
    setMode("");
    setDistrict("");
    setMinFee("");
    setMaxFee("");
    setSort("newest");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(tuitions.length / ITEMS_PER_PAGE);
  const paginatedTuitions = tuitions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest dark:text-[#8EE0BA]">
            <Filter className="h-3.5 w-3.5 text-clay" />
            Search &amp; Filter
          </span>

          <div className="flex items-center gap-2">
            {/* Sort selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted dark:text-[#9DB3A6] hidden sm:inline flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5 text-clay" />
                Sort:
              </span>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-8 text-xs py-1 px-2.5 min-w-36 bg-sage-bg/40 dark:bg-[#18261E]"
                aria-label="Sort tuitions"
              >
                <option value="newest">Newest First</option>
                <option value="fee_asc">Fee: Low to High (৳)</option>
                <option value="fee_desc">Fee: High to Low (৳)</option>
                <option value="rating_desc">Highest Rated (★)</option>
                <option value="oldest">Oldest First</option>
              </Select>
            </div>

            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-2.5 text-xs text-clay hover:text-clay-hover"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="search"
              placeholder="Search by title, subject..."
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
            <option value="">All Modes</option>
            {MODE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          {/* District & Popular Area Filter */}
          <Select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            aria-label="Filter by district or area"
          >
            <option value="">All Locations (সব এলাকা / জেলা)</option>
            <optgroup label="Popular Areas (জনপ্রিয় এলাকা)">
              {POPULAR_LOCATIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </optgroup>
            <optgroup label="Districts (জেলা)">
              {BANGLADESH_DISTRICTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </optgroup>
          </Select>
        </div>

        {/* Fee Range / Budget Filter Bar */}
        <div className="mt-4 pt-3.5 border-t border-sage-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-forest dark:text-[#8EE0BA] flex items-center gap-1 mr-1">
              <Banknote className="h-3.5 w-3.5 text-clay" />
              Budget:
            </span>
            {[
              { label: "All Fees", min: "", max: "" },
              { label: "< ৳3,000", min: "", max: "3000" },
              { label: "৳3,000 – ৳6,000", min: "3000", max: "6000" },
              { label: "৳6,000 – ৳10,000", min: "6000", max: "10000" },
              { label: "৳10,000+", min: "10000", max: "" },
            ].map((preset) => {
              const isSelected = minFee === preset.min && maxFee === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setMinFee(preset.min);
                    setMaxFee(preset.max);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-2xs"
                      : "border border-sage-border bg-sage-bg/40 dark:bg-[#18261E] text-ink dark:text-[#EFF5F0] hover:bg-sage-subtle"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Min / Max inputs */}
          <div className="flex items-center gap-2">
            <div className="relative w-28 sm:w-32">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted font-bold">
                ৳
              </span>
              <Input
                type="number"
                placeholder="Min Fee"
                value={minFee}
                onChange={(e) => setMinFee(e.target.value)}
                className="pl-6 h-8 text-xs"
                aria-label="Minimum fee"
              />
            </div>
            <span className="text-xs text-muted font-bold">—</span>
            <div className="relative w-28 sm:w-32">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted font-bold">
                ৳
              </span>
              <Input
                type="number"
                placeholder="Max Fee"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                className="pl-6 h-8 text-xs"
                aria-label="Maximum fee"
              />
            </div>
          </div>
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedTuitions.map((tuition) => (
              <TuitionCard key={tuition._id} tuition={tuition} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={tuitions.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 120, behavior: "smooth" });
            }}
          />
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
