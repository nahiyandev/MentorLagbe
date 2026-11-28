"use client";

import * as React from "react";
import {
  Banknote,
  BookOpen,
  TrendingUp,
  Users,
} from "lucide-react";
import type { AdminAnalyticsData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RevenueTrendsChart({
  data,
  paymentMethods,
}: {
  data: AdminAnalyticsData["revenueTrends"];
  paymentMethods?: AdminAnalyticsData["paymentMethods"];
}) {
  const maxRevenue = Math.max(
    ...data.map((d) => d.totalUsdEquivalent || d.usd || 10),
    50
  );

  return (
    <Card className="h-full border-sage-border shadow-xs">
      <CardHeader className="pb-2 border-b border-sage-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay/10 text-clay">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold text-forest dark:text-[#8EE0BA]">
                Platform Revenue Trends
              </CardTitle>
              <p className="text-xs text-muted dark:text-[#9DB3A6]">
                Monthly subscription volume across Stripe, bKash &amp; Nagad
              </p>
            </div>
          </div>
          <Badge variant="clay" className="text-xs">
            Last 6 Months
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Bar Chart Container */}
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 pt-6 px-1 border-b border-sage-border/80">
          {data.map((item, idx) => {
            const heightPct = Math.max(
              8,
              Math.min(100, Math.round(((item.totalUsdEquivalent || item.usd || 0) / maxRevenue) * 100))
            );

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                {/* Floating Tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-forest dark:bg-[#101A14] text-white dark:text-[#8EE0BA] px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap pointer-events-none z-10 border border-sage-border">
                  {item.usd > 0 && <span>${item.usd} </span>}
                  {item.bdt > 0 && <span>৳{item.bdt.toLocaleString()}</span>}
                  {item.usd === 0 && item.bdt === 0 && <span>$0</span>}
                </div>

                {/* Animated Bar with Tailwind v4 Gradient */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[42px] rounded-t-lg bg-linear-to-t from-clay to-amber-500/80 group-hover:from-clay group-hover:to-amber-400 transition-all shadow-xs relative"
                >
                  <span className="sr-only">
                    {item.label}: ${item.usd} / ৳{item.bdt}
                  </span>
                </div>

                {/* X-axis Month Label */}
                <span className="mt-2 text-[10px] sm:text-xs font-semibold text-muted dark:text-[#9DB3A6] text-center truncate w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Payment Gateway Breakdown Badges */}
        {paymentMethods && paymentMethods.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6]">
              Gateways:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {paymentMethods.map((pm) => (
                <span
                  key={pm.method}
                  className="inline-flex items-center gap-1 rounded-md bg-sage-subtle dark:bg-[#1C2B22] px-2 py-0.5 text-[11px] font-semibold text-forest dark:text-[#8EE0BA] border border-sage-border"
                >
                  <Banknote className="h-3 w-3 text-clay" />
                  <span className="capitalize">{pm.method}:</span>
                  <strong>{pm.count} orders</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UserGrowthChart({
  data,
}: {
  data: AdminAnalyticsData["userGrowth"];
}) {
  const maxUsers = Math.max(...data.map((d) => d.total || 1), 10);

  return (
    <Card className="h-full border-sage-border shadow-xs">
      <CardHeader className="pb-2 border-b border-sage-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest/10 dark:bg-[#8EE0BA]/15 text-forest dark:text-[#8EE0BA]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold text-forest dark:text-[#8EE0BA]">
                Monthly User Growth
              </CardTitle>
              <p className="text-xs text-muted dark:text-[#9DB3A6]">
                New Student &amp; Tutor accounts registered
              </p>
            </div>
          </div>
          <Badge variant="sage" className="text-xs">
            Growth Velocity
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Multi-Bar Chart Container */}
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 pt-6 px-1 border-b border-sage-border/80">
          {data.map((item, idx) => {
            const studentPct = Math.max(
              4,
              Math.min(100, Math.round((item.students / maxUsers) * 100))
            );
            const tutorPct = Math.max(
              4,
              Math.min(100, Math.round((item.tutors / maxUsers) * 100))
            );

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                {/* Floating Tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-forest dark:bg-[#101A14] text-white dark:text-[#8EE0BA] px-2 py-1 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap pointer-events-none z-10 border border-sage-border">
                  Students: {item.students} &bull; Tutors: {item.tutors}
                </div>

                {/* Paired Bars: Student vs Tutor */}
                <div className="flex items-end gap-1 w-full justify-center">
                  {/* Student Bar */}
                  <div
                    style={{ height: `${studentPct}%` }}
                    className="w-1/2 max-w-[18px] rounded-t-md bg-forest dark:bg-[#8EE0BA] shadow-2xs transition-all group-hover:opacity-90"
                    title={`Students: ${item.students}`}
                  />
                  {/* Tutor Bar */}
                  <div
                    style={{ height: `${tutorPct}%` }}
                    className="w-1/2 max-w-[18px] rounded-t-md bg-emerald-500 dark:bg-emerald-400 shadow-2xs transition-all group-hover:opacity-90"
                    title={`Tutors: ${item.tutors}`}
                  />
                </div>

                {/* Month Label */}
                <span className="mt-2 text-[10px] sm:text-xs font-semibold text-muted dark:text-[#9DB3A6] text-center truncate w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs font-semibold text-muted dark:text-[#9DB3A6]">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-forest dark:bg-[#8EE0BA]" />
            <span>Students</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-400" />
            <span>Tutors</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PopularSubjectsChart({
  data,
}: {
  data: AdminAnalyticsData["popularSubjects"];
}) {
  const maxDemand = Math.max(
    ...data.map((d) => Math.max(d.tuitions, d.applications)),
    10
  );

  return (
    <Card className="h-full border-sage-border shadow-xs">
      <CardHeader className="pb-2 border-b border-sage-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold text-forest dark:text-[#8EE0BA]">
                Most In-Demand Subjects
              </CardTitle>
              <p className="text-xs text-muted dark:text-[#9DB3A6]">
                Tuition offerings vs. student application demand
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Top Subjects
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        {data.length === 0 ? (
          <p className="text-xs text-muted italic py-6 text-center">
            No subject statistics available yet.
          </p>
        ) : (
          <div className="space-y-3.5">
            {data.slice(0, 6).map((item) => {
              const tuitionPct = Math.min(
                100,
                Math.round((item.tuitions / maxDemand) * 100)
              );
              const appPct = Math.min(
                100,
                Math.round((item.applications / maxDemand) * 100)
              );

              return (
                <div key={item.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-forest dark:text-[#8EE0BA]">
                      {item.subject}
                    </span>
                    <span className="text-muted dark:text-[#9DB3A6] text-[11px]">
                      <strong>{item.tuitions}</strong> batches &bull;{" "}
                      <strong>{item.applications}</strong> applications
                    </span>
                  </div>

                  {/* Horizontal Bar: Tuitions (Forest) & Applications (Clay) */}
                  <div className="h-2 w-full rounded-full bg-sage-bg dark:bg-[#1C2B22] overflow-hidden flex gap-1">
                    <div
                      style={{ width: `${Math.max(6, tuitionPct)}%` }}
                      className="h-full bg-forest dark:bg-[#8EE0BA] rounded-full transition-all"
                      title={`Batches: ${item.tuitions}`}
                    />
                    <div
                      style={{ width: `${Math.max(6, appPct)}%` }}
                      className="h-full bg-clay rounded-full transition-all"
                      title={`Applications: ${item.applications}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
