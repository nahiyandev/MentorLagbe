"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "button";
}

const emptySubscribe = () => () => {};

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getThemeSnapshot() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

function getThemeServerSnapshot() {
  return "light";
}

export function ThemeToggle({
  className,
  variant = "icon",
}: ThemeToggleProps) {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const theme = React.useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    try {
      localStorage.setItem("mentorlagbe_theme", nextTheme);
    } catch {
      // Ignore storage errors
    }

    window.dispatchEvent(new Event("storage"));
  };

  if (!isMounted) {
    return (
      <div
        className={cn(
          "h-9 w-9 rounded-xl border border-sage-border bg-white/50 animate-pulse",
          className
        )}
      />
    );
  }

  const isDark = theme === "dark";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-sage-subtle hover:text-forest transition-colors cursor-pointer",
          className
        )}
      >
        {isDark ? (
          <>
            <Sun className="h-4 w-4 text-amber-400" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-forest" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border border-sage-border bg-white text-forest shadow-xs hover:border-forest/40 hover:bg-sage-subtle transition-all active:scale-95 cursor-pointer dark:bg-sage-surface dark:text-forest",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-forest" />
      )}
    </button>
  );
}
