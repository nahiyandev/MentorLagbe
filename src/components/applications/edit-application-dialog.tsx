"use client";

import * as React from "react";
import { Loader2, Pencil, Phone, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import type { Application } from "@/types";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface EditApplicationDialogProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updated: Application) => void;
}

function EditApplicationFormModal({
  application,
  onOpenChange,
  onSuccess,
}: {
  application: Application;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updated: Application) => void;
}) {
  const [phone, setPhone] = React.useState(application.studentPhone || "");
  const [preferredSchedule, setPreferredSchedule] = React.useState(
    application.preferredSchedule || ""
  );
  const [studentNote, setStudentNote] = React.useState(
    application.studentNote || ""
  );
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Please enter your contact phone number.");
      return;
    }

    setSaving(true);
    try {
      const updated = await apiFetch<Application>(
        `/api/applications/${encodeURIComponent(application._id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            studentPhone: phone.trim(),
            preferredSchedule: preferredSchedule.trim(),
            studentNote: studentNote.trim(),
          }),
        }
      );

      toast.success("Application details updated successfully!");
      onSuccess(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update application."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-app-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-sage-border bg-white dark:bg-[#141F18] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sage-border bg-sage-subtle/50 dark:bg-[#1C2B22]/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F]">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h3
                id="edit-app-title"
                className="text-sm font-bold text-forest dark:text-[#8EE0BA]"
              >
                Edit Application Details
              </h3>
              <p className="text-xs text-muted dark:text-[#9DB3A6] truncate max-w-xs">
                {application.tuitionTitle}
              </p>
            </div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest dark:text-[#8EE0BA] mb-1.5">
              Contact Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="tel"
                required
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-sage-border bg-sage-bg/40 dark:bg-[#18261E] pl-9 pr-3 py-2 text-xs text-ink dark:text-[#EFF5F0] placeholder:text-muted/60 focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest dark:text-[#8EE0BA] mb-1.5">
              Preferred Schedule / Days
            </label>
            <input
              type="text"
              placeholder="e.g. Sat & Mon, 7:00 PM – 9:00 PM"
              value={preferredSchedule}
              onChange={(e) => setPreferredSchedule(e.target.value)}
              className="w-full rounded-xl border border-sage-border bg-sage-bg/40 dark:bg-[#18261E] px-3.5 py-2 text-xs text-ink dark:text-[#EFF5F0] placeholder:text-muted/60 focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/20"
            />
            <p className="mt-1 text-[11px] text-muted dark:text-[#9DB3A6]">
              Update the hours or days that work best for your classes.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest dark:text-[#8EE0BA] mb-1.5">
              Note to Tutor (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add any specific goals, syllabus focus, or upcoming exam dates..."
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              className="w-full rounded-xl border border-sage-border bg-sage-bg/40 dark:bg-[#18261E] px-3.5 py-2 text-xs text-ink dark:text-[#EFF5F0] placeholder:text-muted/60 focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-sage-border">
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
              disabled={saving || !phone.trim()}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditApplicationDialog({
  application,
  open,
  onOpenChange,
  onSuccess,
}: EditApplicationDialogProps) {
  if (!open || !application) return null;

  return (
    <EditApplicationFormModal
      key={application._id}
      application={application}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />
  );
}
