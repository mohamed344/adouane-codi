"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserNav } from "@/components/user-nav";
import { CustomsLogo } from "@/components/customs-logo";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, Menu, X } from "lucide-react";

type NavItem = "subscription" | "billing" | "profile" | "settings";

interface AppHeaderProps {
  activeItem?: NavItem;
}

const NAV_ITEMS: { key: NavItem; href: string; icon: typeof CreditCard; labelKey: string }[] = [];

export function AppHeader({ activeItem }: AppHeaderProps) {
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

  function isActive(key: NavItem) {
    if (activeItem) return activeItem === key;
    return pathname.startsWith(`/${key}`);
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/98 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <CustomsLogo className="h-8 w-8" />
            <span className="text-base font-bold tracking-tight text-foreground">
              {t("common.appName")}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.key);
              const Icon = item.icon;
              return active ? (
                <span
                  key={item.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(item.labelKey)}
                </span>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <UserNav userName={userName} userEmail={userEmail} />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1.5 md:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ${
          mobileMenuOpen ? "max-h-80" : "max-h-0"
        }`}
      >
        <div className="container pb-4">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.key);
              const Icon = item.icon;
              return active ? (
                <span
                  key={item.key}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </span>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
            <div className="pt-3 mt-2 border-t border-border">
              <div className="px-3 py-2">
                <UserNav userName={userName} userEmail={userEmail} />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
