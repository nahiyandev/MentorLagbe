"use client";

import * as React from "react";
import { TRANSLATIONS, type Language } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = React.createContext<LanguageContextType | null>(null);

const LANGUAGE_STORAGE_KEY = "mentorlagbe_lang";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("mentorlagbe_lang_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("mentorlagbe_lang_change", callback);
  };
}

function getSnapshot(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
}

function getServerSnapshot(): Language {
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setLanguage = React.useCallback((lang: Language) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      window.dispatchEvent(new Event("mentorlagbe_lang_change"));
    } catch {
      // Ignore storage errors in private mode
    }
  }, []);

  const toggleLanguage = React.useCallback(() => {
    const next: Language = language === "en" ? "bn" : "en";
    setLanguage(next);
  }, [language, setLanguage]);

  const t = React.useCallback(
    (key: string, fallback?: string): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
      if (dict[key]) return dict[key];
      if (language === "bn" && TRANSLATIONS.en[key]) {
        return TRANSLATIONS.en[key];
      }
      return fallback || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
