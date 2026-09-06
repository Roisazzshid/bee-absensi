"use client";

import { useLanguage } from "@/lib/language-context";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const nextLang = language === "id" ? "en" : "id";
    setLanguage(nextLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs font-bold"
      aria-label="Toggle language"
      title={language === "id" ? "Ganti ke English" : "Switch to Indonesian"}
    >
      <Globe className="size-4" />
      <span className="uppercase">{language}</span>
    </button>
  );
}
