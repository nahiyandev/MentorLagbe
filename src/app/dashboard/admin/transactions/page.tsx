"use client";

import * as React from "react";
import type { PaymentRecord } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTransactionsPage() {
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<unknown>("/api/admin/transactions");
        if (active) {
          setPayments(extractList<PaymentRecord>(res, "transactions"));
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError(
              "Backend JWT token is missing or expired. Once POST /api/auth/jwt is live on the server, sign in again to inspect transactions."
            );
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Could not load payment records."
            );
          }
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

  const usdTotal = payments
    .filter((p) => (p.currency || "USD").toUpperCase() === "USD")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const bdtTotal = payments
    .filter((p) => (p.currency || "").toUpperCase() === "BDT")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const paginatedPayments = payments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
            Transactions &amp; Revenue
          </h1>
          <p className="mt-1 text-sm text-muted">
            All Stripe, bKash, and Nagad subscription payment records from the platform.
          </p>
        </div>
        {!loading && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="rounded-xl border border-sage-border bg-white dark:bg-[#141F18] px-3.5 py-1.5 shadow-2xs">
              <span className="text-muted text-xs">Stripe: </span>
              <strong className="text-forest dark:text-[#8EE0BA] font-extrabold">
                ${usdTotal.toLocaleString("en-US")}
              </strong>
            </div>
            {bdtTotal > 0 && (
              <div className="rounded-xl border border-sage-border bg-white dark:bg-[#141F18] px-3.5 py-1.5 shadow-2xs">
                <span className="text-muted text-xs">bKash / Nagad: </span>
                <strong className="text-clay font-extrabold">
                  ৳{bdtTotal.toLocaleString("en-US")}
                </strong>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Subscription Payment Records ({loading ? "…" : payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 p-10 text-center">
              <p className="text-sm font-semibold text-forest">
                No transactions recorded yet.
              </p>
              <p className="mt-1 text-xs text-muted">
                Completed Pro Student and Pro Tutor subscriptions will appear
                here automatically.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-sage-border text-xs uppercase tracking-wider text-muted">
                      <th className="pb-3 pr-4 font-bold">User</th>
                      <th className="pb-3 px-4 font-bold">Role</th>
                      <th className="pb-3 px-4 font-bold">Plan Name</th>
                      <th className="pb-3 px-4 font-bold">Method</th>
                      <th className="pb-3 px-4 font-bold">Amount</th>
                      <th className="pb-3 px-4 font-bold">Transaction ID</th>
                      <th className="pb-3 px-4 font-bold">Payment Date</th>
                      <th className="pb-3 pl-4 text-right font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-border">
                    {paginatedPayments.map((p) => {
                      const method = (p.paymentMethod || "").toLowerCase();
                      const isBdt = (p.currency || "").toUpperCase() === "BDT" || method === "bkash" || method === "nagad";

                      return (
                        <tr key={p._id} className="hover:bg-sage-bg/40">
                          <td className="py-3.5 pr-4">
                            <p className="font-bold text-forest">{p.userName}</p>
                            <p className="text-xs text-muted">{p.userEmail}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant="sage" className="capitalize">
                              {p.userRole}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-ink">
                            {p.planName}
                          </td>
                          <td className="py-3.5 px-4">
                            {method === "bkash" ? (
                              <span className="inline-flex items-center rounded-md border border-pink-200 bg-pink-50 px-2 py-0.5 text-xs font-bold text-pink-700 dark:border-pink-900/60 dark:bg-pink-950/40 dark:text-pink-300">
                                bKash
                              </span>
                            ) : method === "nagad" ? (
                              <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300">
                                Nagad
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                                Stripe
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-clay">
                            {isBdt
                              ? `৳${Number(p.amount).toLocaleString("en-US")}`
                              : `$${Number(p.amount).toLocaleString("en-US")}`}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-muted">
                            {p.transactionId || p.stripeSessionId || "—"}
                          </td>
                          <td className="py-3.5 px-4 text-muted">
                            {formatDate(p.paidAt || p.createdAt)}
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            <Badge variant="success" className="capitalize">
                              {p.paymentStatus || "paid"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={payments.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
