"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

const POPULAR_TAGS = ["Math", "Physics", "IELTS", "HSC", "Programming"];

export function HeroSearch() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [query, setQuery] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      router.push("/tuitions");
      return;
    }
    router.push(`/tuitions?search=${encodeURIComponent(query.trim())}`);
  };

  const handleTagClick = (tag: string) => {
    router.push(`/tuitions?search=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="mt-6 w-full max-w-lg space-y-2.5">
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center gap-2 rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-1.5 sm:p-2 shadow-sm transition-all focus-within:border-forest/50 focus-within:ring-2 focus-within:ring-forest/20"
      >
        <Search className="ml-2.5 h-4 w-4 shrink-0 text-muted" />
        <input
          type="search"
          placeholder={
            language === "bn"
              ? "টিউশন খুঁজুন (যেমন Math, HSC, IELTS)..."
              : "Search tuitions (e.g. Math, HSC, IELTS)..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent px-2 text-sm text-ink dark:text-[#EFF5F0] placeholder:text-muted/70 focus:outline-none placeholder:truncate"
          aria-label="Search tuitions from hero"
        />
        <Button type="submit" size="sm" className="shrink-0 gap-1.5">
          <span>{t("common_search", "Search")}</span>
        </Button>
      </form>

      {/* Popular quick-search tags */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted dark:text-[#9DB3A6] pl-1">
        <span className="font-semibold text-forest dark:text-[#8EE0BA]">
          {language === "bn" ? "জনপ্রিয়:" : "Popular:"}
        </span>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagClick(tag)}
            className="rounded-lg border border-sage-border/60 bg-sage-subtle/70 dark:bg-[#1C2B22] px-2 py-0.5 text-[11px] font-semibold text-forest dark:text-[#8EE0BA] hover:bg-forest hover:text-white dark:hover:bg-[#8EE0BA] dark:hover:text-[#0C130F] transition-colors cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
