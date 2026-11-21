"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-1.5 rounded-xl border border-sage-border bg-white px-2.5 py-1.5 text-xs font-bold text-forest transition-colors hover:bg-sage-subtle dark:border-[#23352B] dark:bg-[#141F18] dark:text-[#8EE0BA] dark:hover:bg-[#1C2B22] cursor-pointer",
        className
      )}
      aria-label="Toggle language between English and Bangla"
      title={language === "en" ? "বাংলা ভাষায় পরিবর্তন করুন" : "Switch to English"}
    >
      <Globe className="h-3.5 w-3.5 text-clay shrink-0" />
      <span className="font-extrabold tracking-wide text-[11px]">
        {language === "en" ? "বাং" : "EN"}
      </span>
    </button>
  );
}
