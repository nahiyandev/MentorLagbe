"use client";

import * as React from "react";
import { AlertTriangle, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

interface ReportListingDialogProps {
  open: boolean;
  onClose: () => void;
  tuitionId: string;
  tuitionTitle: string;
}

const REPORT_REASONS = [
  { value: "inaccurate_info", label: "Inaccurate or misleading information" },
  { value: "fake_fee", label: "Fake or misleading monthly fee" },
  { value: "unresponsive_tutor", label: "Unresponsive or fake tutor profile" },
  { value: "inappropriate_content", label: "Inappropriate or offensive content" },
  { value: "other", label: "Other concern" },
];

export function ReportListingDialog({
  open,
  onClose,
  tuitionId,
  tuitionTitle,
}: ReportListingDialogProps) {
  const { data: session } = useSession();
  const [reason, setReason] = React.useState("inaccurate_info");
  const [details, setDetails] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please sign in first to submit a listing report.");
      return;
    }

    if (!details.trim()) {
      toast.error("Please explain the issue in the details field.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch<{ success: boolean; message: string }>("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          tuitionId,
          reason,
          details: details.trim(),
        }),
      });

      if (res?.success) {
        toast.success(res.message || "Report submitted successfully.");
        setDetails("");
        onClose();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit report"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Report Tuition Listing"
      description={`Report "${tuitionTitle}" for misleading, false, or policy-violating information.`}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="reportReason" className="text-xs font-semibold">
            Reason for reporting
          </Label>
          <Select
            id="reportReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="text-xs"
          >
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reportDetails" className="text-xs font-semibold">
            Details / Evidence
          </Label>
          <Textarea
            id="reportDetails"
            placeholder="Please provide specific details on why this listing is inaccurate or suspicious..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            rows={4}
            className="text-xs resize-none"
          />
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            False reports can harm verified educators. Our admin moderation team investigates every report thoroughly.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-sage-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={submitting}
            className="gap-1.5"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Flag className="h-3.5 w-3.5" />
            )}
            <span>Submit Report</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
