import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-clay-soft text-clay border border-clay/20 mb-6">
          <Compass className="h-8 w-8" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-clay">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-forest sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          The page or tuition listing you are looking for may have been moved,
          closed, or does not exist.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button size="lg">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/tuitions">
            <Button variant="outline" size="lg">
              Browse Tuitions
            </Button>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
