"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CustomsLogo } from "@/components/customs-logo";
import {
  LogOut,
  Users,
  CreditCard,
  FileText,
  LayoutDashboard,
  Shield,
} from "lucide-react";
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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Match active route - exact for /admin, startsWith for sub-routes
  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <AdminProvider>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full bg-background/98 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <CustomsLogo className="h-8 w-8 transition-transform duration-300 group-hover:scale-105" />
              <span className="text-base font-bold tracking-tight">{t("common.appName")}</span>
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {t("admin.adminBadge")}
              </Badge>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Button variant="ghost" size="icon" onClick={handleLogout} title={t("common.logout")}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="hidden md:flex w-64 flex-col bg-muted/30 p-4 gap-1">
            <nav className="flex flex-col gap-1">
              {sidebarItemDefs.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Mobile tab bar */}
          <div className="flex md:hidden border-b overflow-x-auto">
            {sidebarItemDefs.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive(item.href)
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            ))}
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
