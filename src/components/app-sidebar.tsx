"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { CustomsLogo } from "@/components/customs-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Search,
  CreditCard,
  User,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const MAIN_NAV = [
  { href: "/search", icon: Search, labelKey: "common.search" },
  { href: "/subscription", icon: CreditCard, labelKey: "common.pricing" },
] as const;

const ACCOUNT_NAV = [
  { href: "/profile", icon: User, labelKey: "common.profile" },
  { href: "/billing", icon: Receipt, labelKey: "common.billing" },
  { href: "/settings", icon: Settings, labelKey: "common.settings" },
] as const;

export function AppSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail
      ? userEmail[0].toUpperCase()
      : "U";

  function isActive(href: string) {
    if (href === "/search") return pathname === "/search";
    return pathname.startsWith(href);
  }

  const navLinkClass = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    }`;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-3 pb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <CustomsLogo className="h-8 w-8" />
          <span className="text-base font-bold tracking-tight">
            {t("common.appName")}
          </span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1">
        {MAIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={navLinkClass(item.href)}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>

      {/* Spacer + Account section */}
      <div className="mt-8">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
          {t("common.profile")}
        </p>
        <nav className="flex flex-col gap-1">
          {ACCOUNT_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(item.href)}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom: user + logout */}
      <div className="mt-auto pt-6">
        <div className="px-3 mb-3">
          <LanguageSwitcher />
        </div>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {userName && (
              <p className="truncate text-sm font-medium">{userName}</p>
            )}
            {userEmail && (
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t("common.logout")}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-muted/30 p-4 pt-6">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-50 flex md:hidden items-center justify-between bg-background px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <CustomsLogo className="h-7 w-7" />
          <span className="text-sm font-bold tracking-tight">
            {t("common.appName")}
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted/50 transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 start-0 z-50 w-72 flex flex-col bg-background p-4 pt-6 md:hidden overflow-y-auto">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
