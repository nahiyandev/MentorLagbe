"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Info,
  Mail,
  MapPin,
  Monitor,
  ShieldCheck,
  User,
} from "lucide-react";
import type { Tuition } from "@/types";
import { ApiError, apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  formatDate,
  formatFee,
  getInitials,
  isValidImageUrl,
  normalizeRole,
} from "@/lib/utils";
import { SiteShell } from "@/components/layout/site-shell";
import { ApplyModal } from "@/components/tuitions/apply-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { data: session, isPending: sessionLoading } = useSession();

  const [tuition, setTuition] = React.useState<Tuition | null>(null);
  const [loadedId, setLoadedId] = React.useState<string | null>(null);
  const [notFoundError, setNotFoundError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [applyOpen, setApplyOpen] = React.useState(false);
  const [applied, setApplied] = React.useState(false);

  const loading = loadedId !== id;

  const user = session?.user as
    | {
        name?: string;
        email?: string;
        role?: string;
        phone?: string;
      }
    | undefined;
  const role = user ? normalizeRole(user.role) : null;

  React.useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await apiFetch<Tuition | { tuition?: Tuition; data?: Tuition }>(
          `/api/tuitions/${encodeURIComponent(id)}`
        );
        const item =
          res && typeof res === "object" && "_id" in res
            ? (res as Tuition)
            : (res as { tuition?: Tuition; data?: Tuition })?.tuition ||
              (res as { tuition?: Tuition; data?: Tuition })?.data ||
              null;

        if (active) {
          if (!item) {
            setTuition(null);
            setNotFoundError(true);
            setErrorMessage(null);
          } else {
            setTuition(item);
            setNotFoundError(false);
            setErrorMessage(null);
          }
        }
      } catch (err) {
        if (active) {
          setTuition(null);
          if (err instanceof ApiError && err.status === 404) {
            setNotFoundError(true);
            setErrorMessage(null);
          } else {
            setNotFoundError(false);
            setErrorMessage(
              err instanceof Error
                ? err.message
                : "Could not load tuition details."
            );
          }
        }
      } finally {
        if (active) setLoadedId(id);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/tuitions"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-forest transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse Tuitions
        </Link>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-72 w-full rounded-2xl" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        ) : notFoundError || !tuition ? (
          <Card className="p-12 text-center">
            <h1 className="text-2xl font-extrabold text-forest">
              Tuition listing not found
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              {errorMessage ||
                "This tuition may be pending approval, closed by the tutor, or removed."}
            </p>
            <Link href="/tuitions" className="mt-6 inline-block">
              <Button>Explore Available Tuitions</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main Details Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Banner */}
              <div className="overflow-hidden rounded-2xl border border-sage-border bg-white shadow-xs">
                <div className="relative h-64 sm:h-80 w-full bg-sage-subtle">
                  {isValidImageUrl(tuition.bannerImage) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tuition.bannerImage!}
                      alt={tuition.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-forest to-forest-soft text-white p-8">
                      <BookOpen className="h-12 w-12 text-amber-200 mb-3" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white/80">
                        {tuition.subject} — {tuition.classLevel}
                      </span>
                    </div>
                  )}
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge variant="default" className="px-3 py-1">
                      {tuition.subject}
                    </Badge>
                    <Badge
                      variant={tuition.mode === "Online" ? "sage" : "clay"}
                      className="bg-white/95 px-3 py-1"
                    >
                      {tuition.mode === "Online" ? (
                        <Monitor className="h-3.5 w-3.5" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5" />
                      )}
                      {tuition.mode}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
                    <span className="inline-flex items-center gap-1 rounded-full bg-sage-bg px-3 py-1 text-forest">
                      <GraduationCap className="h-3.5 w-3.5 text-clay" />
                      {tuition.classLevel}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Admin Approved
                    </span>
                    {tuition.createdAt && (
                      <span>Posted {formatDate(tuition.createdAt)}</span>
                    )}
                  </div>

                  <h1 className="mt-4 text-2xl font-extrabold text-forest sm:text-3xl">
                    {tuition.title}
                  </h1>

                  {/* Key Facts Grid */}
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-sage-border bg-sage-bg/60 p-3.5">
                      <p className="text-xs font-semibold text-muted">
                        Weekly Schedule
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-forest">
                        <CalendarDays className="h-4 w-4 text-clay" />
                        {tuition.daysPerWeek} days / week
                      </p>
                    </div>
                    <div className="rounded-xl border border-sage-border bg-sage-bg/60 p-3.5">
                      <p className="text-xs font-semibold text-muted">
                        Mode &amp; Format
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-forest">
                        <Monitor className="h-4 w-4 text-clay" />
                        {tuition.mode}
                      </p>
                    </div>
                    <div className="rounded-xl border border-sage-border bg-sage-bg/60 p-3.5">
                      <p className="text-xs font-semibold text-muted">
                        Location
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-bold text-forest">
                        <MapPin className="h-4 w-4 shrink-0 text-clay" />
                        <span className="truncate">
                          {tuition.location || "Online / Flexible"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-8 border-t border-sage-border pt-6">
                    <h2 className="text-lg font-bold text-forest">
                      About This Tuition
                    </h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink sm:text-base">
                      {tuition.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Fee & Apply Card */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      Monthly Tuition Fee
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-clay">
                      {formatFee(tuition.monthlyFee)}
                      <span className="text-sm font-medium text-muted">
                        {" "}
                        / month
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2 border-y border-sage-border py-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Subject</span>
                      <span className="font-semibold text-forest">
                        {tuition.subject}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Class Level</span>
                      <span className="font-semibold text-forest">
                        {tuition.classLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Days / Week</span>
                      <span className="font-semibold text-forest">
                        {tuition.daysPerWeek} days
                      </span>
                    </div>
                  </div>

                  {/* Role-Restricted Application Action */}
                  {sessionLoading ? (
                    <Skeleton className="h-11 w-full rounded-xl" />
                  ) : !user ? (
                    <div className="space-y-2.5">
                      <Link
                        href={`/sign-in?callbackUrl=${encodeURIComponent(
                          `/tuitions/${tuition._id}`
                        )}`}
                        className="block"
                      >
                        <Button size="lg" className="w-full">
                          Sign In to Apply
                        </Button>
                      </Link>
                      <p className="text-center text-xs text-muted">
                        Sign in with a Student account to submit your
                        application.
                      </p>
                    </div>
                  ) : role === "student" ? (
                    applied ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                        <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-700" />
                        <p className="mt-1.5 text-sm font-bold text-emerald-900">
                          Application Submitted
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-800">
                          Track its status anytime in your dashboard.
                        </p>
                        <Link
                          href="/dashboard/student/my-applications"
                          className="mt-3 inline-block"
                        >
                          <Button variant="outline" size="sm">
                            View My Applications
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        variant="accent"
                        className="w-full"
                        onClick={() => setApplyOpen(true)}
                      >
                        Apply Now
                      </Button>
                    )
                  ) : (
                    <div className="space-y-3">
                      <Button size="lg" className="w-full" disabled>
                        Apply Now
                      </Button>
                      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                        <span>
                          Only accounts with the <strong>Student</strong> role
                          can apply for tuitions. You are currently signed in as{" "}
                          <strong className="capitalize">{role}</strong>.
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tutor Summary Card */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
                    Tutor Profile
                  </h2>
                  <div className="mt-4 flex items-center gap-3.5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
                      {getInitials(tuition.tutorName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-forest">
                        {tuition.tutorName}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{tuition.tutorEmail}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-sage-bg/70 px-3 py-2 text-xs text-muted">
                    <User className="h-4 w-4 text-forest shrink-0" />
                    <span>Verified MentorLagbe Tutor Listing</span>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </section>

      {tuition && (
        <ApplyModal
          open={applyOpen}
          onClose={() => setApplyOpen(false)}
          tuition={tuition}
          defaultPhone={user?.phone || ""}
          onSuccess={() => setApplied(true)}
        />
      )}
    </SiteShell>
  );
}
