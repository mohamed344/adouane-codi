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
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 ${
        scrolled ? "bg-background/98 backdrop-blur-sm" : "bg-background"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <CustomsLogo className="h-8 w-8" />
          <span className="text-base font-bold tracking-tight text-foreground">
            {t("appName")}
          </span>
        </Link>

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
              className="px-3 py-1.5 text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <Button asChild size="sm" className="rounded-lg">
              <Link href="/search">{t("dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-lg">
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-200 ${
          mobileMenuOpen ? "max-h-80" : "max-h-0"
        }`}
      >
        <div className="container pb-4">
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
                className="px-3 py-2.5 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3 mt-2 border-t border-border">
              {isAuthenticated ? (
                <Button asChild className="flex-1 rounded-lg">
                  <Link href="/search">{t("dashboard")}</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="flex-1">
                    <Link href="/login">{t("login")}</Link>
                  </Button>
                  <Button asChild className="flex-1 rounded-lg">
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
