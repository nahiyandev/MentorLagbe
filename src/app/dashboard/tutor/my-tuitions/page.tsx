"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  ImagePlus,
  Link2,
  Loader2,
  MapPin,
  Monitor,
  Pencil,
  PlusCircle,
  Power,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  CLASS_LEVEL_OPTIONS,
  MODE_OPTIONS,
  SUBJECT_OPTIONS,
  type Tuition,
  type TuitionMode,
} from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { useAccountStatus } from "@/context/account-status-context";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { cn, formatDate, formatFee, isValidImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type StatusFilter = "all" | "approved" | "pending" | "active" | "closed";

export default function TutorMyTuitionsPage() {
  const { isBlocked } = useAccountStatus();
  const [tuitions, setTuitions] = React.useState<Tuition[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = React.useState(1);

  const [busyId, setBusyId] = React.useState<string | null>(null);

  // Modals state
  const [viewing, setViewing] = React.useState<Tuition | null>(null);
  const [editing, setEditing] = React.useState<Tuition | null>(null);
  const [deleting, setDeleting] = React.useState<Tuition | null>(null);

  const [savingEdit, setSavingEdit] = React.useState(false);
  const [uploadingBanner, setUploadingBanner] = React.useState(false);
  const editFileRef = React.useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = React.useState({
    title: "",
    subject: SUBJECT_OPTIONS[0] as string,
    classLevel: CLASS_LEVEL_OPTIONS[0] as string,
    mode: "Online" as TuitionMode,
    location: "",
    monthlyFee: "",
    daysPerWeek: "3",
    description: "",
    bannerImage: "",
  });

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch<unknown>("/api/tuitions/my-tuitions");
        if (active) {
          setTuitions(extractList<Tuition>(res, "tuitions"));
          setError(null);
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError(
              "Session expired or unauthorized. Please sign in again to manage your tuitions."
            );
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load your tuitions."
            );
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  // Stats computation
  const totalCount = tuitions.length;
  const approvedCount = tuitions.filter(
    (t) => t.approvalStatus === "approved"
  ).length;
  const pendingCount = tuitions.filter(
    (t) => t.approvalStatus === "pending"
  ).length;
  const activeCount = tuitions.filter((t) => t.isActive).length;
  const closedCount = tuitions.filter((t) => !t.isActive).length;

  // Filtered tuitions
  const filteredTuitions = React.useMemo(() => {
    return tuitions.filter((t) => {
      // Status filter
      if (statusFilter === "approved" && t.approvalStatus !== "approved")
        return false;
      if (statusFilter === "pending" && t.approvalStatus !== "pending")
        return false;
      if (statusFilter === "active" && !t.isActive) return false;
      if (statusFilter === "closed" && t.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesSubject = t.subject.toLowerCase().includes(q);
        const matchesClass = t.classLevel.toLowerCase().includes(q);
        const matchesLoc = (t.location || "").toLowerCase().includes(q);
        return matchesTitle || matchesSubject || matchesClass || matchesLoc;
      }
      return true;
    });
  }, [tuitions, statusFilter, searchQuery]);

  // Reset page when filter/search changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredTuitions.length / ITEMS_PER_PAGE);
  const paginatedTuitions = filteredTuitions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openViewModal = (t: Tuition) => {
    setViewing(t);
  };

  const openEditModal = (t: Tuition) => {
    setEditing(t);
    setEditForm({
      title: t.title,
      subject: t.subject,
      classLevel: t.classLevel,
      mode: t.mode,
      location: t.location || "",
      monthlyFee: String(t.monthlyFee),
      daysPerWeek: String(t.daysPerWeek || 3),
      description: t.description || "",
      bannerImage: t.bannerImage || "",
    });
  };

  const handleReplaceBanner = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await uploadImageToImgBB(file);
      setEditForm((prev) => ({ ...prev, bannerImage: url }));
      toast.success("Banner image updated.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image."
      );
    } finally {
      setUploadingBanner(false);
      if (editFileRef.current) editFileRef.current.value = "";
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const fee = Number(editForm.monthlyFee);
    const days = Number(editForm.daysPerWeek);
    if (!editForm.title.trim() || !Number.isFinite(fee) || fee <= 0) {
      toast.error("Please provide a valid title and monthly fee.");
      return;
    }

    setSavingEdit(true);
    try {
      const updated = await apiFetch<
        Tuition | { tuition?: Tuition; data?: Tuition }
      >(`/api/tuitions/${encodeURIComponent(editing._id)}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title.trim(),
          subject: editForm.subject,
          classLevel: editForm.classLevel,
          mode: editForm.mode,
          location: editForm.location.trim(),
          monthlyFee: fee,
          daysPerWeek: Number.isFinite(days) ? days : 3,
          description: editForm.description.trim(),
          bannerImage: editForm.bannerImage,
        }),
      });

      const nextDoc =
        updated && typeof updated === "object" && "_id" in updated
          ? (updated as Tuition)
          : (updated as { tuition?: Tuition; data?: Tuition })?.tuition ||
            (updated as { tuition?: Tuition; data?: Tuition })?.data || {
              ...editing,
              title: editForm.title.trim(),
              subject: editForm.subject,
              classLevel: editForm.classLevel,
              mode: editForm.mode,
              location: editForm.location.trim(),
              monthlyFee: fee,
              daysPerWeek: Number.isFinite(days) ? days : 3,
              description: editForm.description.trim(),
              bannerImage: editForm.bannerImage,
            };

      setTuitions((prev) =>
        prev.map((item) => (item._id === editing._id ? nextDoc : item))
      );
      toast.success("Tuition updated successfully.");
      setEditing(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update tuition."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleActive = async (t: Tuition) => {
    setBusyId(t._id);
    try {
      await apiFetch(`/api/tuitions/${encodeURIComponent(t._id)}/toggle`, {
        method: "PATCH",
      });
      setTuitions((prev) =>
        prev.map((item) =>
          item._id === t._id ? { ...item, isActive: !item.isActive } : item
        )
      );
      toast.success(
        t.isActive ? "Tuition marked as Closed." : "Tuition marked as Active."
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not toggle status."
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting._id);
    try {
      await apiFetch(`/api/tuitions/${encodeURIComponent(deleting._id)}`, {
        method: "DELETE",
      });
      setTuitions((prev) => prev.filter((item) => item._id !== deleting._id));
      toast.success("Tuition deleted successfully.");
      setDeleting(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete tuition."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-sage-subtle dark:bg-[#1C2B22] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-forest dark:text-[#8EE0BA]">
            <Sparkles className="h-3 w-3 text-clay" />
            Tutor Portfolio
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-forest dark:text-[#8EE0BA] sm:text-3xl">
            My Created Tuitions
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
            Manage your batches, monitor approval statuses, preview listings, or
            update availability.
          </p>
        </div>
        <Link href="/dashboard/tutor/post-tuition">
          <Button size="default" className="shadow-xs hover:shadow-md">
            <PlusCircle className="h-4 w-4" />
            Post New Tuition
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
              Total Listings
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-[#8EE0BA]">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-forest dark:text-[#8EE0BA]">
            {loading ? "…" : totalCount}
          </p>
          <p className="mt-0.5 text-xs text-muted dark:text-[#9DB3A6]">
            All posts created
          </p>
        </div>

        <div className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
              Approved
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {loading ? "…" : approvedCount}
          </p>
          <p className="mt-0.5 text-xs text-muted dark:text-[#9DB3A6]">
            Verified by admin
          </p>
        </div>

        <div className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
              Pending
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {loading ? "…" : pendingCount}
          </p>
          <p className="mt-0.5 text-xs text-muted dark:text-[#9DB3A6]">
            Under review
          </p>
        </div>

        <div className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
              Active Batches
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-clay/10 text-clay">
              <Power className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-clay">
            {loading ? "…" : activeCount}
          </p>
          <p className="mt-0.5 text-xs text-muted dark:text-[#9DB3A6]">
            Accepting students
          </p>
        </div>
      </div>

      {/* Main Listings Card with Search & Filter Tabs */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-sage-border pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-bold text-forest dark:text-[#8EE0BA]">
              All Listings ({filteredTuitions.length})
            </CardTitle>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <Input
                type="search"
                placeholder="Search title, subject, class..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 pl-9 text-xs"
                aria-label="Search listings"
              />
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-xs font-semibold text-muted mr-1 hidden sm:inline-flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => handleStatusFilterChange("all")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                statusFilter === "all"
                  ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-xs"
                  : "bg-sage-subtle dark:bg-[#1C2B22] text-muted hover:text-forest dark:hover:text-[#8EE0BA]"
              )}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange("approved")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                statusFilter === "approved"
                  ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-xs"
                  : "bg-sage-subtle dark:bg-[#1C2B22] text-muted hover:text-forest dark:hover:text-[#8EE0BA]"
              )}
            >
              Approved ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange("pending")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                statusFilter === "pending"
                  ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-xs"
                  : "bg-sage-subtle dark:bg-[#1C2B22] text-muted hover:text-forest dark:hover:text-[#8EE0BA]"
              )}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange("active")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                statusFilter === "active"
                  ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-xs"
                  : "bg-sage-subtle dark:bg-[#1C2B22] text-muted hover:text-forest dark:hover:text-[#8EE0BA]"
              )}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => handleStatusFilterChange("closed")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                statusFilter === "closed"
                  ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-xs"
                  : "bg-sage-subtle dark:bg-[#1C2B22] text-muted hover:text-forest dark:hover:text-[#8EE0BA]"
              )}
            >
              Closed ({closedCount})
            </button>

            {(searchQuery || statusFilter !== "all") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="h-7 px-2 text-xs text-clay hover:text-clay-hover ml-auto"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl border border-sage-border p-4"
                >
                  <Skeleton className="h-24 w-36 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3 rounded-lg" />
                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : tuitions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sage-border bg-sage-bg/50 p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-[#8EE0BA]">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="mt-3 text-lg font-bold text-forest dark:text-[#8EE0BA]">
                You haven&apos;t posted any tuitions yet
              </p>
              <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
                Publish your first subject batch or 1-on-1 mentorship listing to
                connect with students.
              </p>
              <Link
                href="/dashboard/tutor/post-tuition"
                className="mt-5 inline-block"
              >
                <Button>
                  <PlusCircle className="h-4 w-4" />
                  Post a Tuition
                </Button>
              </Link>
            </div>
          ) : filteredTuitions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sage-border bg-sage-bg/40 p-10 text-center">
              <p className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                No tuitions match your current filter
              </p>
              <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6]">
                Try adjusting your search query or switching the status filter
                tab.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedTuitions.map((t) => {
                const isBusy = busyId === t._id;
                const hasBanner = isValidImageUrl(t.bannerImage);

                return (
                  <div
                    key={t._id}
                    className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-sage-border bg-sage-bg/30 dark:bg-[#1A2821] p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-forest/40 dark:hover:border-forest/50 lg:flex-row lg:items-center"
                  >
                    {/* Left: Thumbnail & Badges */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="relative h-24 w-32 sm:h-28 sm:w-40 shrink-0 overflow-hidden rounded-xl border border-sage-border bg-sage-subtle">
                        {hasBanner ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.bannerImage!}
                            alt={t.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-forest to-forest-soft dark:from-[#1A2821] dark:to-[#141F18] p-2 text-white text-center">
                            <BookOpen className="h-6 w-6 text-amber-200/90 mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 line-clamp-1">
                              {t.subject}
                            </span>
                          </div>
                        )}

                        {/* Mode chip on thumbnail */}
                        <div className="absolute left-2 top-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-white/92 dark:bg-[#141F18]/92 px-2 py-0.5 text-[10px] font-bold text-forest dark:text-[#8EE0BA] backdrop-blur-xs shadow-xs">
                            {t.mode === "Online" ? (
                              <Monitor className="h-2.5 w-2.5" />
                            ) : (
                              <MapPin className="h-2.5 w-2.5" />
                            )}
                            {t.mode}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Title, Structured Meta, and Creation Date */}
                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Top row: Statuses + Creation Date */}
                        <div className="flex flex-wrap items-center gap-2">
                          {t.approvalStatus === "approved" ? (
                            <Badge
                              variant="success"
                              className="gap-1 font-semibold"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approved
                            </Badge>
                          ) : t.approvalStatus === "rejected" ? (
                            <Badge
                              variant="danger"
                              className="gap-1 font-semibold"
                            >
                              <XCircle className="h-3 w-3" />
                              Rejected
                            </Badge>
                          ) : (
                            <Badge
                              variant="warning"
                              className="gap-1 font-semibold"
                            >
                              <Clock className="h-3 w-3" />
                              Pending Approval
                            </Badge>
                          )}

                          {/* Show Active/Closed only if NOT rejected */}
                          {t.approvalStatus !== "rejected" && (
                            t.isActive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-border bg-sage-subtle dark:bg-[#1C2B22] px-2.5 py-0.5 text-[11px] font-medium text-muted">
                                <span className="h-1.5 w-1.5 rounded-full bg-muted/60" />
                                Closed
                              </span>
                            )
                          )}

                          {/* Date Display (User Request: তারিখ এড করো) */}
                          <span className="inline-flex items-center gap-1 text-xs text-muted dark:text-[#9DB3A6] sm:ml-auto">
                            <Calendar className="h-3.5 w-3.5 text-clay" />
                            <span>Posted {formatDate(t.createdAt)}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-bold leading-snug text-forest dark:text-[#8EE0BA] line-clamp-1 group-hover:text-clay dark:group-hover:text-[#E58E58] transition-colors">
                          {t.title}
                        </h3>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted dark:text-[#9DB3A6]">
                          <span className="rounded-lg bg-sage-subtle dark:bg-[#1C2B22] px-2.5 py-0.5 font-semibold text-forest dark:text-[#8EE0BA]">
                            {t.subject}
                          </span>
                          <span className="rounded-lg bg-sage-subtle dark:bg-[#1C2B22] px-2.5 py-0.5 font-medium text-muted dark:text-[#9DB3A6]">
                            {t.classLevel}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium">
                            <CalendarDays className="h-3.5 w-3.5 text-clay" />
                            {t.daysPerWeek} days/wk
                          </span>
                          {t.seatLimit !== undefined && (
                            <span
                              className={cn(
                                "rounded-lg px-2 py-0.5 text-[11px] font-bold border",
                                t.isFull || (t.remainingSeats !== undefined && t.remainingSeats <= 0)
                                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
                                  : "bg-sage-subtle text-forest border-sage-border dark:bg-[#1C2B22] dark:text-[#8EE0BA] dark:border-[#2A3E31]"
                              )}
                            >
                              {t.enrolledCount ?? 0}/{t.seatLimit} সিট ({t.isFull ? "পূর্ণ" : `${t.remainingSeats ?? t.seatLimit}টি বাকি`})
                            </span>
                          )}
                          <span className="font-extrabold text-clay text-sm sm:text-base ml-auto sm:ml-1">
                            {formatFee(t.monthlyFee)}
                            <span className="text-xs font-normal text-muted dark:text-[#9DB3A6]">
                              /mo
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions Bar (User Request: ইডিট এর আগে ভিও চোঁখ আইকন এড করো) */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 border-t border-sage-border pt-3 lg:border-t-0 lg:pt-0">
                      {/* 1. View Button (Eye Icon) */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => openViewModal(t)}
                        className="h-8.5 gap-1.5 hover:border-forest/40 hover:text-forest"
                        title="View details and public preview"
                      >
                        <Eye className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA]" />
                        <span>View</span>
                      </Button>

                      {/* 2. Edit Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy || isBlocked}
                        title={isBlocked ? "Your account is blocked." : undefined}
                        onClick={() => openEditModal(t)}
                        className="h-8.5 gap-1.5 hover:border-forest/40"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>

                      {/* 3. Availability Toggle */}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isBusy || t.approvalStatus === "rejected" || isBlocked}
                        title={isBlocked ? "Your account is blocked." : undefined}
                        onClick={() => handleToggleActive(t)}
                        className="h-8.5 gap-1.5"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Power className="h-3.5 w-3.5" />
                        )}
                        <span>{t.isActive ? "Set Closed" : "Set Active"}</span>
                      </Button>

                      {/* 4. Delete Action */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isBusy || isBlocked}
                        title={isBlocked ? "Your account is blocked." : undefined}
                        onClick={() => setDeleting(t)}
                        className="h-8.5 gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                );
              })}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTuitions.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. Quick Preview & Details Modal (View Modal) */}
      <Dialog
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.title || "Tuition Details"}
        description="Quick preview of this tuition post and public availability."
        className="max-w-2xl"
      >
        {viewing && (
          <div className="space-y-5">
            {/* Banner preview */}
            {isValidImageUrl(viewing.bannerImage) ? (
              <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-sage-border bg-sage-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={viewing.bannerImage!}
                  alt={viewing.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-36 w-full flex-col items-center justify-center rounded-2xl bg-linear-to-br from-forest to-forest-soft p-4 text-white">
                <BookOpen className="h-8 w-8 text-amber-200 mb-1" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                  {viewing.subject}
                </span>
              </div>
            )}

            {/* Badges and posted date */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sage-border pb-3">
              <div className="flex flex-wrap items-center gap-2">
                {viewing.approvalStatus === "approved" ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Approved
                  </Badge>
                ) : viewing.approvalStatus === "rejected" ? (
                  <Badge variant="danger" className="gap-1">
                    <XCircle className="h-3 w-3" /> Rejected
                  </Badge>
                ) : (
                  <Badge variant="warning" className="gap-1">
                    <Clock className="h-3 w-3" /> Pending Review
                  </Badge>
                )}
                {viewing.approvalStatus !== "rejected" && (
                  <Badge variant={viewing.isActive ? "sage" : "outline"}>
                    {viewing.isActive ? "Active Batch" : "Closed Batch"}
                  </Badge>
                )}
                <Badge variant="outline">{viewing.mode}</Badge>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted dark:text-[#9DB3A6]">
                <Calendar className="h-3.5 w-3.5 text-clay" />
                Posted: {formatDate(viewing.createdAt)}
              </span>
            </div>

            {/* Structured Info Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-sage-border bg-sage-bg/40 p-3.5">
              <div>
                <p className="text-[11px] font-semibold uppercase text-muted">
                  Subject
                </p>
                <p className="mt-0.5 text-sm font-bold text-forest dark:text-[#8EE0BA]">
                  {viewing.subject}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-muted">
                  Class Level
                </p>
                <p className="mt-0.5 text-sm font-bold text-forest dark:text-[#8EE0BA]">
                  {viewing.classLevel}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-muted">
                  Schedule
                </p>
                <p className="mt-0.5 text-sm font-bold text-forest dark:text-[#8EE0BA]">
                  {viewing.daysPerWeek} days/wk
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-muted">
                  Monthly Fee
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-clay">
                  {formatFee(viewing.monthlyFee)}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-sage-border bg-sage-bg/30 p-3 text-xs">
              <span className="font-semibold text-muted">Location / Mode: </span>
              <span className="font-bold text-forest dark:text-[#8EE0BA]">
                {viewing.location || viewing.mode}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Description &amp; Syllabus
              </h4>
              <p className="text-sm text-ink dark:text-[#EFF5F0] leading-relaxed whitespace-pre-line bg-sage-bg/25 rounded-xl border border-sage-border p-3.5 max-h-48 overflow-y-auto">
                {viewing.description || "No description provided."}
              </p>
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-sage-border">
              <Link
                href={`/tuitions/${viewing._id}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-clay" />
                  Open Public Page
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const toEdit = viewing;
                    setViewing(null);
                    openEditModal(toEdit);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit This Tuition
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setViewing(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* 2. Edit Tuition Modal */}
      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Tuition"
        description="Update your tuition details below. Saved changes take effect immediately."
        className="max-w-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Tuition Title</Label>
            <Input
              id="edit-title"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-subject">Subject</Label>
              <Select
                id="edit-subject"
                value={editForm.subject}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, subject: e.target.value }))
                }
              >
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-level">Class Level</Label>
              <Select
                id="edit-level"
                value={editForm.classLevel}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    classLevel: e.target.value,
                  }))
                }
              >
                {CLASS_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-mode">Mode</Label>
              <Select
                id="edit-mode"
                value={editForm.mode}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    mode: e.target.value as TuitionMode,
                  }))
                }
              >
                {MODE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-fee">Monthly Fee (BDT)</Label>
              <Input
                id="edit-fee"
                type="number"
                min={100}
                value={editForm.monthlyFee}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    monthlyFee: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-days">Days / Week</Label>
              <Input
                id="edit-days"
                type="number"
                min={1}
                max={7}
                value={editForm.daysPerWeek}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    daysPerWeek: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-location">Location / Platform</Label>
            <Input
              id="edit-location"
              value={editForm.location}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Banner Image (ImgBB Upload)</Label>
            <input
              ref={editFileRef}
              type="file"
              accept="image/*"
              onChange={handleReplaceBanner}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              {isValidImageUrl(editForm.bannerImage) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={editForm.bannerImage}
                  alt="Banner preview"
                  className="h-14 w-24 rounded-lg object-cover border border-sage-border"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingBanner}
                onClick={() => editFileRef.current?.click()}
              >
                {uploadingBanner ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {editForm.bannerImage ? "Replace Banner" : "Upload Banner"}
              </Button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted">
                <Link2 className="h-3.5 w-3.5" />
                Or image link:
              </span>
              <Input
                type="url"
                placeholder="https://example.com/banner.jpg"
                value={editForm.bannerImage}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    bannerImage: e.target.value,
                  }))
                }
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Description &amp; Syllabus</Label>
            <Textarea
              id="edit-desc"
              rows={4}
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={savingEdit || uploadingBanner}>
              {savingEdit ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 3. Confirm Delete Dialog */}
      <Dialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete Tuition Listing?"
        description="Are you sure you want to permanently delete this listing? Students will no longer be able to discover or apply to it."
        className="max-w-md"
      >
        {deleting && (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 p-3.5 text-sm text-red-800 dark:text-red-300">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="font-bold">{deleting.title}</p>
                  <p className="text-xs text-red-700/80 dark:text-red-400 mt-0.5">
                    {deleting.subject} &bull; {deleting.classLevel} &bull;{" "}
                    {formatFee(deleting.monthlyFee)}/mo
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleting(null)}
                disabled={busyId === deleting._id}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={busyId === deleting._id}
                className="gap-1.5"
              >
                {busyId === deleting._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
