"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Search, User, Settings, Receipt, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface UserNavProps {
  userName?: string;
  userEmail?: string;
  /** Kept for backwards compatibility — ignored in the new light-only design. */
  variant?: "light" | "dark";
}

export function UserNav({ userName, userEmail }: UserNavProps) {
  const t = useTranslations();
  const router = useRouter();

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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("common.profile")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-xs font-semibold text-white shadow-[inset_0_1px_0_hsl(0_0%_100%/0.16),0_4px_14px_-4px_hsl(var(--primary)/0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {(userName || userEmail) ? (
          <>
            <div className="px-2.5 py-2">
              {userName ? (
                <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                  {userName}
                </p>
              ) : null}
              {userEmail ? (
                <p className="truncate text-xs text-[hsl(var(--muted-fg))]">
                  {userEmail}
                </p>
              ) : null}
            </div>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/search">
            <Search />
            {t("common.search")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User />
            {t("common.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/billing">
            <Receipt />
            {t("common.billing")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            {t("common.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} destructive>
          <LogOut />
          {t("common.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
