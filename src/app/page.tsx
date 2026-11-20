import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BookOpen,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FlaskConical,
  Globe,
  Languages,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { FeaturedTuitions } from "@/components/home/featured-tuitions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    step: "01",
    title: "Create Your Role Account",
    description:
      "Sign up as a Student or Tutor in seconds. Everyone starts on the Free Plan with a tailored dashboard.",
    icon: UserPlus,
  },
  {
    step: "02",
    title: "Tutors Publish & Admins Review",
    description:
      "Tutors submit subject-wise batches or 1-on-1 mentorship posts with schedules and fees. Admins verify before listing.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "Search, Filter & Apply",
    description:
      "Students filter approved tuitions by subject, class level, and Online or Offline mode, then submit an application.",
    icon: Search,
  },
  {
    step: "04",
    title: "Track Decisions & Upgrade",
    description:
      "Tutors review applicants and accept or reject in real time. Upgrade anytime with Stripe for Pro benefits.",
    icon: ClipboardCheck,
  },
];

const SUBJECT_CATEGORIES = [
  {
    name: "Mathematics",
    subtitle: "Algebra, Calculus & Higher Math",
    icon: Calculator,
  },
  {
    name: "Physics",
    subtitle: "Mechanics, Optics & Electromagnetism",
    icon: Atom,
  },
  {
    name: "Programming",
    subtitle: "Python, Web Dev & Problem Solving",
    icon: Code2,
  },
  {
    name: "IELTS",
    subtitle: "Speaking, Writing & Band Strategy",
    icon: Globe,
  },
  {
    name: "Chemistry",
    subtitle: "Organic, Inorganic & Lab Prep",
    icon: FlaskConical,
  },
  {
    name: "English",
    subtitle: "Grammar, Academic Writing & Literature",
    icon: Languages,
  },
];

const PLATFORM_PILLARS = [
  {
    title: "Admin-Moderated Quality",
    description:
      "Every tuition post passes through admin review before appearing on the public catalog, keeping listings structured and clear.",
    icon: ShieldCheck,
  },
  {
    title: "Dedicated Role Workspaces",
    description:
      "Separate dashboards for Students, Tutors, and Admins ensure every workflow stays focused and clutter-free.",
    icon: Layers,
  },
  {
    title: "Online & Home Tuition Ready",
    description:
      "Whether you prefer live remote mentorship or in-person home batches, filter exact modes and weekly schedules effortlessly.",
    icon: BookOpen,
  },
];

export default function HomePage() {
  return (
    <SiteShell>
      {/* 1. Hero / Banner Section */}
      <section className="relative overflow-hidden border-b border-sage-border bg-gradient-to-b from-white via-sage-bg/50 to-sage-bg">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-6">
              <Badge variant="clay" className="px-3.5 py-1 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Tuition &amp; Mentorship Platform
              </Badge>

              <h1 className="text-4xl font-extrabold leading-[1.12] text-forest sm:text-5xl lg:text-[54px]">
                Find Your Ideal Tutor or Mentorship Batch Today
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Connect with verified tutors offering structured subject-wise
                tuition batches and 1-on-1 mentorship—online or offline—with
                transparent monthly fees and real-time application tracking.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link href="/tuitions">
                  <Button size="lg">
                    Browse Tuitions
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-up?role=tutor">
                  <Button variant="outline" size="lg">
                    Become a Tutor
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-sm font-medium text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-forest" />
                  Admin-approved listings
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-forest" />
                  Online &amp; Offline modes
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-forest" />
                  Direct application tracking
                </span>
              </div>
            </div>

            {/* Right-side Sage Studio Visual Panel */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-sage-border bg-white p-6 sm:p-7 shadow-[0_18px_50px_rgba(30,58,47,0.08)]">
                <div className="flex items-center justify-between border-b border-sage-border pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-clay">
                      Structured Ecosystem
                    </p>
                    <h2 className="mt-0.5 text-lg font-extrabold text-forest">
                      Built for Every Stakeholder
                    </h2>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white">
                    <BookOpen className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-5 space-y-3.5">
                  <div className="rounded-2xl border border-sage-border bg-sage-bg/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-forest">
                        For Students
                      </span>
                      <Badge variant="sage">Free &amp; Pro</Badge>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      Filter verified tuitions by subject, class level, and mode.
                      Apply in one click and track acceptance status live.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-sage-border bg-sage-bg/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-forest">
                        For Tutors
                      </span>
                      <Badge variant="clay">Up to Unlimited</Badge>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      Publish tuition batches with banners, manage schedules,
                      toggle batch availability, and accept applicants cleanly.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-sage-border bg-sage-bg/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-forest">
                        Admin Moderation
                      </span>
                      <Badge variant="default">Verified</Badge>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      Every listing is reviewed before going public, alongside
                      role management and transparent Stripe subscription logs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Dynamic Featured Tuitions Section */}
      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-clay">
              Featured Listings
            </p>
            <h2 className="mt-1.5 text-3xl font-extrabold text-forest">
              Latest Approved Tuitions
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
              Explore recently approved active batches and mentorship programs
              across core academic and skill subjects.
            </p>
          </div>
          <Link href="/tuitions">
            <Button variant="outline">
              View All Tuitions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <FeaturedTuitions />
      </section>

      {/* 3. How MentorLagbe Works */}
      <section
        id="how-it-works"
        className="border-y border-sage-border bg-white py-18"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-clay">
              Simple Workflow
            </p>
            <h2 className="mt-1.5 text-3xl font-extrabold text-forest">
              How MentorLagbe Works
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              A clear, four-step process designed for students looking for
              guidance and tutors managing their cohorts.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="h-full bg-sage-bg/45">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-2xl font-extrabold text-sage-border">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-forest">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Pricing / Subscription Preview Section */}
      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-clay">
            Transparent Plans
          </p>
          <h2 className="mt-1.5 text-3xl font-extrabold text-forest">
            Start Free, Upgrade When You Grow
          </h2>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Flexible plans powered by Stripe Checkout for both students and
            independent tutors.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Free Plan */}
          <Card className="flex h-full flex-col">
            <CardContent className="flex flex-1 flex-col p-7">
              <Badge variant="sage" className="w-fit">
                Free Tier
              </Badge>
              <h3 className="mt-4 text-xl font-extrabold text-forest">
                Starter Plan
              </h3>
              <p className="mt-1 text-sm text-muted">
                Included by default for every student and tutor.
              </p>
              <p className="mt-5 text-4xl font-extrabold text-forest">
                $0{" "}
                <span className="text-sm font-medium text-muted">/ forever</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                  Browse and apply to approved tuitions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                  Post up to 2 tuition listings as a Tutor
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                  Full role-based dashboard &amp; profile
                </li>
              </ul>
              <div className="mt-auto pt-7">
                <Link href="/sign-up" className="block">
                  <Button variant="outline" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pro Student Plan */}
          <Card className="flex h-full flex-col border-clay/40 ring-1 ring-clay/15">
            <CardContent className="flex flex-1 flex-col p-7">
              <Badge variant="clay" className="w-fit">
                For Students
              </Badge>
              <h3 className="mt-4 text-xl font-extrabold text-forest">
                Pro Student Plan
              </h3>
              <p className="mt-1 text-sm text-muted">
                Priority mentorship booking and Pro profile badge.
              </p>
              <p className="mt-5 text-4xl font-extrabold text-clay">
                $10{" "}
                <span className="text-sm font-medium text-muted">/ one-time</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  Priority booking visibility with tutors
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  Pro Student status across your dashboard
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  Secure payment via Stripe Checkout
                </li>
              </ul>
              <div className="mt-auto pt-7">
                <Link href="/pricing" className="block">
                  <Button variant="accent" className="w-full">
                    Subscribe with Stripe
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pro Tutor Plan */}
          <Card className="flex h-full flex-col bg-forest dark:bg-[#15231B] text-white border-forest dark:border-[#233A2D]">
            <CardContent className="flex flex-1 flex-col p-7">
              <Badge className="w-fit bg-clay text-white">For Tutors</Badge>
              <h3 className="mt-4 text-xl font-extrabold text-white">
                Pro Tutor Plan
              </h3>
              <p className="mt-1 text-sm text-white/75">
                Scale your teaching with unlimited tuition batches.
              </p>
              <p className="mt-5 text-4xl font-extrabold text-white">
                $15{" "}
                <span className="text-sm font-medium text-white/70">
                  / one-time
                </span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  Post unlimited tuition batches (no 2-post cap)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  Verified Pro Tutor badge on your account
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  Secure payment via Stripe Checkout
                </li>
              </ul>
              <div className="mt-auto pt-7">
                <Link href="/pricing" className="block">
                  <Button variant="accent" className="w-full">
                    Subscribe with Stripe
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 5. Top Subjects & Platform Highlights */}
      <section className="border-t border-sage-border bg-white py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-clay">
                  Popular Subjects
                </p>
                <h2 className="mt-1.5 text-3xl font-extrabold text-forest">
                  Explore by Subject Category
                </h2>
              </div>
              <Link href="/tuitions">
                <Button variant="ghost">
                  Explore All Subjects
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SUBJECT_CATEGORIES.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={`/tuitions?subject=${encodeURIComponent(item.name)}`}
                    className="group flex items-center gap-4 rounded-2xl border border-sage-border bg-sage-bg/50 p-5 transition-all hover:border-forest/40 hover:bg-white hover:shadow-sm"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-forest border border-sage-border group-hover:bg-forest group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-forest group-hover:text-clay transition-colors">
                        {item.name}
                      </h3>
                      <p className="truncate text-xs text-muted">
                        {item.subtitle}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLATFORM_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-sage-border bg-sage-bg/60 p-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-soft text-clay">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-forest">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
