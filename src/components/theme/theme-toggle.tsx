"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "button";
}

const listeners = new Set<() => void>();

function subscribeTheme(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function notifyThemeChange() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      // Ignore callback errors
    }
  });
}

function getThemeSnapshot(): "dark" | "light" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getThemeServerSnapshot(): "dark" | "light" {
  return "light";
}

export function ThemeToggle({
  className,
  variant = "icon",
}: ThemeToggleProps) {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
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

    notifyThemeChange();
    window.dispatchEvent(new Event("storage"));
  };

  if (!isMounted) {
    return (
      <div
        className={cn(
          "h-9 w-9 rounded-xl border border-sage-border bg-white dark:bg-[#141F18] animate-pulse",
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
          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-sage-subtle hover:text-forest dark:hover:bg-[#1C2B22] dark:hover:text-[#8EE0BA] transition-colors cursor-pointer",
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
            <Moon className="h-4 w-4 text-forest dark:text-[#8EE0BA]" />
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
      title={isDark ? "Dark mode active — click for light mode" : "Light mode active — click for dark mode"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border border-sage-border bg-white text-forest shadow-xs hover:border-forest/40 hover:bg-sage-subtle transition-all active:scale-95 cursor-pointer dark:bg-[#141F18] dark:border-[#23352B] dark:text-[#8EE0BA] dark:hover:bg-[#1C2B22]",
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
