"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

import { CustomsLogo } from "@/components/customs-logo";

export function Header() {
  const t = useTranslations("common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
      <div
        className={`glass-nav rounded-full transition-all duration-300 ${
          scrolled ? "shadow-lg shadow-black/10" : ""
        }`}
      >
        <div className="flex h-12 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 group">
            <CustomsLogo className="h-7 w-7 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-sm font-bold tracking-tight dark:text-white text-foreground">
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
                className="px-3 py-1.5 text-sm font-medium dark:text-white/60 dark:hover:text-white text-foreground/60 hover:text-foreground transition-colors rounded-full hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-1.5 lg:flex">
            <LanguageSwitcher />
            <Button variant="ghost" asChild className="h-8 px-3 text-sm font-medium rounded-full text-foreground/70 hover:text-foreground">
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button asChild className="h-8 px-4 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
              <Link href="/signup">{t("signup")}</Link>
            </Button>
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 mt-2 ${
          mobileMenuOpen ? "max-h-80" : "max-h-0"
        }`}
      >
        <div className="glass-nav rounded-2xl p-4">
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
                className="px-3 py-2.5 text-sm font-medium rounded-lg dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5 text-foreground/70 hover:text-foreground hover:bg-black/5 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3 mt-2 border-t border-white/10">
              <Button variant="ghost" asChild className="flex-1 rounded-full">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild className="flex-1 rounded-full bg-primary text-primary-foreground">
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
