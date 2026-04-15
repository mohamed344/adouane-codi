"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
] as const;

export function LanguagePickerModal() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>("fr");
  const t = useTranslations("languagePicker");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hasChosen = document.cookie.includes("NEXT_LOCALE=");
    if (!hasChosen) {
      setOpen(true);
    }
  }, []);

  function handleContinue() {
    document.cookie = `NEXT_LOCALE=${selected};path=/;max-age=31536000`;
    router.replace(pathname, { locale: selected as "en" | "fr" | "ar" });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          {languages.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                aria-pressed={isSelected}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start transition-all",
                  isSelected
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary-soft))] ring-1 ring-[hsl(var(--primary)/0.30)]"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--border-2))] hover:bg-[hsl(var(--surface))]"
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden="true">{lang.flag}</span>
                  <span className="text-base font-medium text-[hsl(var(--foreground))]">
                    {lang.label}
                  </span>
                </span>
                {isSelected ? (
                  <Check className="size-5 text-[hsl(var(--primary))]" />
                ) : null}
              </button>
            );
          })}
        </div>
        <Button onClick={handleContinue} className="w-full" size="lg">
          {t("continue")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
