"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Search, User, Settings, Receipt, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserNav } from "@/components/user-nav";
import { CustomsLogo } from "@/components/customs-logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/search", icon: Search, labelKey: "common.search" },
  { href: "/billing", icon: Receipt, labelKey: "common.billing" },
  { href: "/profile", icon: User, labelKey: "common.profile" },
  { href: "/settings", icon: Settings, labelKey: "common.settings" },
] as const;

/**
 * AppHeader — sticky top header for protected app pages.
 * White surface with slate-200 bottom border, indigo active state on the
 * current nav item.
 */
export function AppHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    <header className="sticky top-0 z-30 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)] backdrop-blur-lg">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          <CustomsLogo className="h-7 w-7" />
          <span className="hidden text-base font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))] sm:inline">
            {t("common.appName")}
          </span>
        </Link>

        {/* Center nav (desktop) */}
        <nav
          aria-label="Application navigation"
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary-2))]"
                    : "text-[hsl(var(--muted-fg))] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <Icon className="size-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <LanguageSwitcher />
          <UserNav userName={userName} userEmail={userEmail} />
        </div>

        {/* Mobile actions */}
        <div className="flex shrink-0 items-center gap-1.5 md:hidden">
          <LanguageSwitcher />
          <UserNav userName={userName} userEmail={userEmail} />
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

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] transition-[max-height,opacity] duration-300 ease-out",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav
          aria-label="Mobile navigation"
          className="container-app flex flex-col gap-0.5 py-3"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary-2))]"
                    : "text-[hsl(var(--foreground-2))] hover:bg-[hsl(var(--surface))]"
                )}
              >
                <Icon className="size-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
