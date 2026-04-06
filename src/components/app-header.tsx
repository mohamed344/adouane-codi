"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserNav } from "@/components/user-nav";
import { CustomsLogo } from "@/components/customs-logo";
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";

export function AppHeader() {
  const t = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const firstName = user.user_metadata?.first_name || "";
        const lastName = user.user_metadata?.last_name || "";
        setUserName([firstName, lastName].filter(Boolean).join(" "));
        setUserEmail(user.email || "");
      }
    }
    loadUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full py-3 px-4">
      {/* Floating dark pill navbar */}
      <div className="mx-auto max-w-5xl rounded-full bg-secondary/95 backdrop-blur-sm px-6 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <CustomsLogo className="h-7 w-7" />
          <span className="text-sm font-bold tracking-tight text-white">
            {t("common.appName")}
          </span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher variant="dark" />
          <UserNav userName={userName} userEmail={userEmail} variant="dark" />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1.5 md:hidden">
          <LanguageSwitcher variant="dark" />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ${
          mobileMenuOpen ? "max-h-80 mt-2" : "max-h-0"
        }`}
      >
        <div className="mx-auto max-w-5xl rounded-2xl bg-secondary/95 backdrop-blur-sm px-6 pb-4 pt-2">
          <div className="border-t border-white/10 pt-3">
            <UserNav userName={userName} userEmail={userEmail} variant="dark" />
          </div>
        </div>
      </div>
    </header>
  );
}
