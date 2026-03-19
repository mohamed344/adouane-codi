"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
] as const;

export function LanguagePickerModal() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>("en");
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
          <DialogTitle className="text-center text-xl">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 text-start transition-colors ${
                selected === lang.code
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-lg font-medium">{lang.label}</span>
            </button>
          ))}
        </div>
        <Button onClick={handleContinue} className="w-full" size="lg">
          {t("continue")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
