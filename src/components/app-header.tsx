"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserNav } from "@/components/user-nav";
import { CustomsLogo } from "@/components/customs-logo";
import { createClient } from "@/lib/supabase/client";
import { Search, CreditCard, User, Settings, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/search", icon: Search, labelKey: "common.search" },
  { href: "/subscription", icon: CreditCard, labelKey: "common.pricing" },
  { href: "/profile", icon: User, labelKey: "common.profile" },
  { href: "/settings", icon: Settings, labelKey: "common.settings" },
] as const;

export function AppHeader() {
  const t = useTranslations();
  const pathname = usePathname();
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

  function isActive(href: string) {
    if (href === "/search") return pathname === "/search";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full py-3 px-4">
      <div className="mx-auto max-w-5xl rounded-full bg-foreground px-5 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <CustomsLogo className="h-7 w-7" />
          <span className="text-sm font-bold tracking-tight text-white hidden sm:inline">
            {t("common.appName")}
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-0.5 mx-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/55 hover:text-white hover:bg-white/8"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <LanguageSwitcher variant="dark" />
          <UserNav userName={userName} userEmail={userEmail} variant="dark" />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1.5 md:hidden">
          <LanguageSwitcher variant="dark" />
          <UserNav userName={userName} userEmail={userEmail} variant="dark" />
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
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
        <div className="mx-auto max-w-5xl rounded-2xl bg-foreground px-4 pb-3 pt-1">
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
