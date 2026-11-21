"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  Smartphone,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PaymentMethod = "bkash" | "nagad" | "stripe";

interface UpgradePaymentModalProps {
  open: boolean;
  onClose: () => void;
  plan: "student_pro" | "tutor_pro";
  userRole?: string;
  onSuccess?: () => void;
}

export function UpgradePaymentModal({
  open,
  onClose,
  plan,
  userRole = "student",
  onSuccess,
}: UpgradePaymentModalProps) {
  const router = useRouter();
  const [method, setMethod] = React.useState<PaymentMethod>("bkash");
  const [senderNumber, setSenderNumber] = React.useState("");
  const [transactionId, setTransactionId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = React.useState("");
  const [couponApplying, setCouponApplying] = React.useState(false);
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    savings: number;
  } | null>(null);

  const planName = plan === "tutor_pro" ? "Tutor Pro" : "Student Pro";
  const baseAmountBdt = plan === "tutor_pro" ? 1500 : 1000;
  const baseAmountUsd = plan === "tutor_pro" ? 15 : 10;

  const effectiveAmountUsd = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.max(1, Number(((baseAmountUsd * (100 - appliedCoupon.discountValue)) / 100).toFixed(2)))
      : Math.max(1, baseAmountUsd - appliedCoupon.discountValue)
    : baseAmountUsd;

  const effectiveAmountBdt = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.max(0, Math.round((baseAmountBdt * (100 - appliedCoupon.discountValue)) / 100))
      : Math.max(0, baseAmountBdt - appliedCoupon.discountValue)
    : baseAmountBdt;

  const agentNumbers: Record<"bkash" | "nagad", string> = {
    bkash: "01712-345678",
    nagad: "01912-345678",
  };

  const handleCopyNumber = (num: string) => {
    void navigator.clipboard.writeText(num.replace("-", ""));
    setCopied(true);
    toast.success("Merchant number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }
    setCouponApplying(true);
    try {
      const res = await apiFetch<{
        valid: boolean;
        code: string;
        discountType: "percentage" | "fixed";
        discountValue: number;
        savings: number;
      }>("/api/payments/apply-coupon", {
        method: "POST",
        body: JSON.stringify({
          code: couponInput.trim(),
          amount: method === "stripe" ? baseAmountUsd : baseAmountBdt,
          currency: method === "stripe" ? "usd" : "bdt",
        }),
      });

      if (res?.valid) {
        setAppliedCoupon({
          code: res.code,
          discountType: res.discountType,
          discountValue: res.discountValue,
          savings: res.savings,
        });
        toast.success(`Coupon "${res.code}" applied! You received ${res.discountValue}% off.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired coupon code.");
    } finally {
      setCouponApplying(false);
    }
  };

  const handleStripeCheckout = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ url?: string; checkoutUrl?: string }>(
        "/api/payments/checkout",
        {
          method: "POST",
          body: JSON.stringify({
            plan,
            planName,
            amount: effectiveAmountUsd,
            couponCode: appliedCoupon?.code,
            userRole,
          }),
        }
      );

      const checkoutUrl = res?.url || res?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Stripe checkout could not be initiated.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to initiate Stripe checkout"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLocalPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber.trim() || !/^01[3-9]\d{8}$/.test(senderNumber.trim())) {
      toast.error("Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).");
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      toast.error("Please enter a valid Transaction ID (TrxID).");
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch<{ success: boolean; message: string }>(
        "/api/payments/local-pay",
        {
          method: "POST",
          body: JSON.stringify({
            paymentMethod: method,
            senderNumber: senderNumber.trim(),
            transactionId: transactionId.trim(),
            planName,
            amount: effectiveAmountBdt,
            couponCode: appliedCoupon?.code,
            userRole,
          }),
        }
      );

      if (res?.success) {
        setSuccess(true);
        toast.success(res.message || "Pro plan activated successfully!");
        onSuccess?.();
        setTimeout(() => {
          onClose();
          router.push("/dashboard");
          router.refresh();
        }, 2200);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to verify transaction ID"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={success ? "Payment Successful!" : `Upgrade to ${planName}`}
      description={
        success
          ? "Your account has been upgraded to Pro."
          : "Choose your preferred payment method to activate lifetime Pro access (one-time payment, no recurring charges)."
      }
      className="max-w-md"
    >
      {success ? (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-forest dark:text-[#8EE0BA]">
              Welcome to {planName}!
            </h3>
            <p className="mt-1 text-xs text-muted dark:text-[#9DB3A6]">
              Your payment via {method.toUpperCase()} was verified. All Pro features are now unlocked.
            </p>
          </div>
          <p className="text-[11px] text-muted">Redirecting to your dashboard...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Method Selection Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {/* bKash */}
            <button
              type="button"
              onClick={() => setMethod("bkash")}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                method === "bkash"
                  ? "border-[#E2136E] bg-pink-50/70 text-[#E2136E] dark:bg-pink-950/20 shadow-xs"
                  : "border-sage-border bg-white text-muted hover:border-forest/30 dark:bg-[#141F18]"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>bKash (বিকাশ)</span>
            </button>

            {/* Nagad */}
            <button
              type="button"
              onClick={() => setMethod("nagad")}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                method === "nagad"
                  ? "border-[#ED1C24] bg-orange-50/70 text-[#ED1C24] dark:bg-orange-950/20 shadow-xs"
                  : "border-sage-border bg-white text-muted hover:border-forest/30 dark:bg-[#141F18]"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Nagad (নগদ)</span>
            </button>

            {/* Stripe */}
            <button
              type="button"
              onClick={() => setMethod("stripe")}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                method === "stripe"
                  ? "border-forest bg-sage-subtle text-forest dark:text-[#8EE0BA] shadow-xs"
                  : "border-sage-border bg-white text-muted hover:border-forest/30 dark:bg-[#141F18]"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Cards (Stripe)</span>
            </button>
          </div>

          {/* Promo / Coupon Code Section */}
          <div className="rounded-xl border border-sage-border bg-sage-bg/30 dark:bg-[#1C2B22]/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-forest dark:text-[#8EE0BA]">
                <Tag className="h-3.5 w-3.5 text-clay" />
                <span>Have a Promo Coupon?</span>
              </div>
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponInput("");
                  }}
                  className="text-[11px] font-medium text-red-600 hover:underline cursor-pointer"
                >
                  Remove code
                </button>
              )}
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Coupon applied: {appliedCoupon.code}
                </span>
                <span className="font-black text-emerald-700 dark:text-emerald-300">
                  {appliedCoupon.discountValue}% OFF
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="h-8.5 text-xs uppercase font-mono tracking-wider"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={couponApplying || !couponInput.trim()}
                  onClick={handleApplyCoupon}
                  className="h-8.5 shrink-0 text-xs"
                >
                  {couponApplying ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
            )}
          </div>

          {method === "stripe" ? (
            /* Stripe Checkout View */
            <div className="space-y-4 rounded-xl border border-sage-border bg-sage-bg/60 dark:bg-[#1C2B22]/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-muted">One-Time Upgrade Fee</span>
                <div className="text-right">
                  {appliedCoupon && (
                    <span className="block text-xs line-through text-muted">
                      ${baseAmountUsd} USD
                    </span>
                  )}
                  <span className="text-lg font-black text-forest dark:text-[#8EE0BA]">
                    ${effectiveAmountUsd} USD
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted dark:text-[#9DB3A6]">
                Secure global payments via Visa, MasterCard, and American Express processed by Stripe.
              </p>
              <Button
                type="button"
                className="w-full gap-2"
                onClick={handleStripeCheckout}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                <span>Proceed to Stripe Checkout</span>
              </Button>
            </div>
          ) : (
            /* bKash / Nagad Mobile Banking View */
            <form onSubmit={handleLocalPayment} className="space-y-4">
              {/* Payment Instructions Card */}
              <div className="rounded-xl border border-sage-border bg-sage-bg/50 dark:bg-[#1C2B22]/40 p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted">Payable Amount:</span>
                  <div className="text-right">
                    {appliedCoupon && (
                      <span className="block text-xs line-through text-muted">
                        ৳{baseAmountBdt} BDT
                      </span>
                    )}
                    <span className="text-base font-black text-clay">
                      ৳{effectiveAmountBdt} BDT
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-sage-border pt-2">
                  <span className="text-muted">
                    Send Money ({method === "bkash" ? "bKash" : "Nagad"}):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(agentNumbers[method])}
                    className="inline-flex items-center gap-1 font-mono font-bold text-forest dark:text-[#8EE0BA] hover:underline cursor-pointer"
                  >
                    <span>{agentNumbers[method]}</span>
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>

                <p className="text-[11px] leading-relaxed text-muted dark:text-[#9DB3A6]">
                  Open your {method === "bkash" ? "bKash" : "Nagad"} app, select <strong>Send Money</strong> to the personal number above, and enter the Transaction ID (TrxID) below.
                </p>
              </div>

              {/* Sender Mobile Number */}
              <div className="space-y-1">
                <Label htmlFor="senderNumber" className="text-xs">
                  Your {method === "bkash" ? "bKash" : "Nagad"} Mobile Number
                </Label>
                <Input
                  id="senderNumber"
                  type="tel"
                  placeholder="e.g. 01712345678"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  maxLength={11}
                  required
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-1">
                <Label htmlFor="transactionId" className="text-xs">
                  Transaction ID (TrxID)
                </Label>
                <Input
                  id="transactionId"
                  type="text"
                  placeholder="e.g. BL9A7K2M"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  className="uppercase font-mono"
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Transaction...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm &amp; Activate Pro Access</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      )}
    </Dialog>
  );
}
