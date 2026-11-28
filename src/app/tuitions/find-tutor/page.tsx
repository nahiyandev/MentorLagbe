"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BookOpen,
  Check,
  CheckCircle2,
  GraduationCap,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  Star,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import {
  CLASS_LEVEL_OPTIONS,
  MODE_OPTIONS,
  SUBJECT_OPTIONS,
  type Tuition,
} from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { cn, formatFee, formatWhatsAppUrl, getInitials } from "@/lib/utils";
import { SiteShell } from "@/components/layout/site-shell";
import { VerifiedBadge } from "@/components/tutors/verified-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ScoredTuition {
  tuition: Tuition;
  matchScore: number;
  matchReasons: string[];
}

function MatchedTutorCard({
  item,
  rank,
  userBudget,
  isFallback = false,
}: {
  item: ScoredTuition;
  rank: number;
  userBudget: number;
  isFallback?: boolean;
}) {
  const { tuition, matchScore, matchReasons } = item;
  const savings = userBudget - tuition.monthlyFee;
  const rating = tuition.averageRating || 5.0;

  return (
    <div className="relative flex flex-col rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] shadow-xs hover:shadow-md transition-all overflow-hidden">
      {/* Top Match Rank Banner */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2.5 text-xs border-b border-sage-border",
          rank === 1 && !isFallback
            ? "bg-linear-to-r from-amber-500/15 via-emerald-500/10 to-forest/10 dark:from-amber-950/40 dark:to-[#1C2B22]"
            : "bg-sage-bg/60 dark:bg-[#1C2B22]/60"
        )}
      >
        <div className="flex items-center gap-1.5 font-extrabold text-forest dark:text-[#8EE0BA]">
          {rank === 1 && !isFallback ? (
            <>
              <Trophy className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>Top Best Match</span>
            </>
          ) : isFallback ? (
            <>
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Alternative Recommendation #{rank}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Matched Tutor #{rank}</span>
            </>
          )}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black",
            rank === 1 && !isFallback
              ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black"
              : isFallback
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                : "bg-forest/10 text-forest dark:bg-[#8EE0BA]/20 dark:text-[#8EE0BA]"
          )}
        >
          {matchScore}% Match
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Tutor Identity Profile Header */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest dark:bg-[#8EE0BA] text-base font-extrabold text-white dark:text-[#0C130F] ring-2 ring-forest/20 shadow-xs">
              {getInitials(tuition.tutorName)}
            </span>
            <span
              className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-[#141F18]"
              title="Verified Educator"
            >
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/tutors/${encodeURIComponent(tuition.tutorEmail)}`}
                className="text-base font-extrabold text-forest dark:text-[#8EE0BA] hover:underline truncate"
              >
                {tuition.tutorName}
              </Link>
              <VerifiedBadge size="sm" />
            </div>

            {/* Response Time Badge & Rating */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                <Zap className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500 shrink-0" />
                <span>Fast Responder &bull; ~1 hr</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span>{rating.toFixed(1)}</span>
                <span className="text-muted dark:text-[#9DB3A6] font-normal">
                  ({tuition.totalReviews ? `${tuition.totalReviews} reviews` : "Verified"})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Matched Batch Offering */}
        <div className="rounded-xl border border-sage-border/80 bg-sage-bg/40 dark:bg-[#101A14]/60 p-3.5 space-y-2.5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
              Matching Batch Offering
            </span>
            <h4 className="text-sm font-bold text-ink dark:text-[#EFF5F0] truncate">
              {tuition.title}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted dark:text-[#9DB3A6]">
            <span className="rounded-md bg-white dark:bg-[#1C2B22] px-2 py-0.5 font-semibold text-forest dark:text-[#8EE0BA] border border-sage-border/60">
              {tuition.subject}
            </span>
            <span>&bull;</span>
            <span>{tuition.classLevel}</span>
            <span>&bull;</span>
            <span className="capitalize">{tuition.mode}</span>
          </div>

          {/* Fee & Budget Comparison */}
          <div className="flex items-center justify-between pt-1 border-t border-sage-border/60">
            <div>
              <span className="text-base font-extrabold text-forest dark:text-[#8EE0BA]">
                {formatFee(tuition.monthlyFee)}
              </span>
              <span className="text-[11px] text-muted dark:text-[#9DB3A6]"> / month</span>
            </div>

            {savings >= 0 ? (
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 px-2 py-0.5">
                {savings > 0 ? `Saves ৳${savings.toLocaleString()}` : "Exact Budget"}
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-800 dark:text-amber-300 px-2 py-0.5">
                ৳{Math.abs(savings).toLocaleString()} over budget
              </span>
            )}
          </div>
        </div>

        {/* Why this Tutor Matches (Match Reasons) */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {matchReasons.map((reason, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-forest/5 dark:bg-[#8EE0BA]/10 text-[10px] font-medium text-forest dark:text-[#8EE0BA] px-2 py-0.5"
              >
                <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>{reason}</span>
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons: WhatsApp + Profile + Apply */}
        <div className="pt-2 border-t border-sage-border flex flex-col sm:flex-row items-stretch gap-2">
          {tuition.tutorPhone && (
            <a
              href={formatWhatsAppUrl(tuition.tutorPhone, tuition.tutorName)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Chat directly on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-white" />
              <span>WhatsApp</span>
            </a>
          )}

          <Link
            href={`/tutors/${encodeURIComponent(tuition.tutorEmail)}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sage-border bg-white dark:bg-[#1C2B22] text-forest dark:text-[#8EE0BA] hover:bg-sage-subtle dark:hover:bg-[#25382D] px-3 py-2 text-xs font-bold transition-all"
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile</span>
          </Link>

          <Link
            href={`/tuitions/${tuition._id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] hover:bg-forest/90 dark:hover:bg-[#7DCFA9] px-3.5 py-2 text-xs font-extrabold transition-all shadow-xs"
          >
            <span>Apply to Batch</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FindTutorPage() {
  const [subject, setSubject] = React.useState<string>("Mathematics");
  const [classLevel, setClassLevel] = React.useState<string>("SSC / Class 9–10");
  const [budget, setBudget] = React.useState<number>(5000);
  const [mode, setMode] = React.useState<string>("");

  const [aiPrompt, setAiPrompt] = React.useState<string>("");
  const [aiLoading, setAiLoading] = React.useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = React.useState<{
    extractedPrompt: string;
    detectedSubject: string;
    detectedClassLevel: string;
    detectedBudget: number | null;
    detectedMode: string;
    aiSummary: string;
  } | null>(null);
  const [showManualFilters, setShowManualFilters] = React.useState<boolean>(false);

  const [loading, setLoading] = React.useState<boolean>(false);
  const [hasSearched, setHasSearched] = React.useState<boolean>(false);
  const [matchedResults, setMatchedResults] = React.useState<ScoredTuition[]>([]);
  const [fallbackResults, setFallbackResults] = React.useState<ScoredTuition[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleAiMatch = React.useCallback(async (customPrompt?: string) => {
    const textToMatch = customPrompt ?? aiPrompt;
    if (!textToMatch.trim()) {
      setError("Please describe what kind of tutor or subject you are looking for.");
      return;
    }

    setAiLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await apiFetch<{
        analysis: {
          extractedPrompt: string;
          detectedSubject: string;
          detectedClassLevel: string;
          detectedBudget: number | null;
          detectedMode: string;
          aiSummary: string;
        };
        matches: ScoredTuition[];
      }>("/api/tuitions/ai-match", {
        method: "POST",
        body: JSON.stringify({ prompt: textToMatch.trim() }),
      });

      if (res?.analysis) {
        setAiAnalysis(res.analysis);
        if (res.analysis.detectedSubject && res.analysis.detectedSubject !== "Any Subject") {
          setSubject(res.analysis.detectedSubject);
        }
        if (res.analysis.detectedClassLevel && res.analysis.detectedClassLevel !== "All Classes") {
          setClassLevel(res.analysis.detectedClassLevel);
        }
        if (res.analysis.detectedBudget) {
          setBudget(res.analysis.detectedBudget);
        }
      }

      if (res?.matches && res.matches.length > 0) {
        setMatchedResults(res.matches);
        setFallbackResults([]);
      } else {
        setMatchedResults([]);
        setFallbackResults([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI Matching failed.");
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt]);

  const BUDGET_PRESETS = [3000, 4000, 5000, 7000, 10000, 15000];

  const calculateScore = React.useCallback(
    (
      t: Tuition,
      targetSubject: string,
      targetClass: string,
      maxBudget: number,
      targetMode: string
    ): ScoredTuition => {
      let score = 0;
      const reasons: string[] = [];

      const normClass = (s: string) =>
        s.replace(/[\u2013\u2014–—]/g, "-").toLowerCase().trim();
      const normSub = (s: string) => s.toLowerCase().trim();

      // Subject Match (Up to 40 pts)
      if (normSub(t.subject) === normSub(targetSubject)) {
        score += 40;
        reasons.push("Exact Subject Match");
      } else if (
        normSub(t.subject).includes(normSub(targetSubject)) ||
        normSub(targetSubject).includes(normSub(t.subject))
      ) {
        score += 25;
        reasons.push("Related Subject Match");
      }

      // Class Level Match (Up to 30 pts)
      if (normClass(t.classLevel) === normClass(targetClass)) {
        score += 30;
        reasons.push("Target Class Level");
      } else if (
        normClass(t.classLevel).includes(normClass(targetClass)) ||
        normClass(targetClass).includes(normClass(t.classLevel))
      ) {
        score += 20;
        reasons.push("Compatible Class Level");
      }

      // Budget Match (Up to 20 pts)
      if (t.monthlyFee <= maxBudget) {
        score += 20;
        const saved = maxBudget - t.monthlyFee;
        if (saved > 0) {
          reasons.push(`Within Budget (Saves ৳${saved.toLocaleString()})`);
        } else {
          reasons.push("Exact Budget Match");
        }
      } else {
        const diff = t.monthlyFee - maxBudget;
        const penalty = Math.min(25, Math.floor((diff / maxBudget) * 30));
        score = Math.max(0, score - penalty);
        reasons.push(`৳${diff.toLocaleString()} over target budget`);
      }

      // Rating bonus (Up to 10 pts)
      const rating = t.averageRating || 5.0;
      const ratingPts = Math.min(10, Math.round(rating * 2));
      score += ratingPts;
      if (rating >= 4.5) {
        reasons.push(`Top-Rated Educator (${rating.toFixed(1)}★)`);
      }

      // Mode match (bonus 5 pts if matched)
      if (targetMode && t.mode === targetMode) {
        score += 5;
        reasons.push(`Preferred ${t.mode} Mode`);
      }

      const finalScore = Math.min(100, Math.max(10, score));

      return {
        tuition: t,
        matchScore: finalScore,
        matchReasons: reasons,
      };
    },
    []
  );

  const handleSearch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Step 1: Query exact / within budget results
      const params = new URLSearchParams();
      if (subject) params.set("subject", subject);
      if (classLevel) params.set("classLevel", classLevel);
      if (budget) params.set("maxFee", String(budget));
      if (mode) params.set("mode", mode);

      const res = await apiFetch<unknown>(`/api/tuitions?${params.toString()}`);
      const directMatches = extractList<Tuition>(res);

      if (directMatches.length > 0) {
        const scored = directMatches
          .map((t) => calculateScore(t, subject, classLevel, budget, mode))
          .sort((a, b) => b.matchScore - a.matchScore);

        setMatchedResults(scored);
        setFallbackResults([]);
      } else {
        // Step 2: Fallback to all approved tuitions for that subject to give flexible recommendations
        setMatchedResults([]);
        const fallbackRes = await apiFetch<unknown>(
          `/api/tuitions?subject=${encodeURIComponent(subject)}`
        );
        const fallbackMatches = extractList<Tuition>(fallbackRes);

        const scoredFallback = fallbackMatches
          .map((t) => calculateScore(t, subject, classLevel, budget, mode))
          .sort((a, b) => b.matchScore - a.matchScore);

        setFallbackResults(scoredFallback);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to find matching tutors."
      );
    } finally {
      setLoading(false);
    }
  }, [subject, classLevel, budget, mode, calculateScore]);

  // Run initial search on mount so user sees immediate recommendations
  React.useEffect(() => {
    let active = true;
    async function loadInitial() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (subject) params.set("subject", subject);
        if (classLevel) params.set("classLevel", classLevel);
        if (budget) params.set("maxFee", String(budget));
        if (mode) params.set("mode", mode);

        const res = await apiFetch<unknown>(`/api/tuitions?${params.toString()}`);
        if (!active) return;
        const directMatches = extractList<Tuition>(res);

        if (directMatches.length > 0) {
          const scored = directMatches
            .map((t) => calculateScore(t, subject, classLevel, budget, mode))
            .sort((a, b) => b.matchScore - a.matchScore);
          setMatchedResults(scored);
          setFallbackResults([]);
        } else {
          setMatchedResults([]);
          const fallbackRes = await apiFetch<unknown>(
            `/api/tuitions?subject=${encodeURIComponent(subject)}`
          );
          if (!active) return;
          const fallbackMatches = extractList<Tuition>(fallbackRes);
          const scoredFallback = fallbackMatches
            .map((t) => calculateScore(t, subject, classLevel, budget, mode))
            .sort((a, b) => b.matchScore - a.matchScore);
          setFallbackResults(scoredFallback);
        }
        setHasSearched(true);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load matches"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadInitial();
    return () => {
      active = false;
    };
  }, [subject, classLevel, budget, mode, calculateScore]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-muted dark:text-[#9DB3A6]">
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-1 font-semibold text-forest dark:text-[#8EE0BA] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Browse Tuitions
          </Link>
          <span>/</span>
          <span>Find My Tutor (Smart Matchmaker)</span>
        </div>

        {/* Hero Header */}
        <div className="mb-8 rounded-3xl border border-clay/30 bg-linear-to-r from-clay/10 via-amber-500/10 to-forest/10 p-6 sm:p-10 dark:from-clay/20 dark:to-forest/20 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <Badge variant="clay" className="px-3.5 py-1 text-xs gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Matchmaking Engine
              </Badge>
              <h1 className="text-3xl font-black tracking-tight text-forest dark:text-[#8EE0BA] sm:text-4xl lg:text-5xl">
                Find Your Best-Matched Tutor
              </h1>
              <p className="text-sm leading-relaxed text-muted dark:text-[#9DB3A6] sm:text-base">
                Provide your target <strong>Subject</strong>, student <strong>Class Level</strong>, and <strong>Monthly Budget</strong>.
                Our algorithm scores certified tutors and available batches to highlight your highest compatibility match in seconds.
              </p>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-sage-border bg-white/80 dark:bg-[#141F18]/80 p-5 backdrop-blur-xs text-center shrink-0 w-64 shadow-xs">
              <Trophy className="h-10 w-10 text-amber-500 mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
                Guaranteed Quality
              </p>
              <p className="text-sm font-extrabold text-forest dark:text-[#8EE0BA] mt-0.5">
                100% Verified Tutors
              </p>
              <p className="text-[11px] text-muted dark:text-[#9DB3A6] mt-1">
                Admin-moderated credentials &amp; real student reviews
              </p>
            </div>
          </div>
        </div>

        {/* AI Natural Language Matcher Card */}
        <div className="mb-8 rounded-3xl border border-emerald-300 dark:border-emerald-700 bg-linear-to-br from-emerald-500/10 via-forest/5 to-amber-500/10 dark:from-emerald-950/40 dark:to-[#141F18] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sage-border/80 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-forest dark:text-[#8EE0BA] flex items-center gap-2">
                  <span>AI Tutor Matcher</span>
                  <Badge variant="clay" className="text-[10px] font-black uppercase">
                    Natural Language AI
                  </Badge>
                </h2>
                <p className="text-xs text-muted dark:text-[#9DB3A6] mt-0.5">
                  Describe what kind of tutor you need in Bangla or English. Our AI analyzes your subject, class level, budget, and schedule to recommend the best mentors.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. আমি ক্লাস ১০-এর জন্য একজন ফিজিক্স টিউটর খুঁজছি, সপ্তাহে ৩ দিন সন্ধ্যা ৭টায়, বাজেট ৫০০০ টাকার মধ্যে। ধানমন্ডি বা অনলাইনে ভালো শিক্ষক খুঁজছি।"
                className="w-full rounded-2xl border border-sage-border bg-white dark:bg-[#101A14] p-4 text-xs sm:text-sm text-ink dark:text-[#EFF5F0] placeholder:text-muted/60 focus:border-forest dark:focus:border-[#8EE0BA] focus:outline-hidden focus:ring-2 focus:ring-forest/20 shadow-2xs resize-none"
              />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-muted dark:text-[#9DB3A6]">
                💡 Try sample prompts:
              </span>
              {[
                "HSC Physics & Higher Math (Online, ৳6,000)",
                "SSC Science & Chemistry (Evening, ৳4,500)",
                "Class 8 English & ICT (Online, ৳3,500)",
                "Medical / University Admission Physics Expert",
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setAiPrompt(sample);
                    void handleAiMatch(sample);
                  }}
                  className="rounded-full border border-sage-border bg-white/80 dark:bg-[#1C2B22]/80 px-2.5 py-1 text-[11px] font-medium text-forest dark:text-[#8EE0BA] hover:bg-forest hover:text-white dark:hover:bg-[#8EE0BA] dark:hover:text-[#0C130F] transition-all cursor-pointer shadow-2xs"
                >
                  {sample}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowManualFilters(!showManualFilters)}
                className="text-xs font-bold text-muted hover:text-forest dark:text-[#9DB3A6] dark:hover:text-[#8EE0BA] underline cursor-pointer"
              >
                {showManualFilters
                  ? "Hide manual filters"
                  : "Or customize manual filters (Subject, Class, Budget)"}
              </button>

              <Button
                size="lg"
                onClick={() => void handleAiMatch()}
                disabled={aiLoading}
                className="gap-2 font-black cursor-pointer shadow-xs bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing &amp; Matching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Match Best Tutors with AI</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* AI Analysis Result Ribbon */}
        {aiAnalysis && (
          <div className="mb-8 rounded-2xl border border-forest/20 bg-emerald-50/70 dark:bg-[#1C2B22]/60 p-4 sm:p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-forest dark:text-[#8EE0BA]">
                AI Match Analysis
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-ink dark:text-[#EFF5F0]">
              {aiAnalysis.aiSummary}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <Badge variant="sage">Subject: {aiAnalysis.detectedSubject}</Badge>
              <Badge variant="sage">Level: {aiAnalysis.detectedClassLevel}</Badge>
              {aiAnalysis.detectedBudget && (
                <Badge variant="clay">
                  Budget: ≤৳{aiAnalysis.detectedBudget.toLocaleString()}
                </Badge>
              )}
              <Badge variant="outline">Mode: {aiAnalysis.detectedMode}</Badge>
            </div>
          </div>
        )}

        {/* Matchmaker Interactive Form */}
        <div
          className={`mb-10 rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-6 sm:p-8 shadow-xs ${
            showManualFilters ? "block" : "hidden sm:block"
          }`}
        >
          <div className="flex items-center gap-2 border-b border-sage-border pb-4 mb-6">
            <Zap className="h-5 w-5 text-clay" />
            <h2 className="text-base sm:text-lg font-bold text-forest dark:text-[#8EE0BA]">
              Set Your Learning Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* 1. Subject */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-forest dark:text-[#8EE0BA] flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-clay" />
                1. Subject (বিষয়)
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-sage-border bg-sage-bg/30 dark:bg-[#1C2B22]/50 px-3.5 py-2.5 text-xs text-ink dark:text-[#EFF5F0] font-semibold focus:border-forest dark:focus:border-[#8EE0BA] focus:outline-hidden"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub} className="bg-white dark:bg-[#141F18]">
                    {sub}
                  </option>
                ))}
              </select>

              {/* Quick subject pills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {["Mathematics", "Physics", "English", "ICT", "Biology", "Chemistry"].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
                      subject === sub
                        ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F]"
                        : "bg-sage-subtle dark:bg-[#1C2B22] text-muted dark:text-[#9DB3A6] hover:text-forest"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Class Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-forest dark:text-[#8EE0BA] flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-clay" />
                2. Class Level (ক্লাস)
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full rounded-xl border border-sage-border bg-sage-bg/30 dark:bg-[#1C2B22]/50 px-3.5 py-2.5 text-xs text-ink dark:text-[#EFF5F0] font-semibold focus:border-forest dark:focus:border-[#8EE0BA] focus:outline-hidden"
              >
                {CLASS_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-white dark:bg-[#141F18]">
                    {lvl}
                  </option>
                ))}
              </select>

              {/* Quick level pills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {["SSC / Class 9–10", "HSC / Class 11–12", "Class 6–8", "University / Admission"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setClassLevel(lvl)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
                      classLevel === lvl
                        ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F]"
                        : "bg-sage-subtle dark:bg-[#1C2B22] text-muted dark:text-[#9DB3A6] hover:text-forest"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Monthly Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-forest dark:text-[#8EE0BA] flex items-center gap-1.5">
                  <Banknote className="h-3.5 w-3.5 text-clay" />
                  3. Max Budget (সর্বোচ্চ বাজেট)
                </label>
                <span className="text-xs font-extrabold text-clay">
                  {formatFee(budget)}/mo
                </span>
              </div>
              <input
                type="number"
                min={1000}
                max={50000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-sage-border bg-sage-bg/30 dark:bg-[#1C2B22]/50 px-3.5 py-2.5 text-xs text-ink dark:text-[#EFF5F0] font-semibold focus:border-forest dark:focus:border-[#8EE0BA] focus:outline-hidden"
              />

              {/* Quick budget presets */}
              <div className="flex flex-wrap gap-1 pt-1">
                {BUDGET_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBudget(amt)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
                      budget === amt
                        ? "bg-clay text-white"
                        : "bg-sage-subtle dark:bg-[#1C2B22] text-muted dark:text-[#9DB3A6] hover:text-clay"
                    }`}
                  >
                    ৳{amt / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mode & Action Footer */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-sage-border pt-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted dark:text-[#9DB3A6]">
                Learning Mode:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode("")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    mode === ""
                      ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F]"
                      : "bg-sage-subtle dark:bg-[#1C2B22] text-muted dark:text-[#9DB3A6]"
                  }`}
                >
                  All Modes
                </button>
                {MODE_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      mode === m
                        ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F]"
                        : "bg-sage-subtle dark:bg-[#1C2B22] text-muted dark:text-[#9DB3A6]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleSearch}
              disabled={loading}
              className="gap-2 shadow-xs cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Find Best Matches
            </Button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sage-border pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-forest dark:text-[#8EE0BA]">
                Recommended Matches
              </h2>
              <p className="text-xs text-muted dark:text-[#9DB3A6] mt-0.5">
                Ranked by subject compatibility, class level relevance, fee value, and tutor rating.
              </p>
            </div>
            {!loading && hasSearched && (
              <span className="text-xs font-bold text-forest dark:text-[#8EE0BA]">
                {matchedResults.length > 0
                  ? `${matchedResults.length} direct match${matchedResults.length === 1 ? "" : "es"} found`
                  : fallbackResults.length > 0
                    ? `${fallbackResults.length} alternative recommendations`
                    : "No matching tuitions"}
              </span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-xs font-semibold text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-5 space-y-4 shadow-xs"
                >
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Direct Matches Display */}
          {!loading && matchedResults.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matchedResults.map((item, idx) => (
                <MatchedTutorCard
                  key={item.tuition._id}
                  item={item}
                  rank={idx + 1}
                  userBudget={budget}
                />
              ))}
            </div>
          )}

          {/* Fallback Alternative Recommendations Display */}
          {!loading && matchedResults.length === 0 && fallbackResults.length > 0 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/20 p-5 text-amber-900 dark:text-amber-200">
                <p className="font-bold text-sm">
                  No exact match found under {formatFee(budget)} for {subject} in {classLevel}.
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  Don&apos;t worry! Here are verified top-rated tutors teaching <strong>{subject}</strong> with slightly flexible budgets or batch levels.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {fallbackResults.map((item, idx) => (
                  <MatchedTutorCard
                    key={item.tuition._id}
                    item={item}
                    rank={idx + 1}
                    userBudget={budget}
                    isFallback={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completely empty state */}
          {!loading && matchedResults.length === 0 && fallbackResults.length === 0 && (
            <div className="rounded-2xl border border-dashed border-sage-border p-12 text-center bg-white dark:bg-[#141F18]">
              <Search className="mx-auto h-12 w-12 text-muted dark:text-[#9DB3A6] opacity-40" />
              <h3 className="mt-4 text-base font-bold text-forest dark:text-[#8EE0BA]">
                No tuitions found matching these criteria
              </h3>
              <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6]">
                Try adjusting your budget or selecting a broader subject or class level.
              </p>
              <Link href="/tuitions" className="mt-5 inline-block">
                <Button size="sm">Browse All Tuitions</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
