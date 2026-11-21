"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Pencil,
  Star,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import type { Application } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { formatDate, formatFee } from "@/lib/utils";
import { AdmissionSlipDialog } from "@/components/tuitions/admission-slip-dialog";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { ApplicationTimeline } from "@/components/applications/application-timeline";
import { EditApplicationDialog } from "@/components/applications/edit-application-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentMyApplicationsPage() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // Dialog states
  const [slipApp, setSlipApp] = React.useState<Application | null>(null);
  const [slipOpen, setSlipOpen] = React.useState(false);
  const [reviewApp, setReviewApp] = React.useState<Application | null>(null);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [editApp, setEditApp] = React.useState<Application | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch<unknown>("/api/applications/my-applications");
        if (active) {
          setApplications(extractList<Application>(res, "applications"));
          setError(null);
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError(
              "Backend JWT token is missing or expired. Once POST /api/auth/jwt is live on the server, sign in again to load your applications."
            );
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load your applications."
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

  const handleCancel = async (app: Application) => {
    if (app.status !== "pending") return;
    setDeletingId(app._id);
    try {
      await apiFetch(`/api/applications/${encodeURIComponent(app._id)}`, {
        method: "DELETE",
      });
      setApplications((prev) => prev.filter((item) => item._id !== app._id));
      toast.success("Application cancelled successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not cancel application."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleApplicationUpdated = (updated: Application) => {
    setApplications((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item))
    );
  };

  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
  const paginatedApplications = applications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl dark:text-[#8EE0BA]">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
            Track every tuition application with step-by-step progress. Edit details or preferred schedule anytime before tutor review.
          </p>
        </div>
        <Link href="/tuitions">
          <Button>
            <BookOpen className="h-4 w-4" />
            Browse More Tuitions
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Submitted Applications ({loading ? "…" : applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 dark:bg-[#101A14] p-10 text-center">
              <p className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                No applications found
              </p>
              <p className="mt-1 text-sm text-muted dark:text-[#9DB3A6]">
                Browse approved tuitions and apply to get started.
              </p>
              <Link href="/tuitions" className="mt-5 inline-block">
                <Button size="sm">Browse Tuitions</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-sage-border text-xs uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                      <th className="pb-3 pr-4 font-bold">Tuition</th>
                      <th className="pb-3 px-4 font-bold">Tutor</th>
                      <th className="pb-3 px-4 font-bold">Monthly Fee</th>
                      <th className="pb-3 px-4 font-bold">Applied Date</th>
                      <th className="pb-3 px-4 font-bold">Status &amp; Timeline</th>
                      <th className="pb-3 pl-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-border">
                    {paginatedApplications.map((app) => (
                      <React.Fragment key={app._id}>
                        <tr className="hover:bg-sage-bg/40 dark:hover:bg-[#141F18]/60 transition-colors">
                          <td className="py-4 pr-4">
                            <Link
                              href={`/tuitions/${app.tuitionId}`}
                              className="font-bold text-forest dark:text-[#8EE0BA] hover:text-clay transition-colors"
                            >
                              {app.tuitionTitle}
                            </Link>
                            <p className="text-xs text-muted dark:text-[#9DB3A6]">{app.subject}</p>
                          </td>
                          <td className="py-4 px-4">
                            <Link
                              href={`/tutors/${encodeURIComponent(app.tutorEmail)}`}
                              className="font-semibold text-ink dark:text-[#EFF5F0] hover:text-clay dark:hover:text-[#E58E58] transition-colors"
                            >
                              {app.tutorName || "Tutor"}
                            </Link>
                            <p className="text-xs text-muted dark:text-[#9DB3A6]">{app.tutorEmail}</p>
                          </td>
                          <td className="py-4 px-4 font-bold text-clay">
                            {formatFee(app.monthlyFee)}
                          </td>
                          <td className="py-4 px-4 text-muted dark:text-[#9DB3A6]">
                            {formatDate(app.appliedAt || app.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col items-start gap-1">
                              <Badge
                                variant={
                                  app.status === "accepted"
                                    ? "success"
                                    : app.status === "rejected"
                                      ? "danger"
                                      : "warning"
                                }
                                className="capitalize"
                              >
                                {app.status}
                              </Badge>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId(
                                    expandedId === app._id ? null : app._id
                                  )
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest dark:text-[#8EE0BA] hover:underline cursor-pointer"
                              >
                                <span>{expandedId === app._id ? "Hide Timeline" : "View Timeline"}</span>
                                {expandedId === app._id ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {app.status === "accepted" && (
                                <>
                                  {app.meetLink ? (
                                    <a
                                      href={app.meetLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-xs"
                                      title="Open Google Meet Class"
                                    >
                                      <Video className="h-3.5 w-3.5" />
                                      Join Class
                                    </a>
                                  ) : (
                                    <span className="text-[11px] text-muted dark:text-[#9DB3A6] italic px-1">
                                      Meet pending
                                    </span>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs"
                                    onClick={() => {
                                      setSlipApp(app);
                                      setSlipOpen(true);
                                    }}
                                  >
                                    <Download className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA]" />
                                    Slip
                                  </Button>
                                  <Button
                                    variant="accent"
                                    size="sm"
                                    className="gap-1 text-xs"
                                    onClick={() => {
                                      setReviewApp(app);
                                      setReviewOpen(true);
                                    }}
                                  >
                                    <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                                    Review
                                  </Button>
                                </>
                              )}
                              {app.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs border-forest/30 text-forest dark:text-[#8EE0BA] hover:bg-sage-subtle dark:hover:bg-[#1C2B22]"
                                    onClick={() => {
                                      setEditApp(app);
                                      setEditOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-3 w-3 text-clay" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={deletingId === app._id}
                                    onClick={() => handleCancel(app)}
                                  >
                                    {deletingId === app._id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                    Cancel
                                  </Button>
                                </>
                              )}
                              {app.status === "rejected" && (
                                <span className="text-xs text-muted dark:text-[#9DB3A6]">
                                  Closed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Step-by-Step Progress Timeline */}
                        {expandedId === app._id && (
                          <tr className="bg-sage-bg/30 dark:bg-[#101A14]/70">
                            <td colSpan={6} className="p-4 sm:p-5">
                              <ApplicationTimeline application={app} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {paginatedApplications.map((app) => (
                  <div
                    key={app._id}
                    className="rounded-xl border border-sage-border bg-sage-bg/40 dark:bg-[#18261E] p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/tuitions/${app.tuitionId}`}
                          className="font-bold text-forest dark:text-[#8EE0BA] hover:text-clay"
                        >
                          {app.tuitionTitle}
                        </Link>
                        <p className="text-xs text-muted dark:text-[#9DB3A6]">{app.subject}</p>
                      </div>
                      <Badge
                        variant={
                          app.status === "accepted"
                            ? "success"
                            : app.status === "rejected"
                              ? "danger"
                              : "warning"
                        }
                        className="capitalize shrink-0"
                      >
                        {app.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted dark:text-[#9DB3A6] space-y-1">
                      <p>
                        <strong className="text-ink dark:text-[#EFF5F0]">Tutor:</strong>{" "}
                        <Link
                          href={`/tutors/${encodeURIComponent(app.tutorEmail)}`}
                          className="font-semibold text-forest dark:text-[#8EE0BA] hover:underline"
                        >
                          {app.tutorName || "Tutor"}
                        </Link>{" "}
                        ({app.tutorEmail})
                      </p>
                      <p>
                        <strong className="text-ink dark:text-[#EFF5F0]">Fee:</strong>{" "}
                        <span className="font-bold text-clay">
                          {formatFee(app.monthlyFee)}
                        </span>
                      </p>
                      <p>
                        <strong className="text-ink dark:text-[#EFF5F0]">Applied:</strong>{" "}
                        {formatDate(app.appliedAt || app.createdAt)}
                      </p>
                    </div>

                    {/* Step-by-Step Timeline Preview */}
                    <div className="pt-2 border-t border-sage-border">
                      <ApplicationTimeline application={app} compact />
                    </div>

                    {expandedId === app._id && (
                      <div className="pt-2">
                        <ApplicationTimeline application={app} />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expandedId === app._id ? null : app._id)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest dark:text-[#8EE0BA] hover:underline cursor-pointer"
                      >
                        <span>{expandedId === app._id ? "Hide Detailed Steps" : "Detailed Timeline"}</span>
                        {expandedId === app._id ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {app.status === "accepted" && (
                      <div className="space-y-2 pt-1">
                        {app.meetLink ? (
                          <a
                            href={app.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] px-3 py-2 text-xs font-bold text-white transition-colors w-full shadow-xs"
                          >
                            <Video className="h-4 w-4" />
                            Join Live Class (Google Meet)
                          </a>
                        ) : (
                          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 px-2.5 py-1.5 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            Google Meet link pending from tutor
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1 text-xs"
                            onClick={() => {
                              setSlipApp(app);
                              setSlipOpen(true);
                            }}
                          >
                            <Download className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA]" />
                            Download Slip
                          </Button>
                          <Button
                            variant="accent"
                            size="sm"
                            className="w-full gap-1 text-xs"
                            onClick={() => {
                              setReviewApp(app);
                              setReviewOpen(true);
                            }}
                          >
                            <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                            Rate Tutor
                          </Button>
                        </div>
                      </div>
                    )}

                    {app.status === "pending" && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1 text-xs border-forest/30 text-forest dark:text-[#8EE0BA]"
                          onClick={() => {
                            setEditApp(app);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-clay" />
                          Edit Details
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          disabled={deletingId === app._id}
                          onClick={() => handleCancel(app)}
                        >
                          {deletingId === app._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={applications.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Application Dialog */}
      <EditApplicationDialog
        application={editApp}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={handleApplicationUpdated}
      />

      {/* Slip Dialog */}
      <AdmissionSlipDialog
        application={slipApp}
        open={slipOpen}
        onOpenChange={setSlipOpen}
      />

      {/* Review Dialog */}
      {reviewApp && (
        <ReviewDialog
          tuitionId={reviewApp.tuitionId}
          tuitionTitle={reviewApp.tuitionTitle}
          open={reviewOpen}
          onOpenChange={setReviewOpen}
        />
      )}
    </div>
  );
}
