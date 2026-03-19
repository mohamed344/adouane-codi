"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
] as const;

export function LanguageSwitcher() {
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

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
        <Globe className="h-5 w-5" />
      </Button>
      {open && (
        <div className="absolute end-0 top-full mt-1 w-36 rounded-md border bg-popover p-1 shadow-md z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full rounded-sm px-3 py-2 text-start text-sm hover:bg-accent ${
                locale === lang.code ? "bg-accent font-medium" : ""
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
