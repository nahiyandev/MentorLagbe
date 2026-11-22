"use client";

import * as React from "react";
import { Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAccountStatus } from "@/context/account-status-context";
import { Button } from "@/components/ui/button";

interface ReviewDialogProps {
  tuitionId: string;
  tuitionTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  existingRating?: number;
  existingFeedback?: string;
}

interface ResolvedReviewState {
  rating: number;
  feedback: string;
  isExisting: boolean;
}

export function ReviewDialog({
  tuitionId,
  tuitionTitle,
  open,
  onOpenChange,
  onSuccess,
  existingRating,
  existingFeedback,
}: ReviewDialogProps) {
  if (!open) return null;

  return (
    <ReviewDialogModal
      tuitionId={tuitionId}
      tuitionTitle={tuitionTitle}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      initialRating={existingRating}
      initialFeedback={existingFeedback}
    />
  );
}

function ReviewDialogModal({
  tuitionId,
  tuitionTitle,
  onOpenChange,
  onSuccess,
  initialRating,
  initialFeedback,
}: {
  tuitionId: string;
  tuitionTitle: string;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialRating?: number;
  initialFeedback?: string;
}) {
  const hasConcreteInitial =
    typeof initialRating === "number" && initialRating > 0;

  const [loading, setLoading] = React.useState(!hasConcreteInitial);
  const [resolved, setResolved] = React.useState<ResolvedReviewState | null>(
    () => {
      if (hasConcreteInitial) {
        return {
          rating: initialRating,
          feedback: initialFeedback || "",
          isExisting: true,
        };
      }
      return null;
    }
  );

  React.useEffect(() => {
    if (hasConcreteInitial) return;
    let active = true;

    async function fetchReview() {
      setLoading(true);
      try {
        const res = await apiFetch<{
          canReview: boolean;
          existingReview?: { rating: number; feedback: string } | null;
        }>(`/api/reviews/can-review/${encodeURIComponent(tuitionId)}`);

        if (active) {
          if (res?.existingReview) {
            setResolved({
              rating: res.existingReview.rating || 5,
              feedback: res.existingReview.feedback || "",
              isExisting: true,
            });
          } else {
            setResolved({
              rating: 5,
              feedback: "",
              isExisting: false,
            });
          }
        }
      } catch {
        if (active) {
          setResolved({
            rating: 5,
            feedback: "",
            isExisting: false,
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchReview();
    return () => {
      active = false;
    };
  }, [tuitionId, hasConcreteInitial]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-sage-border bg-white dark:bg-[#141F18] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-sage-border pb-4">
          <div>
            <h2
              id="review-dialog-title"
              className="text-lg font-bold text-forest dark:text-[#8EE0BA]"
            >
              {loading
                ? "Review Details"
                : resolved?.isExisting
                ? "Edit Your Review"
                : "Rate & Review Tuition"}
            </h2>
            <p className="text-xs text-muted dark:text-[#9DB3A6] line-clamp-1">
              {tuitionTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted hover:bg-sage-subtle hover:text-forest dark:hover:bg-[#1C2B22] cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading state — strictly prevents flashing default 5★ + empty before load */}
        {loading || !resolved ? (
          <div className="py-14 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-forest dark:text-[#8EE0BA]" />
            <div>
              <p className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
                Loading review details...
              </p>
              <p className="text-xs text-muted dark:text-[#9DB3A6] mt-0.5">
                Checking for your previously submitted rating and feedback
              </p>
            </div>
          </div>
        ) : (
          <ReviewForm
            tuitionId={tuitionId}
            initialData={resolved}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </div>
    </div>
  );
}

function ReviewForm({
  tuitionId,
  initialData,
  onOpenChange,
  onSuccess,
}: {
  tuitionId: string;
  initialData: ResolvedReviewState;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [rating, setRating] = React.useState<number>(initialData.rating);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [feedback, setFeedback] = React.useState<string>(initialData.feedback);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const { isBlocked } = useAccountStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      toast.error("Your account is blocked. Contact support to appeal.");
      return;
    }
    if (!feedback.trim()) {
      toast.error("Please enter your feedback comment.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          tuitionId,
          rating,
          feedback: feedback.trim(),
        }),
      });

      toast.success(
        initialData.isExisting
          ? "Thank you! Your review has been updated."
          : "Thank you! Your review has been submitted."
      );
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to submit review. Only accepted students can review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeStarCount = hoverRating || rating;

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
      {/* Star selector */}
      <div className="space-y-2 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
          Your Rating (1 to 5 Stars)
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110 cursor-pointer"
              aria-label={`Rate ${star} star`}
            >
              <Star
                className={`h-8 w-8 ${
                  star <= activeStarCount
                    ? "fill-amber-400 text-amber-400"
                    : "text-sage-border stroke-1"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-xs font-semibold text-clay">
          {activeStarCount === 5 && "Outstanding — Highly Recommended!"}
          {activeStarCount === 4 && "Very Good — Clear and Helpful"}
          {activeStarCount === 3 && "Good — Met Expectations"}
          {activeStarCount === 2 && "Fair — Needs Improvement"}
          {activeStarCount === 1 && "Poor Experience"}
        </p>
      </div>

      {/* Feedback textarea */}
      <div className="space-y-1.5">
        <label
          htmlFor="review-feedback"
          className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]"
        >
          Your Feedback &amp; Experience
        </label>
        <textarea
          id="review-feedback"
          rows={4}
          required
          placeholder="Share how this batch or tutor helped your study, teaching methodology, punctuality, and syllabus coverage..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full rounded-xl border border-sage-border bg-sage-bg/30 dark:bg-[#18261E] p-3 text-sm text-ink dark:text-[#EFF5F0] placeholder:text-muted/60 focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/20"
        />
      </div>

      <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-sage-border">
        {isBlocked ? (
          <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
            Your account is blocked.
          </p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={submitting || isBlocked}
            className="gap-1.5"
            title={isBlocked ? "Your account is blocked." : undefined}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{initialData.isExisting ? "Update Review" : "Submit Review"}</span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
