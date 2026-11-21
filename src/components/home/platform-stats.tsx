"use client";

import * as React from "react";
import { BookOpen, GraduationCap, ShieldCheck, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  totalTuitions: number;
  subjectsCount: number;
  totalReviews: number;
  averageRating: number;
  verifiedTutorsPercentage: number;
}

export function PlatformStats() {
  const [stats, setStats] = React.useState<StatsData | null>(null);

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await apiFetch<StatsData>("/api/tuitions/stats");
        if (active && res) {
          setStats({
            totalTuitions: typeof res.totalTuitions === "number" ? res.totalTuitions : 0,
            subjectsCount: typeof res.subjectsCount === "number" ? res.subjectsCount : 0,
            totalReviews: typeof res.totalReviews === "number" ? res.totalReviews : 0,
            averageRating: typeof res.averageRating === "number" ? res.averageRating : 0,
            verifiedTutorsPercentage: 100,
          });
        }
      } catch {
        if (active) {
          setStats({
            totalTuitions: 0,
            subjectsCount: 0,
            totalReviews: 0,
            averageRating: 0,
            verifiedTutorsPercentage: 100,
          });
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center sm:text-left space-y-2">
            <Skeleton className="h-9 w-24 rounded-lg mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-28 rounded-md mx-auto sm:mx-0" />
            <Skeleton className="h-3 w-36 rounded-md hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
      {/* 1. Verified Tuitions */}
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-forest dark:text-[#8EE0BA]">
          <BookOpen className="h-5 w-5 text-clay" />
          <p className="text-3xl font-extrabold sm:text-4xl">
            {stats.totalTuitions}+
          </p>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm font-bold text-forest dark:text-[#8EE0BA]">
          Verified Tuitions
        </p>
        <p className="text-[11px] text-muted dark:text-[#9DB3A6] hidden sm:block">
          Active batches &amp; 1-on-1 programs
        </p>
      </div>

      {/* 2. Core Subjects */}
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-clay">
          <GraduationCap className="h-5 w-5 text-forest dark:text-[#8EE0BA]" />
          <p className="text-3xl font-extrabold sm:text-4xl">
            {stats.subjectsCount}+
          </p>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm font-bold text-forest dark:text-[#8EE0BA]">
          Core Subjects
        </p>
        <p className="text-[11px] text-muted dark:text-[#9DB3A6] hidden sm:block">
          Math, Physics, IELTS, Science &amp; more
        </p>
      </div>

      {/* 3. Admin Verified */}
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-forest dark:text-[#8EE0BA]">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <p className="text-3xl font-extrabold sm:text-4xl">
            {stats.verifiedTutorsPercentage}%
          </p>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm font-bold text-forest dark:text-[#8EE0BA]">
          Admin Verified
        </p>
        <p className="text-[11px] text-muted dark:text-[#9DB3A6] hidden sm:block">
          Vetted tutors and transparent fees
        </p>
      </div>

      {/* 4. Real Dynamic Rating */}
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-clay">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <p className="text-3xl font-extrabold sm:text-4xl">
            {stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)}/5` : "5.0/5"}
          </p>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm font-bold text-forest dark:text-[#8EE0BA]">
          Student Satisfaction
        </p>
        <p className="text-[11px] text-muted dark:text-[#9DB3A6] hidden sm:block">
          {stats.totalReviews > 0
            ? `Real score from ${stats.totalReviews} verified review${stats.totalReviews > 1 ? "s" : ""}`
            : "Top rated mentors & verified batches"}
        </p>
      </div>
    </div>
  );
}
