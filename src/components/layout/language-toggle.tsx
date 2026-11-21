"use client";

import * as React from "react";
import { Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const selectLanguage = (lang: "en" | "bn") => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-sage-border bg-white text-forest transition-colors hover:bg-sage-subtle hover:text-forest dark:border-[#23352B] dark:bg-[#141F18] dark:text-[#8EE0BA] dark:hover:bg-[#1C2B22] cursor-pointer",
          open && "ring-2 ring-forest/20 dark:ring-[#8EE0BA]/20 bg-sage-subtle dark:bg-[#1C2B22]",
          className
        )}
        aria-label="Change language"
        aria-haspopup="true"
        aria-expanded={open}
        title={language === "bn" ? "ভাষা পরিবর্তন করুন" : "Change Language"}
      >
        <Globe className="h-4 w-4 text-clay shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-sage-border bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 dark:border-[#23352B] dark:bg-[#141F18]">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted dark:text-[#9DB3A6] border-b border-sage-border/60 pb-1.5 mb-1">
            {language === "bn" ? "ভাষা নির্বাচন করুন" : "Select Language"}
          </div>

          <button
            type="button"
            onClick={() => selectLanguage("en")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left",
              language === "en"
                ? "bg-forest/10 dark:bg-[#8EE0BA]/15 text-forest dark:text-[#8EE0BA] font-bold"
                : "text-ink dark:text-[#EFF5F0] hover:bg-sage-subtle dark:hover:bg-[#1C2B22]"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🇺🇸</span>
              <span>English</span>
            </div>
            {language === "en" && (
              <Check className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => selectLanguage("bn")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left",
              language === "bn"
                ? "bg-forest/10 dark:bg-[#8EE0BA]/15 text-forest dark:text-[#8EE0BA] font-bold"
                : "text-ink dark:text-[#EFF5F0] hover:bg-sage-subtle dark:hover:bg-[#1C2B22]"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🇧🇩</span>
              <span>বাংলা (Bangla)</span>
            </div>
            {language === "bn" && (
              <Check className="h-3.5 w-3.5 text-forest dark:text-[#8EE0BA]" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
