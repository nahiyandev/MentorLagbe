"use client";

import * as React from "react";
import { ArrowDownToLine, Check, Loader2, Receipt, X } from "lucide-react";
import { toast } from "sonner";
import type { PaymentRecord, PayoutRequest } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { formatDate, formatFee } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTransactionsPage() {
  const [tab, setTab] = React.useState<"transactions" | "payouts">("transactions");
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [payouts, setPayouts] = React.useState<PayoutRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingPayoutId, setUpdatingPayoutId] = React.useState<string | null>(null);

  // Approval Modal State
  const [selectedPayout, setSelectedPayout] = React.useState<PayoutRequest | null>(null);
  const [actionType, setActionType] = React.useState<"approved" | "rejected">("approved");
  const [actionRef, setActionRef] = React.useState("");
  const [actionNote, setActionNote] = React.useState("");

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    let active = true;
    async function init() {
      try {
        const [txRes, payoutRes] = await Promise.all([
          apiFetch<unknown>("/api/admin/transactions"),
          apiFetch<unknown>("/api/payouts/admin").catch(() => []),
        ]);
        if (active) {
          setPayments(extractList<PaymentRecord>(txRes, "transactions"));
          setPayouts(extractList<PayoutRequest>(payoutRes, "payouts"));
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError("Backend JWT token is missing or expired. Sign in again.");
          } else {
            setError(err instanceof Error ? err.message : "Could not load data.");
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, []);

  const handleProcessPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;

    setUpdatingPayoutId(selectedPayout._id);
    try {
      const res = await apiFetch<PayoutRequest>(`/api/payouts/${selectedPayout._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: actionType,
          transactionReference: actionRef.trim(),
          adminNote: actionNote.trim(),
        }),
      });

      setPayouts((prev) =>
        prev.map((p) => (p._id === selectedPayout._id ? res : p))
      );
      toast.success(
        actionType === "approved"
          ? `Payout of ৳${selectedPayout.amount} approved!`
          : "Payout request rejected."
      );
      setSelectedPayout(null);
      setActionRef("");
      setActionNote("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update payout.");
    } finally {
      setUpdatingPayoutId(null);
    }
  };

  const pendingPayoutsCount = React.useMemo(
    () => payouts.filter((p) => p.status === "pending").length,
    [payouts]
  );

  const usdTotal = payments
    .filter((p) => (p.currency || "USD").toUpperCase() === "USD")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const bdtTotal = payments
    .filter((p) => (p.currency || "").toUpperCase() === "BDT")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPages = Math.ceil(
    (tab === "transactions" ? payments.length : payouts.length) / ITEMS_PER_PAGE
  );

  const paginatedPayments = payments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginatedPayouts = payouts.slice(
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
            All Stripe, bKash, and Nagad payments and tutor withdrawal payouts.
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

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-sage-border pb-2">
        <button
          type="button"
          onClick={() => {
            setTab("transactions");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            tab === "transactions"
              ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-xs"
              : "text-muted hover:text-forest dark:hover:text-[#8EE0BA] hover:bg-sage-subtle dark:hover:bg-[#1C2B22]"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Subscription Payments ({payments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("payouts");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            tab === "payouts"
              ? "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-xs"
              : "text-muted hover:text-forest dark:hover:text-[#8EE0BA] hover:bg-sage-subtle dark:hover:bg-[#1C2B22]"
          }`}
        >
          <ArrowDownToLine className="h-4 w-4" />
          <span>Tutor Payout Requests ({payouts.length})</span>
          {pendingPayoutsCount > 0 && (
            <span className="rounded-full bg-amber-500 text-white px-2 py-0.2 text-[10px] font-black">
              {pendingPayoutsCount} pending
            </span>
          )}
        </button>
      </div>

      {tab === "transactions" ? (
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
                  Completed Pro Student and Pro Tutor subscriptions will appear here automatically.
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
                        const isBdt =
                          (p.currency || "").toUpperCase() === "BDT" ||
                          method === "bkash" ||
                          method === "nagad";

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
      ) : (
        /* Payout Requests Card */
        <Card>
          <CardHeader>
            <CardTitle>
              Tutor Payout Requests ({loading ? "…" : payouts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sage-border bg-sage-bg/50 p-10 text-center">
                <p className="text-sm font-semibold text-forest">
                  No payout requests submitted yet.
                </p>
                <p className="mt-1 text-xs text-muted">
                  When tutors request withdrawals from their earnings page, they will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-sage-border text-xs uppercase tracking-wider text-muted">
                        <th className="pb-3 pr-4 font-bold">Tutor</th>
                        <th className="pb-3 px-4 font-bold">Amount</th>
                        <th className="pb-3 px-4 font-bold">Method & Account</th>
                        <th className="pb-3 px-4 font-bold">Request Date</th>
                        <th className="pb-3 px-4 font-bold">Status</th>
                        <th className="pb-3 pl-4 text-right font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-border">
                      {paginatedPayouts.map((p) => (
                        <tr key={p._id} className="hover:bg-sage-bg/40">
                          <td className="py-3.5 pr-4">
                            <p className="font-bold text-forest">{p.tutorName}</p>
                            <p className="text-xs text-muted">{p.tutorEmail}</p>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-forest dark:text-[#8EE0BA]">
                            {formatFee(p.amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="uppercase text-xs font-bold rounded-md bg-sage-subtle px-2 py-0.5 border border-sage-border">
                              {p.paymentMethod}
                            </span>
                            <div className="text-xs font-mono text-muted mt-0.5">
                              {p.accountNumber}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-muted">
                            {formatDate(p.requestedAt)}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                p.status === "approved"
                                  ? "success"
                                  : p.status === "rejected"
                                    ? "danger"
                                    : "warning"
                              }
                              className="capitalize"
                            >
                              {p.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            {p.status === "pending" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                  disabled={updatingPayoutId === p._id}
                                  onClick={() => {
                                    setSelectedPayout(p);
                                    setActionType("approved");
                                    setActionRef("");
                                    setActionNote("");
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Approve</span>
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  disabled={updatingPayoutId === p._id}
                                  onClick={() => {
                                    setSelectedPayout(p);
                                    setActionType("rejected");
                                    setActionRef("");
                                    setActionNote("");
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                  <span>Reject</span>
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted">
                                {p.transactionReference || p.adminNote || "Processed"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={payouts.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Payout Action Modal */}
      {selectedPayout && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-sage-border pb-3">
              <h3 className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                {actionType === "approved" ? "Approve Tutor Payout" : "Reject Tutor Payout"}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
                className="rounded-lg p-1 text-muted hover:bg-sage-subtle hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-sage-border bg-sage-bg/40 dark:bg-[#101A14]/60 p-3 space-y-1.5">
              <p>
                <strong>Tutor:</strong> {selectedPayout.tutorName} ({selectedPayout.tutorEmail})
              </p>
              <p>
                <strong>Requested Amount:</strong> {formatFee(selectedPayout.amount)}
              </p>
              <p>
                <strong>Method:</strong> {selectedPayout.paymentMethod.toUpperCase()} ({selectedPayout.accountNumber})
              </p>
            </div>

            <form onSubmit={handleProcessPayout} className="space-y-3">
              {actionType === "approved" ? (
                <div className="space-y-1">
                  <label className="font-bold">Transaction Reference / Trx ID (Optional):</label>
                  <input
                    type="text"
                    value={actionRef}
                    onChange={(e) => setActionRef(e.target.value)}
                    placeholder="e.g. TRX123456789"
                    className="w-full rounded-xl border border-sage-border bg-white dark:bg-[#1C2B22] px-3 py-2 text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-bold">Reason for Rejection:</label>
                  <input
                    type="text"
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="e.g. Account number incorrect or insufficient funds"
                    required
                    className="w-full rounded-xl border border-sage-border bg-white dark:bg-[#1C2B22] px-3 py-2 text-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sage-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPayout(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant={actionType === "approved" ? "default" : "destructive"}
                  disabled={updatingPayoutId === selectedPayout._id}
                  className="gap-1.5"
                >
                  {updatingPayoutId === selectedPayout._id && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>{actionType === "approved" ? "Confirm Approval" : "Confirm Rejection"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
