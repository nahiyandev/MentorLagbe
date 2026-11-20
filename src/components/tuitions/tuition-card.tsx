import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MapPin,
  Monitor,
  User,
} from "lucide-react";
import type { Tuition } from "@/types";
import { formatFee, isValidImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TuitionCardProps {
  tuition: Tuition;
}

export function TuitionCard({ tuition }: TuitionCardProps) {
  const hasBanner = isValidImageUrl(tuition.bannerImage);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sage-border bg-white shadow-[0_2px_10px_rgba(30,58,47,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(30,58,47,0.09)]">
      {/* Uniform Banner Container */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-sage-subtle">
        {hasBanner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tuition.bannerImage!}
            alt={tuition.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-forest to-forest-soft p-6 text-white">
            <BookOpen className="h-9 w-9 text-amber-200/90 mb-2" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/75">
              {tuition.subject}
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="default" className="bg-forest/90 backdrop-blur-sm">
            {tuition.subject}
          </Badge>
          <Badge
            variant={tuition.mode === "Online" ? "sage" : "clay"}
            className="bg-white/95 dark:bg-[#141F18]/95 backdrop-blur-sm"
          >
            {tuition.mode === "Online" ? (
              <Monitor className="h-3 w-3" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            {tuition.mode}
          </Badge>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-medium text-muted">
          <span className="truncate rounded-md bg-sage-subtle dark:bg-[#1C2B22] px-2 py-0.5 font-semibold text-forest dark:text-[#8EE0BA]">
            {tuition.classLevel}
          </span>
          {tuition.daysPerWeek ? (
            <span className="inline-flex shrink-0 items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-clay" />
              {tuition.daysPerWeek} days/wk
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-forest dark:text-[#8EE0BA] group-hover:text-clay dark:group-hover:text-[#E58E58] transition-colors">
          {tuition.title}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-subtle text-forest">
            <User className="h-3.5 w-3.5" />
          </span>
          <span className="truncate font-medium text-ink dark:text-[#EFF5F0]">
            {tuition.tutorName}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-sage-border pt-4 mt-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Monthly Fee
            </p>
            <p className="text-lg font-extrabold text-clay">
              {formatFee(tuition.monthlyFee)}
            </p>
          </div>
          <Link href={`/tuitions/${tuition._id}`}>
            <Button size="sm">
              View Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
