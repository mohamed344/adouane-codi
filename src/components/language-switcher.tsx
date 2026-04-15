"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "ar", label: "العربية", short: "AR" },
] as const;

interface LanguageSwitcherProps {
  /**
   * Variant kept for backwards compatibility — the new design uses a single
   * light-mode look on every surface, so the prop is currently ignored.
   */
  variant?: "light" | "dark";
}

export function LanguageSwitcher(_: LanguageSwitcherProps = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const currentLang = languages.find((l) => l.code === locale);

  function switchLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    router.replace(pathname, { locale: newLocale as "en" | "fr" | "ar" });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Change language"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 text-xs font-medium text-[hsl(var(--foreground-2))] transition-colors hover:bg-[hsl(var(--surface))] hover:border-[hsl(var(--border-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          <Globe className="size-4 text-[hsl(var(--muted-fg))]" />
          {currentLang?.short}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => switchLocale(lang.code)}
            className="justify-between"
          >
            <span>{lang.label}</span>
            {locale === lang.code ? (
              <Check className="size-4 text-[hsl(var(--primary))]" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
