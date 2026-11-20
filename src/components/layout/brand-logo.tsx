import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  inverted?: boolean;
}

export function BrandLogo({ className, inverted = false }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 group", className)}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105",
          inverted
            ? "bg-white/15 text-white ring-1 ring-white/25"
            : "bg-forest dark:bg-[#8EE0BA] text-white dark:text-[#0C130F] shadow-sm"
        )}
      >
        <GraduationCap className="h-5 w-5" />
      </span>
      <span
        className={cn(
          "text-xl font-extrabold tracking-tight",
          inverted ? "text-white" : "text-forest dark:text-[#8EE0BA]"
        )}
      >
        Mentor<span className={inverted ? "text-amber-300" : "text-clay"}>Lagbe</span>
      </span>
    </Link>
  );
}
