"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import {
  LogOut,
  Users,
  CreditCard,
  FileText,
  LayoutDashboard,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";
import { CustomsLogo } from "@/components/customs-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AdminProvider } from "./context";

const sidebarItemDefs = [
  { href: "/admin", icon: LayoutDashboard, labelKey: "admin.dashboard" },
  { href: "/admin/users", icon: Users, labelKey: "admin.usersManager" },
  { href: "/admin/subscriptions", icon: CreditCard, labelKey: "admin.subscriptionsManager" },
  { href: "/admin/plans", icon: FileText, labelKey: "admin.plansManager" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const navItem = (item: (typeof sidebarItemDefs)[number]) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={() => setMobileOpen(false)}
        title={sidebarCollapsed ? t(item.labelKey) : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary-2))]"
            : "text-[hsl(var(--muted-fg))] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]",
          sidebarCollapsed && "justify-center px-2"
        )}
      >
        {active ? (
          <span
            aria-hidden="true"
            className="absolute start-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[hsl(var(--primary))]"
          />
        ) : null}
        <Icon className="size-4 shrink-0" />
        {!sidebarCollapsed && t(item.labelKey)}
      </Link>
    );
  };

  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-[hsl(var(--surface))]">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-e border-[hsl(var(--border))] bg-[hsl(var(--background))] md:flex",
            "transition-[width] duration-200 ease-out",
            sidebarCollapsed ? "w-[68px]" : "w-64"
          )}
        >
          {/* Brand */}
          <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
            <Link href="/" className="flex items-center gap-2.5">
              <CustomsLogo className="h-7 w-7" />
              {!sidebarCollapsed && (
                <span className="text-base font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                  {t("common.appName")}
                </span>
              )}
            </Link>
          </div>

          {/* Nav */}
          <nav
            aria-label="Admin navigation"
            className="flex flex-1 flex-col gap-1 px-3 py-4"
          >
            {!sidebarCollapsed ? (
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg-2))]">
                {t("admin.dashboard")}
              </p>
            ) : null}
            {sidebarItemDefs.map(navItem)}
          </nav>

          {/* Bottom: collapse + logout */}
          <div className="border-t border-[hsl(var(--border))] p-3">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[hsl(var(--muted-fg))] transition-colors hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <>
                  <PanelLeftClose className="size-4" />
                  Collapse
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-30 bg-[hsl(220_45%_8%/0.55)] backdrop-blur-sm md:hidden"
            />
            <aside className="fixed inset-y-0 start-0 z-40 flex w-72 flex-col border-e border-[hsl(var(--border))] bg-[hsl(var(--background))] md:hidden">
              <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <CustomsLogo className="h-7 w-7" />
                  <span className="text-base font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                    {t("common.appName")}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--muted-fg))] hover:bg-[hsl(var(--surface-2))]"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav
                aria-label="Admin navigation (mobile)"
                className="flex flex-1 flex-col gap-1 px-3 py-4"
              >
                {sidebarItemDefs.map(navItem)}
              </nav>
            </aside>
          </>
        ) : null}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)] px-4 backdrop-blur-lg sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--foreground-2))] hover:bg-[hsl(var(--surface-2))] md:hidden"
            >
              <Menu className="size-5" />
            </button>

            <div className="flex flex-1 items-center gap-3">
              <Badge variant="indigo">
                <Shield className="size-3" />
                {t("admin.adminBadge")}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={handleLogout}
                aria-label={t("common.logout")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-xs font-medium text-[hsl(var(--foreground-2))] transition-colors hover:bg-[hsl(var(--surface))] hover:border-[hsl(var(--border-2))]"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">{t("common.logout")}</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main id="main-content" className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
