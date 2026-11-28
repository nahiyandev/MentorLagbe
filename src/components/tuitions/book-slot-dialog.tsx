"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BookSlotDialogProps {
  open: boolean;
  onClose: () => void;
  tuitionId: string;
  tuitionTitle: string;
  tutorName: string;
  slotDay: string;
  slotTime: string;
  monthlyFee?: number;
  onSuccess: (slotKey: string) => void;
}

export function BookSlotDialog({
  open,
  onClose,
  tuitionId,
  tuitionTitle,
  tutorName,
  slotDay,
  slotTime,
  monthlyFee,
  onSuccess,
}: BookSlotDialogProps) {
  const { data: session } = useSession();
  const [phone, setPhone] = React.useState("");
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const slotKey = `${slotDay.slice(0, 3)}: ${slotTime.trim()}`;
  const isStudent = session?.user?.role === "student";

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Please sign in to book this slot.");
      return;
    }
    if (!isStudent) {
      toast.error("Only registered students can book tuition slots.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 6) {
      toast.error("Please provide a valid contact phone number.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/applications/book-slot", {
        method: "POST",
        body: JSON.stringify({
          tuitionId,
          slotDay,
          slotTime,
          studentPhone: phone.trim(),
          studentNote: note.trim(),
        }),
      });

      toast.success(`🎉 Slot "${slotKey}" successfully booked!`);
      onSuccess(slotKey);
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to book this slot."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!submitting) onClose();
      }}
      title="Direct Slot Booking"
      description="Reserve this class slot directly with the tutor. Once booked, this slot will be locked for you."
      className="max-w-md"
    >
      {!session?.user ? (
        <div className="space-y-4 pt-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 dark:bg-[#8EE0BA]/15 text-forest dark:text-[#8EE0BA]">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <p className="text-sm text-ink dark:text-[#EFF5F0]">
            Sign in as a student to book the slot:{" "}
            <strong className="text-forest dark:text-[#8EE0BA]">
              {slotDay} ({slotTime})
            </strong>
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Link href="/sign-in">
              <Button>Sign In to Book</Button>
            </Link>
          </div>
        </div>
      ) : !isStudent ? (
        <div className="space-y-4 pt-3 text-center">
          <p className="text-sm text-muted dark:text-[#9DB3A6]">
            You are signed in as an {session.user.role}. Slot booking is exclusive to students.
          </p>
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-4 pt-2">
          {/* Slot Highlight Summary */}
          <div className="rounded-2xl border border-sage-border bg-sage-bg/30 dark:bg-[#1C2B22]/40 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted dark:text-[#9DB3A6] uppercase tracking-wider">
                Selected Slot
              </span>
              <Badge variant="clay" className="gap-1 text-xs font-black">
                <Sparkles className="h-3 w-3" />
                Instant Lock
              </Badge>
            </div>
            {Boolean(tuitionTitle) && (
              <p className="text-xs font-bold text-forest dark:text-[#8EE0BA] line-clamp-1">
                Batch: {tuitionTitle}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-forest dark:text-[#8EE0BA]" />
              <p className="text-base font-extrabold text-forest dark:text-[#8EE0BA]">
                {slotDay}, {slotTime}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted dark:text-[#9DB3A6] border-t border-sage-border/60 pt-2">
              <span>Tutor: <strong className="text-ink dark:text-[#EFF5F0]">{tutorName}</strong></span>
              {Boolean(monthlyFee) && (
                <span>Fee: <strong className="text-clay">৳{monthlyFee}/mo</strong></span>
              )}
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <Label htmlFor="slotPhone" className="text-xs font-bold text-forest dark:text-[#8EE0BA]">
              Contact Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slotPhone"
              type="tel"
              required
              placeholder="e.g. 01700000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-sm bg-white dark:bg-[#141F18]"
            />
          </div>

          {/* Student Note */}
          <div className="space-y-1.5">
            <Label htmlFor="slotNote" className="text-xs font-bold text-forest dark:text-[#8EE0BA]">
              Learning Goal / Note (Optional)
            </Label>
            <Textarea
              id="slotNote"
              rows={2}
              placeholder="e.g. Need focus on Calculus chapters; preferred online via Google Meet."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-sm bg-white dark:bg-[#141F18]"
            />
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2 text-[11px] text-muted dark:text-[#9DB3A6] bg-emerald-50/50 dark:bg-[#1C2B22]/20 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-900/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Direct booking secures this exact class time on the tutor&apos;s schedule immediately.
            </p>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-sage-border">
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 font-bold cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="h-4 w-4" />
                  <span>Confirm Slot Booking</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
