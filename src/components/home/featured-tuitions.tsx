"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import type { Tuition } from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { TuitionCard } from "@/components/tuitions/tuition-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedTuitions() {
  const [tuitions, setTuitions] = React.useState<Tuition[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await apiFetch<unknown>("/api/tuitions");
        const list = extractList<Tuition>(res, "tuitions");
        if (active) {
          setTuitions(list.slice(0, 6));
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load tuition listings right now."
          );
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

  if (loading) {
    return (
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
            <div className="flex justify-between pt-3">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-sage-border bg-white p-10 text-center">
        <p className="text-base font-semibold text-forest">
          Unable to fetch featured tuitions
        </p>
        <p className="mt-1 text-sm text-muted">{error}</p>
        <Link href="/tuitions" className="mt-5 inline-block">
          <Button variant="outline">Open Browse Tuitions</Button>
        </Link>
      </div>
    );
  }

  if (tuitions.length === 0) {
    return (
      <div className="rounded-2xl border border-sage-border bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-subtle text-forest">
          <BookOpenCheck className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-forest">
          No approved tuitions published yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Tutors can post subject-wise tuition batches from their dashboard.
          Once approved by an admin, listings appear right here automatically.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/sign-up?role=tutor">
            <Button>Post the First Tuition</Button>
          </Link>
          <Link href="/tuitions">
            <Button variant="outline">
              Browse Tuitions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tuitions.map((tuition) => (
        <TuitionCard key={tuition._id} tuition={tuition} />
      ))}
    </div>
  );
}
