"use client";

import * as React from "react";
import Link from "next/link";
import { MessageSquare, Quote, Sparkles, Star } from "lucide-react";
import type { Review } from "@/types";
import { apiFetch, extractList } from "@/lib/api";
import { formatDate, getInitials, isValidImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function areSimilarFeedback(textA?: string, textB?: string): boolean {
  if (!textA || !textB) return false;
  const a = textA.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const b = textB.toLowerCase().replace(/[^\w\s]/g, "").trim();
  if (a === b) return true;
  if (a.slice(0, 25) === b.slice(0, 25)) return true;
  return false;
}

export function TestimonialsSection() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    async function loadFeaturedReviews() {
      try {
        const res = await apiFetch<Review[]>("/api/reviews/featured");
        const list = extractList<Review>(res);
        if (active) {
          // Guarantee unique student and distinct feedback across all 6 testimonial cards
          const seenStudents = new Set<string>();
          const seenFeedbacks: string[] = [];
          const uniqueList: Review[] = [];

          for (const item of list) {
            const studentKey = (
              item.studentEmail ||
              item.studentName ||
              ""
            )
              .toLowerCase()
              .trim();
            if (!studentKey || seenStudents.has(studentKey)) continue;

            const isDuplicate = seenFeedbacks.some((fb) =>
              areSimilarFeedback(fb, item.feedback)
            );
            if (isDuplicate) continue;

            seenStudents.add(studentKey);
            seenFeedbacks.push(item.feedback);
            uniqueList.push(item);
            if (uniqueList.length >= 6) break;
          }

          // Fallback if needed
          if (uniqueList.length < 6) {
            for (const item of list) {
              const studentKey = (
                item.studentEmail ||
                item.studentName ||
                ""
              )
                .toLowerCase()
                .trim();
              if (studentKey && !seenStudents.has(studentKey)) {
                seenStudents.add(studentKey);
                uniqueList.push(item);
                if (uniqueList.length >= 6) break;
              }
            }
          }

          setReviews(uniqueList.length > 0 ? uniqueList : list.slice(0, 6));
        }
      } catch {
        // Non-blocking
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFeaturedReviews();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border-t border-sage-border bg-sage-bg/35 dark:bg-[#0E1712] py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-clay">
            Community Voices
          </p>
          <h2 className="mt-1.5 text-3xl font-extrabold text-forest dark:text-[#8EE0BA]">
            Real Student Reviews &amp; Ratings
          </h2>
          <p className="mt-2 text-sm text-muted dark:text-[#9DB3A6] sm:text-base">
            Verified feedback submitted by students accepted into active tuition batches across Bangladesh.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white dark:bg-[#141F18] border-sage-border p-6 space-y-4">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="flex items-center gap-3 pt-4 border-t border-sage-border">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {reviews.slice(0, 6).map((item) => (
              <Card
                key={item._id}
                className="flex flex-col justify-between bg-white dark:bg-[#141F18] border-sage-border shadow-xs hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.round(item.rating) }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      {item.tuitionTitle && (
                        <span className="rounded-md bg-sage-subtle dark:bg-[#1C2B22] px-2 py-0.5 text-[11px] font-bold text-forest dark:text-[#8EE0BA] truncate max-w-40">
                          {item.tuitionTitle}
                        </span>
                      )}
                    </div>

                    <div className="relative mt-4">
                      <Quote className="h-6 w-6 text-clay/20 absolute -top-1 -left-2 -z-0" />
                      <p className="relative z-10 text-sm leading-relaxed text-ink dark:text-[#EFF5F0] italic">
                        &ldquo;{item.feedback}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-sage-border pt-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {isValidImageUrl(item.studentImage) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.studentImage!}
                          alt={item.studentName}
                          className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-sage-border"
                        />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest dark:bg-[#8EE0BA] text-sm font-bold text-white dark:text-[#0C130F]">
                          {getInitials(item.studentName)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-forest dark:text-[#8EE0BA]">
                          {item.studentName}
                        </p>
                        <p className="truncate text-[11px] text-muted dark:text-[#9DB3A6]">
                          Verified Student
                        </p>
                      </div>
                    </div>
                    {item.createdAt && (
                      <span className="text-[10px] text-muted dark:text-[#9DB3A6] shrink-0">
                        {formatDate(item.createdAt)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-sage-border bg-white/70 dark:bg-[#141F18]/70 p-10 text-center max-w-xl mx-auto space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-subtle text-forest dark:text-[#8EE0BA] dark:bg-[#1C2B22]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-forest dark:text-[#8EE0BA]">
              100% Verified Community Feedback
            </h3>
            <p className="text-xs text-muted dark:text-[#9DB3A6] leading-relaxed">
              Every review on MentorLagbe is authenticated through accepted student applications. Once a batch starts, students can rate and leave feedback.
            </p>
            <div className="pt-2">
              <Link href="/tuitions">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-clay" />
                  Browse Verified Batches
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
