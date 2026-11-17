import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentCancelPage() {
  return (
    <SiteShell>
      <section className="mx-auto flex max-w-7xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto w-full max-w-lg text-center shadow-sm">
          <CardContent className="p-8 sm:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-forest sm:text-3xl">
              Checkout Cancelled
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              No charge was made to your card. Your account remains on its
              current plan, and you can upgrade anytime from the Pricing page.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/pricing">
                <Button size="lg">
                  <ArrowLeft className="h-4 w-4" />
                  Return to Pricing
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
