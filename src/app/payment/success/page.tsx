"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Info, LayoutDashboard, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/utils";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data: session, refetch } = useSession();

  const user = session?.user as { role?: string; plan?: string } | undefined;
  const dashboardHref = getDashboardPath(user?.role);

  const [verifying, setVerifying] = React.useState(Boolean(sessionId));

  React.useEffect(() => {
    if (sessionId) {
      apiFetch(
        `/api/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`
      )
        .catch(() => {})
        .finally(() => {
          setVerifying(false);
          void refetch();
        });
    }
  }, [sessionId, refetch]);

  return (
    <Card className="mx-auto w-full max-w-lg text-center shadow-sm">
      <CardContent className="p-8 sm:p-10">
        {sessionId ? (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              {verifying ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <CheckCircle2 className="h-8 w-8" />
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
              {verifying ? "Confirming Payment..." : "Payment Received"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {verifying
                ? "Connecting with Stripe to verify your transaction..."
                : "Thank you for upgrading with Stripe Checkout. Your transaction is recorded and your account plan is now upgraded to Pro."}
            </p>
            <p className="mt-4 rounded-xl bg-sage-bg px-3.5 py-2 font-mono text-xs text-muted break-all">
              Session ID: {sessionId}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-subtle text-forest border border-sage-border">
              <Info className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
              No Checkout Session Detected
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              This page confirms completed Stripe Checkout payments. To upgrade
              to the Pro Plan, start checkout from the Pricing page.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href={dashboardHref}>
            <Button size="lg">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">
              View Pricing
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <SiteShell>
      <section className="mx-auto flex max-w-7xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <React.Suspense
          fallback={
            <div className="h-72 w-full max-w-lg animate-pulse rounded-2xl border border-sage-border bg-white" />
          }
        >
          <PaymentSuccessContent />
        </React.Suspense>
      </section>
    </SiteShell>
  );
}
