"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CustomsLogo } from "@/components/customs-logo";

export function Header() {
  const t = useTranslations("common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full py-3 px-4">
      {/* Floating dark pill navbar */}
      <div className="mx-auto max-w-5xl rounded-full bg-secondary/95 backdrop-blur-sm px-6 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <CustomsLogo className="h-7 w-7" />
          <span className="text-sm font-bold tracking-tight text-white">
            {t("appName")}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {[
            { href: "#services", label: t("services") },
            { href: "#how-it-works", label: t("howItWorks") },
            { href: "#pricing", label: t("pricing") },
            { href: "#testimonials", label: t("testimonials") },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher variant="dark" />
          {isAuthenticated ? (
            <Button asChild size="sm" className="rounded-full h-9 px-5">
              <Link href="/search">{t("dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full h-9 px-5">
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <LanguageSwitcher variant="dark" />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-200 ${
          mobileMenuOpen ? "max-h-80 mt-2" : "max-h-0"
        }`}
      >
        <div className="mx-auto max-w-5xl rounded-2xl bg-secondary/95 backdrop-blur-sm px-6 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            {[
              { href: "#services", label: t("services") },
              { href: "#how-it-works", label: t("howItWorks") },
              { href: "#pricing", label: t("pricing") },
              { href: "#testimonials", label: t("testimonials") },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3 mt-2 border-t border-white/10">
              {isAuthenticated ? (
                <Button asChild className="flex-1 rounded-full">
                  <Link href="/search">{t("dashboard")}</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="flex-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                    <Link href="/login">{t("login")}</Link>
                  </Button>
                  <Button asChild className="flex-1 rounded-full">
                    <Link href="/signup">{t("signup")}</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
