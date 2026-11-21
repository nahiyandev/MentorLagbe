"use client";

import * as React from "react";
import { CheckCircle2, Download, Printer, ShieldCheck, Video, X } from "lucide-react";
import type { Application } from "@/types";
import { formatDate, formatFee } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdmissionSlipDialogProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdmissionSlipDialog({
  application,
  open,
  onOpenChange,
}: AdmissionSlipDialogProps) {
  const slipRef = React.useRef<HTMLDivElement>(null);

  if (!open || !application) return null;

  const refCode = `ML-${application._id.slice(-6).toUpperCase()}`;
  const appliedDate = formatDate(application.appliedAt || application.createdAt);
  const isAccepted = application.status === "accepted";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slip-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-sage-border bg-white dark:bg-[#141F18] shadow-2xl">
        {/* Modal Toolbar (hidden during print) */}
        <div className="flex items-center justify-between border-b border-sage-border px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-subtle dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA]">
              <Download className="h-4 w-4" />
            </span>
            <div>
              <h2 id="slip-dialog-title" className="text-sm font-bold text-forest dark:text-[#8EE0BA]">
                Tuition Admission &amp; Enrollment Slip
              </h2>
              <p className="text-xs text-muted dark:text-[#9DB3A6]">
                Ref Code: <span className="font-mono font-semibold">{refCode}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5 cursor-pointer">
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </Button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 text-muted hover:bg-sage-subtle hover:text-forest dark:hover:bg-[#1C2B22] cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Content */}
        <div className="overflow-y-auto p-6 sm:p-8" ref={slipRef}>
          <div className="rounded-2xl border-2 border-forest/20 dark:border-[#8EE0BA]/20 bg-linear-to-b from-white via-sage-bg/30 to-white dark:from-[#141F18] dark:via-[#1A2821]/30 dark:to-[#141F18] p-6 sm:p-8 shadow-xs">
            {/* Header with Brand & Official Stamp */}
            <div className="flex flex-col items-start justify-between gap-4 border-b-2 border-dashed border-sage-border pb-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest dark:bg-[#8EE0BA] font-extrabold text-white dark:text-[#0C130F]">
                    ML
                  </span>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-forest dark:text-[#8EE0BA]">
                      Mentor<span className="text-clay">Lagbe</span>
                    </h1>
                    <p className="text-[11px] font-semibold tracking-wider text-muted dark:text-[#9DB3A6] uppercase">
                      Official Tuition Admission Slip
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted dark:text-[#9DB3A6]">
                  Smart Tuition &amp; 1-on-1 Mentorship Platform &bull; mentor-lagbe.vercel.app
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1">
                <Badge
                  variant={isAccepted ? "success" : "warning"}
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isAccepted ? "Verified Enrollment" : "Application Pending"}
                </Badge>
                <span className="font-mono text-xs font-bold text-forest dark:text-[#8EE0BA]">
                  {refCode}
                </span>
                <span className="text-[11px] text-muted dark:text-[#9DB3A6]">
                  Date: {appliedDate}
                </span>
              </div>
            </div>

            {/* Tuition Information Block */}
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-sage-subtle/50 dark:bg-[#1C2B22]/50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                  Tuition Batch Details
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-forest dark:text-[#8EE0BA]">
                  {application.tuitionTitle}
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div>
                    <span className="text-muted dark:text-[#9DB3A6]">Subject:</span>
                    <p className="font-bold text-ink dark:text-[#EFF5F0]">{application.subject}</p>
                  </div>
                  <div>
                    <span className="text-muted dark:text-[#9DB3A6]">Monthly Fee:</span>
                    <p className="font-extrabold text-clay">{formatFee(application.monthlyFee)}</p>
                  </div>
                  <div>
                    <span className="text-muted dark:text-[#9DB3A6]">Batch Status:</span>
                    <p className="font-bold capitalize text-forest dark:text-[#8EE0BA]">
                      {application.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Student & Tutor 2-column breakdown */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Student Info */}
                <div className="rounded-xl border border-sage-border p-4 space-y-2">
                  <div className="flex items-center gap-1.5 border-b border-sage-border pb-2">
                    <ShieldCheck className="h-4 w-4 text-forest dark:text-[#8EE0BA]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-forest dark:text-[#8EE0BA]">
                      Student Information
                    </h4>
                  </div>
                  <div className="text-xs space-y-1.5 pt-1">
                    <p>
                      <span className="text-muted dark:text-[#9DB3A6]">Name:</span>{" "}
                      <strong className="text-ink dark:text-[#EFF5F0]">{application.studentName}</strong>
                    </p>
                    <p>
                      <span className="text-muted dark:text-[#9DB3A6]">Email:</span>{" "}
                      <span className="text-ink dark:text-[#EFF5F0]">{application.studentEmail}</span>
                    </p>
                    <p>
                      <span className="text-muted dark:text-[#9DB3A6]">Phone:</span>{" "}
                      <span className="font-mono text-ink dark:text-[#EFF5F0]">
                        {application.studentPhone}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted dark:text-[#9DB3A6]">Preferred Schedule:</span>{" "}
                      <span className="font-medium text-forest dark:text-[#8EE0BA]">
                        {application.preferredSchedule}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Tutor Info */}
                <div className="rounded-xl border border-sage-border p-4 space-y-2">
                  <div className="flex items-center gap-1.5 border-b border-sage-border pb-2">
                    <ShieldCheck className="h-4 w-4 text-clay" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-clay">
                      Tutor Information
                    </h4>
                  </div>
                  <div className="text-xs space-y-1.5 pt-1">
                    <p>
                      <span className="text-muted dark:text-[#9DB3A6]">Tutor Name:</span>{" "}
                      <strong className="text-ink dark:text-[#EFF5F0]">
                        {application.tutorName || "Assigned Tutor"}
                      </strong>
                    </p>
                    <p>
                      <span className="text-muted dark:text-[#9DB3A6]">Contact Email:</span>{" "}
                      <span className="text-ink dark:text-[#EFF5F0]">{application.tutorEmail}</span>
                    </p>
                    <p>
                      <span className="text-muted dark:text-[#9DB3A6]">Verification:</span>{" "}
                      <span className="font-bold text-forest dark:text-[#8EE0BA]">
                        Admin Verified Educator
                      </span>
                    </p>
                    <p>
                      <span className="text-muted dark:text-[#9DB3A6]">Platform Guarantee:</span>{" "}
                      <span className="text-muted dark:text-[#9DB3A6]">
                        Direct batch coordination protected
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Meet Online Class Link */}
              {application.meetLink && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      Live Class Link (Google Meet):
                    </p>
                    <p className="font-mono text-[11px] text-blue-700 dark:text-blue-300 truncate">
                      {application.meetLink}
                    </p>
                  </div>
                  <a
                    href={application.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] px-3 py-1.5 text-xs font-bold text-white transition-colors"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Join Class
                  </a>
                </div>
              )}

              {/* Student Note */}
              {application.studentNote && (
                <div className="rounded-xl border border-sage-border/80 bg-sage-bg/30 dark:bg-[#1A2821]/30 p-3.5 text-xs">
                  <p className="font-bold text-muted dark:text-[#9DB3A6]">Student Application Note:</p>
                  <p className="mt-1 italic text-ink dark:text-[#EFF5F0]">
                    &ldquo;{application.studentNote}&rdquo;
                  </p>
                </div>
              )}

              {/* Terms & Verification Footer */}
              <div className="mt-6 border-t border-sage-border pt-4 text-[11px] text-muted dark:text-[#9DB3A6] space-y-1">
                <div className="flex items-center justify-between">
                  <p>
                    This is an electronically generated slip for MentorLagbe smart tuition enrollment.
                  </p>
                  <span className="font-mono text-[10px] text-forest dark:text-[#8EE0BA]">
                    AUTHENTICATED
                  </span>
                </div>
                <p>
                  Keep this slip for batch admission, tutor reference, and fee receipt confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
