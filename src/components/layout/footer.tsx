import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "./brand-logo";

function XBrandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-sage-border bg-forest dark:bg-[#08100B] dark:border-[#1A2820] text-white dark:text-[#EFF5F0]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Tagline */}
          <div className="space-y-4">
            <BrandLogo inverted />
            <p className="text-sm leading-relaxed text-white/75 dark:text-white/75">
              Smart tuition and 1-on-1 mentorship platform connecting dedicated
              students with verified tutors across online and offline batches.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow MentorLagbe on X"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 dark:bg-white/10 text-white hover:bg-clay dark:hover:bg-clay transition-colors"
              >
                <XBrandIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow MentorLagbe on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 dark:bg-white/10 text-white hover:bg-clay dark:hover:bg-clay transition-colors"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow MentorLagbe on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 dark:bg-white/10 text-white hover:bg-clay dark:hover:bg-clay transition-colors"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <Link
                  href="/"
                  className="hover:text-white dark:hover:text-[#8EE0BA] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/tuitions"
                  className="hover:text-white dark:hover:text-[#8EE0BA] transition-colors"
                >
                  Browse Tuitions
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-white dark:hover:text-[#8EE0BA] transition-colors"
                >
                  Pricing &amp; Pro Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-white dark:hover:text-[#8EE0BA] transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Accounts */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Get Started
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <Link
                  href="/sign-up"
                  className="hover:text-white dark:hover:text-[#8EE0BA] transition-colors"
                >
                  Join as a Student
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up?role=tutor"
                  className="hover:text-white dark:hover:text-[#8EE0BA] transition-colors"
                >
                  Teach as a Tutor
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="hover:text-white dark:hover:text-[#8EE0BA] transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-white dark:hover:text-[#8EE0BA] transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                <span>support@mentorlagbe.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                <span>Dhanmondi, Dhaka 1209, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/65 sm:flex-row">
          <p>&copy; {year} MentorLagbe. All rights reserved.</p>
          <p>Built for structured tuition &amp; mentorship discovery.</p>
        </div>
      </div>
    </footer>
  );
}
