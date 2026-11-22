"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Crown,
  Download,
  FileText,
  Receipt,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { PaymentRecord } from "@/types";
import { ApiError, apiFetch, extractList } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentPaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = React.useState<PaymentRecord | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const user = session?.user as { plan?: string; name?: string; email?: string } | undefined;
  const currentPlan = user?.plan === "pro" ? "Pro" : "Free";

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<unknown>("/api/payments/my-payments");
      setPayments(extractList<PaymentRecord>(res, "payments"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load payment history. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let active = true;
    async function init() {
      try {
        const res = await apiFetch<unknown>("/api/payments/my-payments");
        if (active) {
          setPayments(extractList<PaymentRecord>(res, "payments"));
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.status === 401) {
            setError("Session expired. Please log in again.");
          } else {
            setError("Failed to load payment history. Please refresh.");
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

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Transaction ID copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPaidBdt = React.useMemo(() => {
    return payments
      .filter((p) => p.paymentStatus === "paid" && (p.currency === "bdt" || p.paymentMethod === "bkash" || p.paymentMethod === "nagad"))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  const totalPaidUsd = React.useMemo(() => {
    return payments
      .filter((p) => p.paymentStatus === "paid" && (p.currency === "usd" || p.paymentMethod === "stripe"))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  const paidCount = React.useMemo(
    () => payments.filter((p) => p.paymentStatus === "paid").length,
    [payments]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 dark:bg-[#8EE0BA]/15 text-forest dark:text-[#8EE0BA]">
              <Receipt className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-forest dark:text-[#8EE0BA]">
              My Payment History
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6]">
            View all your transaction receipts, subscription billing, and payment records across Stripe, bKash, and Nagad.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/pricing">
            <Button size="sm" className="gap-1.5">
              <Crown className="h-3.5 w-3.5" />
              <span>{currentPlan === "Pro" ? "Manage Plan" : "Upgrade to Pro"}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-xs font-semibold text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* 4 StatCards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Spent"
          value={
            loading
              ? "..."
              : totalPaidUsd > 0 && totalPaidBdt > 0
                ? `$${totalPaidUsd} / ৳${totalPaidBdt.toLocaleString()}`
                : totalPaidBdt > 0
                  ? `৳${totalPaidBdt.toLocaleString()}`
                  : `$${totalPaidUsd}`
          }
          helper="Total verified payments made on platform"
          icon={Receipt}
          tone="forest"
        />
        <StatCard
          label="Completed Transactions"
          value={loading ? "..." : paidCount}
          helper="Successfully verified payment records"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Current Membership"
          value={currentPlan === "Pro" ? "Student Pro 🌟" : "Free Plan"}
          helper={currentPlan === "Pro" ? "Priority tuition applications active" : "Upgrade for priority applications"}
          icon={Crown}
          tone="amber"
        />
        <StatCard
          label="Supported Gateways"
          value="Stripe & MFS"
          helper="Cards, bKash, and Nagad verified"
          icon={CreditCard}
          tone="clay"
        />
      </div>

      {/* Payments History Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                All Transactions ({payments.length})
              </CardTitle>
              <p className="text-xs text-muted dark:text-[#9DB3A6]">
                Detailed list of all receipts and invoices generated for your account.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sage-border p-10 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-subtle text-forest dark:text-[#8EE0BA] dark:bg-[#1C2B22]">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                No payment records found
              </h3>
              <p className="text-xs text-muted dark:text-[#9DB3A6] max-w-sm mx-auto">
                You haven&apos;t made any payments yet. When you upgrade to Student Pro or pay for tuition batches, your receipts will be safely stored here.
              </p>
              <div className="pt-2">
                <Link href="/pricing">
                  <Button size="sm">Explore Pro Plans</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sage-border text-muted dark:text-[#9DB3A6]">
                    <th className="pb-2.5 font-bold">Transaction ID & Date</th>
                    <th className="pb-2.5 font-bold">Item / Plan</th>
                    <th className="pb-2.5 font-bold">Method</th>
                    <th className="pb-2.5 font-bold">Amount</th>
                    <th className="pb-2.5 font-bold">Coupon</th>
                    <th className="pb-2.5 font-bold">Status</th>
                    <th className="pb-2.5 font-bold">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-border/60">
                  {payments.map((p) => {
                    const isBdt = p.currency === "bdt" || p.paymentMethod === "bkash" || p.paymentMethod === "nagad";
                    const formattedAmount = isBdt ? `৳${(p.amount || 0).toLocaleString()}` : `$${p.amount}`;

                    return (
                      <tr
                        key={p._id || p.transactionId}
                        className="hover:bg-sage-bg/30 dark:hover:bg-[#1C2B22]/30"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-forest dark:text-[#8EE0BA]">
                            <span>{p.transactionId}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(p.transactionId)}
                              className="text-muted hover:text-forest dark:hover:text-[#8EE0BA] p-0.5 rounded cursor-pointer"
                              title="Copy Transaction ID"
                            >
                              {copiedId === p.transactionId ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-muted dark:text-[#9DB3A6] mt-0.5">
                            {formatDate(p.paidAt || p.createdAt || "")}
                          </div>
                        </td>

                        <td className="py-3 font-semibold text-ink dark:text-[#EFF5F0]">
                          {p.planName || "Pro Upgrade"}
                        </td>

                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 rounded-md bg-sage-subtle dark:bg-[#1C2B22] px-2 py-0.5 font-semibold text-forest dark:text-[#8EE0BA] border border-sage-border/60 uppercase text-[10px]">
                            {p.paymentMethod || "stripe"}
                          </span>
                          {p.senderNumber && (
                            <div className="text-[10px] text-muted dark:text-[#9DB3A6] font-mono mt-0.5">
                              {p.senderNumber}
                            </div>
                          )}
                        </td>

                        <td className="py-3 font-black text-forest dark:text-[#8EE0BA]">
                          {formattedAmount}
                        </td>

                        <td className="py-3">
                          {p.couponCode ? (
                            <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono font-bold px-1.5 py-0.5 text-[10px]">
                              {p.couponCode}
                            </span>
                          ) : (
                            <span className="text-muted text-[11px]">-</span>
                          )}
                        </td>

                        <td className="py-3">
                          <Badge
                            variant={
                              p.paymentStatus === "paid"
                                ? "success"
                                : p.paymentStatus === "pending"
                                  ? "warning"
                                  : "danger"
                            }
                            className="capitalize"
                          >
                            {p.paymentStatus}
                          </Badge>
                        </td>

                        <td className="py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReceipt(p)}
                            className="h-7 text-xs gap-1 cursor-pointer"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Invoice</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Modal Dialog */}
      {selectedReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-sage-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest/10 dark:bg-[#8EE0BA]/15 text-forest dark:text-[#8EE0BA]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-forest dark:text-[#8EE0BA]">
                  Official Payment Receipt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg p-1 text-muted hover:bg-sage-subtle hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-sage-border bg-sage-bg/40 dark:bg-[#101A14]/60 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted dark:text-[#9DB3A6]">Billed To:</span>
                  <span className="font-bold text-ink dark:text-[#EFF5F0]">
                    {selectedReceipt.userName || user?.name || "Student"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted dark:text-[#9DB3A6]">Email:</span>
                  <span className="font-mono text-ink dark:text-[#EFF5F0]">
                    {selectedReceipt.userEmail || user?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted dark:text-[#9DB3A6]">Transaction ID:</span>
                  <span className="font-mono font-bold text-forest dark:text-[#8EE0BA]">
                    {selectedReceipt.transactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted dark:text-[#9DB3A6]">Date:</span>
                  <span>{formatDate(selectedReceipt.paidAt || selectedReceipt.createdAt || "")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted dark:text-[#9DB3A6]">Payment Method:</span>
                  <span className="font-semibold uppercase">{selectedReceipt.paymentMethod}</span>
                </div>
                {selectedReceipt.senderNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted dark:text-[#9DB3A6]">Sender Phone:</span>
                    <span className="font-mono">{selectedReceipt.senderNumber}</span>
                  </div>
                )}
                {selectedReceipt.couponCode && (
                  <div className="flex justify-between">
                    <span className="text-muted dark:text-[#9DB3A6]">Discount Code:</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      {selectedReceipt.couponCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Paid Row */}
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Amount Paid
                  </span>
                  <div className="text-lg font-black text-emerald-900 dark:text-emerald-100">
                    {selectedReceipt.currency === "bdt" || selectedReceipt.paymentMethod === "bkash" || selectedReceipt.paymentMethod === "nagad"
                      ? `৳${(selectedReceipt.amount || 0).toLocaleString()} BDT`
                      : `$${selectedReceipt.amount} USD`}
                  </div>
                </div>
                <Badge variant="success" className="text-xs font-black">
                  Verified Paid
                </Badge>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-sage-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Print Receipt</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
