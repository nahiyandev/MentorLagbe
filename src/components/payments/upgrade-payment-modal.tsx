"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  ShieldCheck,
  Smartphone,
  Sparkles,
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

  const planName = plan === "tutor_pro" ? "Tutor Pro" : "Student Pro";
  const amountBdt = plan === "tutor_pro" ? 1500 : 1000;
  const amountUsd = plan === "tutor_pro" ? 15 : 10;

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
            amount: amountUsd,
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
            amount: amountBdt,
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
          : "Choose your preferred payment method to activate your Pro subscription."
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
        <div className="space-y-5">
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

          {method === "stripe" ? (
            /* Stripe Checkout View */
            <div className="space-y-4 rounded-xl border border-sage-border bg-sage-bg/60 dark:bg-[#1C2B22]/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-muted">Subscription Fee</span>
                <span className="text-lg font-black text-forest dark:text-[#8EE0BA]">
                  ${amountUsd} USD
                </span>
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
                  <span className="text-base font-black text-clay">
                    ৳{amountBdt} BDT
                  </span>
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
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                {copied && (
                  <p className="text-[10px] text-emerald-600 font-semibold text-right">
                    Copied to clipboard!
                  </p>
                )}

                <p className="text-[11px] text-muted dark:text-[#9DB3A6] border-t border-sage-border pt-2 leading-relaxed">
                  ১. {method === "bkash" ? "bKash" : "Nagad"} অ্যাপে <strong>Send Money</strong> অপশনে যান।
                  <br />
                  ২. উপরের নম্বরে <strong>৳{amountBdt}</strong> পাঠিয়ে নিচে আপনার ফোন নম্বর ও ট্রানজেকশন আইডি (TrxID) দিন।
                </p>
              </div>

              {/* Inputs */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="senderNumber" className="text-xs">
                    Your {method === "bkash" ? "bKash" : "Nagad"} Number
                  </Label>
                  <Input
                    id="senderNumber"
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="transactionId" className="text-xs">
                    Transaction ID (TrxID)
                  </Label>
                  <Input
                    id="transactionId"
                    placeholder="e.g. BLA892JK1X"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                    className="text-sm uppercase font-mono tracking-wider"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full gap-2 text-white ${
                  method === "bkash"
                    ? "bg-[#E2136E] hover:bg-[#c10f5d]"
                    : "bg-[#ED1C24] hover:bg-[#c9181f]"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                <span>Verify &amp; Activate Pro</span>
              </Button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <Sparkles className="h-3.5 w-3.5 text-clay" />
            <span>Instant activation upon verification. Cancel anytime.</span>
          </div>
        </div>
      )}
    </Dialog>
  );
}
