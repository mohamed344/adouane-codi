"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b bg-background/95 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <CustomsLogo className="h-9 w-9 transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight tracking-tight">{t("appName")}</span>
            <span className="text-[10px] text-muted-foreground leading-none hidden sm:block">Customs Intelligence</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {[
            { href: "#services", label: t("services") },
            { href: "#how-it-works", label: t("howItWorks") },
            { href: "#features", label: t("features") },
            { href: "#pricing", label: t("pricing") },
            { href: "#testimonials", label: t("testimonials") },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-2/3 after:rounded-full"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button variant="ghost" asChild className="font-medium">
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button asChild className="font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
            <Link href="/signup">{t("signup")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-80 border-t" : "max-h-0"
        }`}
      >
        <div className="bg-background/98 backdrop-blur-xl p-4">
          <nav className="flex flex-col gap-1">
            {[
              { href: "#services", label: t("services") },
              { href: "#how-it-works", label: t("howItWorks") },
              { href: "#features", label: t("features") },
              { href: "#pricing", label: t("pricing") },
              { href: "#testimonials", label: t("testimonials") },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3 mt-2 border-t">
              <Button variant="ghost" asChild className="flex-1">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
