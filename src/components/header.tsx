"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { CustomsLogo } from "@/components/customs-logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Header — landing-page navbar.
 * White background, slate-200 bottom border, becomes blurred on scroll.
 * When authenticated: shows UserNav avatar dropdown (Search, Profile, Billing, Settings, Logout).
 * When guest: shows Login + Sign Up buttons.
 */
export function Header() {
  const t = useTranslations("common");
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // auth state + user info
  useEffect(() => {
    const supabase = createClient();

    async function loadAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session?.user) {
        const firstName = session.user.user_metadata?.first_name || "";
        const lastName = session.user.user_metadata?.last_name || "";
        setUserName([firstName, lastName].filter(Boolean).join(" "));
        setUserEmail(session.user.email || "");
      }
    }

    loadAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        const firstName = session.user.user_metadata?.first_name || "";
        const lastName = session.user.user_metadata?.last_name || "";
        setUserName([firstName, lastName].filter(Boolean).join(" "));
        setUserEmail(session.user.email || "");
      } else {
        setUserName("");
        setUserEmail("");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { href: "#features", label: t("services") },
    { href: "#how-it-works", label: t("howItWorks") },
    { href: "#pricing", label: t("pricing") },
    { href: "#testimonials", label: t("testimonials") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full transition-colors duration-200",
        scrolled
          ? "border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.78)] backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container-app flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          <CustomsLogo className="h-7 w-7" />
          <span className="text-base font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
            {t("appName")}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[hsl(var(--muted-fg))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <Button asChild variant="primary" size="sm">
                <Link href="/search">
                  {t("search")}
                </Link>
              </Button>
              <UserNav userName={userName} userEmail={userEmail} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <Button asChild variant="primary" size="sm" className="px-2.5">
                <Link href="/search" aria-label={t("search")}>
                  {t("search")}
                </Link>
              </Button>
              <UserNav userName={userName} userEmail={userEmail} />
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[hsl(var(--foreground-2))] transition-colors hover:bg-[hsl(var(--surface-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] transition-[max-height,opacity] duration-300 ease-out",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container-app flex flex-col gap-1 py-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-3 text-sm font-medium text-[hsl(var(--foreground-2))] transition-colors hover:bg-[hsl(var(--surface))]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {!isAuthenticated ? (
            <div className="mt-2 flex gap-2 border-t border-[hsl(var(--border))] pt-3">
              <Button asChild variant="outline" className="flex-1" size="md">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild className="flex-1" size="md">
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
