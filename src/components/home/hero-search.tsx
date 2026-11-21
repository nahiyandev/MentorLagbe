"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

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

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex w-full max-w-lg items-center gap-2 rounded-2xl border border-sage-border bg-white dark:bg-[#141F18] p-1.5 sm:p-2 shadow-sm transition-all focus-within:border-forest/50 focus-within:ring-2 focus-within:ring-forest/20"
    >
      <Search className="ml-2.5 h-4 w-4 shrink-0 text-muted" />
      <input
        type="search"
        placeholder={
          language === "bn"
            ? "বিষয়, ক্লাস বা কোর্স লিখে খুঁজুন (যেমন Math, HSC, IELTS)..."
            : "Search by subject, class, or topic (e.g. Math, HSC, IELTS)..."
        }
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-transparent px-2 text-sm text-ink dark:text-[#EFF5F0] placeholder:text-muted/70 focus:outline-none"
        aria-label="Search tuitions from hero"
      />
      <Button type="submit" size="sm" className="shrink-0 gap-1.5">
        <span>{t("common_search", "Search")}</span>
      </Button>
    </form>
  );
}
