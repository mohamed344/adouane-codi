"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
] as const;

interface LanguageSwitcherProps {
  variant?: "light" | "dark";
}

export function LanguageSwitcher({ variant = "light" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    router.replace(pathname, { locale: newLocale as "en" | "fr" | "ar" });
    setOpen(false);
  }

  const isDark = variant === "dark";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          isDark
            ? "text-white/60 hover:text-white hover:bg-white/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <Globe className="h-4 w-4" />
      </button>
      {open && (
        <div className={`absolute end-0 top-full mt-2 w-36 rounded-xl p-1.5 z-50 ${
          isDark
            ? "bg-secondary border border-white/10"
            : "bg-popover border border-border"
        }`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full rounded-lg px-3 py-2 text-start text-sm transition-colors ${
                isDark
                  ? locale === lang.code
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  : locale === lang.code
                    ? "bg-muted font-medium"
                    : "hover:bg-muted"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
