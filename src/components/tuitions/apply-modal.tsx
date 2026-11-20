"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import type { Tuition } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  tuition: Tuition;
  defaultPhone?: string;
  onSuccess: () => void;
}

export function ApplyModal({
  open,
  onClose,
  tuition,
  defaultPhone = "",
  onSuccess,
}: ApplyModalProps) {
  const { data: session } = useSession();
  const [studentPhone, setStudentPhone] = React.useState<string | null>(null);
  const [preferredSchedule, setPreferredSchedule] = React.useState("");
  const [studentNote, setStudentNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const phoneValue = studentPhone ?? defaultPhone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneValue.trim() || phoneValue.trim().length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    if (!preferredSchedule.trim()) {
      toast.error("Please specify your preferred schedule.");
      return;
    }
    if (!studentNote.trim() || studentNote.trim().length < 10) {
      toast.error("Please add a brief learning note (at least 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          tuitionId: tuition._id,
          studentPhone: phoneValue.trim(),
          preferredSchedule: preferredSchedule.trim(),
          studentNote: studentNote.trim(),
          studentName: session?.user?.name?.trim() || "Student",
        }),
      });

      toast.success("Application submitted! The tutor will review it soon.");
      setPreferredSchedule("");
      setStudentNote("");
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("You have already applied for this tuition.");
        } else if (err.status === 401) {
          toast.error(
            "Your backend session token is missing or expired. Please sign in again."
          );
        } else if (err.status === 403) {
          toast.error("Only student accounts can apply for tuitions.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Apply for Tuition"
      description={`${tuition.title} — ${tuition.subject} (${tuition.classLevel})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="studentPhone">Contact Phone Number</Label>
          <Input
            id="studentPhone"
            type="tel"
            placeholder="e.g., +880 1711-000000"
            value={phoneValue}
            onChange={(e) => setStudentPhone(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferredSchedule">Preferred Schedule</Label>
          <Input
            id="preferredSchedule"
            type="text"
            placeholder="e.g., Sat/Mon/Wed evenings after 6 PM"
            value={preferredSchedule}
            onChange={(e) => setPreferredSchedule(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="studentNote">Learning Goals &amp; Note</Label>
          <Textarea
            id="studentNote"
            rows={4}
            placeholder="Share your current class/level, topics you want to focus on, and any questions for the tutor..."
            value={studentNote}
            onChange={(e) => setStudentNote(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
