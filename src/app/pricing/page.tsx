"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { ApiError, apiFetch } from "@/lib/api";
import { normalizeRole } from "@/lib/utils";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CheckoutPlan = "student_pro" | "tutor_pro";

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = React.useState<CheckoutPlan | null>(
    null
  );

  const user = session?.user as
    | {
        email?: string;
        name?: string;
        role?: string;
        plan?: string;
      }
    | undefined;

  const userRole = user ? normalizeRole(user.role) : null;
  const isPro = user?.plan === "pro";

  const handleSubscribe = async (plan: CheckoutPlan) => {
    if (!user) {
      toast.info("Please sign in first to subscribe to a Pro plan.");
      router.push("/sign-in?callbackUrl=/pricing");
      return;
    }

    if (isPro) {
      toast.info("Your account is already on the Pro Plan.");
      return;
    }

    const planName =
      plan === "tutor_pro" ? "Pro Tutor Plan" : "Pro Student Plan";
    const amount = plan === "tutor_pro" ? 15 : 10;

    setLoadingPlan(plan);
    try {
      const res = await apiFetch<{ url?: string; checkoutUrl?: string }>(
        "/api/payments/checkout",
        {
          method: "POST",
          body: JSON.stringify({
            plan,
            planName,
            amount,
            userRole: userRole || "student",
          }),
        }
      );

      const checkoutUrl = res?.url || res?.checkoutUrl;
      if (!checkoutUrl) {
        toast.info(
          "Stripe checkout is not ready yet. Please try again shortly."
        );
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        toast.info(
          "Stripe checkout is not ready yet on the server. Please try again once the checkout endpoint is live."
        );
      } else if (err instanceof ApiError && err.status === 401) {
        toast.error(
          "Backend session token is missing or expired. Please sign in again."
        );
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Could not start Stripe checkout.");
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="clay" className="px-3.5 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, One-Time Upgrades
          </Badge>
          <h1 className="mt-4 text-3xl font-extrabold text-forest sm:text-4xl lg:text-5xl">
            Plans for Students &amp; Tutors
          </h1>
          <p className="mt-3 text-base text-muted">
            Every MentorLagbe account starts free. Upgrade with Stripe Checkout
            whenever you want unlimited tuition posts or priority student
            booking.
          </p>
          {isPro && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              Your account is currently on the Pro Plan
            </div>
          )}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-7 md:grid-cols-3">
          {/* Free Tier */}
          <Card className="flex h-full flex-col">
            <CardContent className="flex flex-1 flex-col p-7">
              <Badge variant="sage" className="w-fit">
                Free Forever
              </Badge>
              <h2 className="mt-4 text-2xl font-extrabold text-forest">
                Free Plan
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                Everything you need to start learning or teaching on MentorLagbe.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-forest">$0</span>
                <span className="text-sm text-muted">/ forever</span>
              </div>

              <ul className="mt-7 space-y-3 text-sm text-ink">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                  <span>Full access to browse and filter approved tuitions</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                  <span>Apply to tuitions and track real-time status</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                  <span>Post up to 2 tuition listings (Tutors)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                  <span>Custom profile with ImgBB avatar upload</span>
                </li>
              </ul>

              <div className="mt-auto pt-8">
                {user ? (
                  <Link href="/dashboard" className="block">
                    <Button variant="outline" size="lg" className="w-full">
                      {isPro ? "Go to Dashboard" : "Current Plan — Dashboard"}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-up" className="block">
                    <Button variant="outline" size="lg" className="w-full">
                      Create Free Account
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pro Student Plan */}
          <Card className="flex h-full flex-col border-clay/45 ring-1 ring-clay/20">
            <CardContent className="flex flex-1 flex-col p-7">
              <Badge variant="clay" className="w-fit">
                Student Upgrade
              </Badge>
              <h2 className="mt-4 text-2xl font-extrabold text-forest">
                Pro Student Plan
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                Stand out when applying to competitive mentorship batches.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-clay">$10</span>
                <span className="text-sm text-muted">USD</span>
              </div>

              <ul className="mt-7 space-y-3 text-sm text-ink">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  <span>Priority booking status for tuition applications</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  <span>Pro Student badge in your account &amp; dashboard</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  <span>Instant account upgrade after Stripe verification</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  <span>Receipt recorded in platform billing history</span>
                </li>
              </ul>

              <div className="mt-auto pt-8">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={loadingPlan !== null || isPro}
                  onClick={() => handleSubscribe("student_pro")}
                >
                  {loadingPlan === "student_pro" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting to Stripe...
                    </>
                  ) : isPro ? (
                    "Already on Pro Plan"
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Subscribe with Stripe — $10
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pro Tutor Plan */}
          <Card className="flex h-full flex-col border-forest bg-forest text-white shadow-md">
            <CardContent className="flex flex-1 flex-col p-7">
              <Badge className="w-fit bg-clay text-white">Tutor Upgrade</Badge>
              <h2 className="mt-4 text-2xl font-extrabold text-white">
                Pro Tutor Plan
              </h2>
              <p className="mt-1.5 text-sm text-white/75">
                Built for active educators running multiple subject batches.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$15</span>
                <span className="text-sm text-white/70">USD</span>
              </div>

              <ul className="mt-7 space-y-3 text-sm text-white/90">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span>
                    Unlimited tuition batch listings (removes 2-post free limit)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span>Verified Pro Tutor status across your dashboard</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span>Instant account upgrade after Stripe verification</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span>Receipt recorded in platform billing history</span>
                </li>
              </ul>

              <div className="mt-auto pt-8">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={loadingPlan !== null || isPro}
                  onClick={() => handleSubscribe("tutor_pro")}
                >
                  {loadingPlan === "tutor_pro" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting to Stripe...
                    </>
                  ) : isPro ? (
                    "Already on Pro Plan"
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Subscribe with Stripe — $15
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}
