"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Search, LogOut } from "lucide-react";
import { CustomsLogo } from "@/components/customs-logo";

export default function SearchPage() {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // Search functionality placeholder
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2.5">
          <CustomsLogo className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight">{t("common.appName")}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-4">
              <CustomsLogo className="h-16 w-16" />
              <span className="text-5xl font-bold tracking-tight">
                {t("common.appName")}
              </span>
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-semibold text-foreground">
            {t("search.welcome")}
          </h2>
          <p className="mb-8 text-muted-foreground">
            {t("search.subtitle")}
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="h-14 text-lg px-6 rounded-full shadow-md"
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 rounded-full px-8"
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline ms-2">{t("search.button")}</span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
