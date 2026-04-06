"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { User, Settings, Receipt, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface UserNavProps {
  userName?: string;
  userEmail?: string;
  variant?: "light" | "dark";
}

export function UserNav({ userName, userEmail, variant = "light" }: UserNavProps) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isDark = variant === "dark";

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const menuItemClass = isDark
    ? "flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
    : "flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/80 hover:bg-muted transition-colors";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div className={`absolute end-0 top-full mt-2 w-56 rounded-xl z-50 ${
          isDark
            ? "bg-foreground border border-white/10"
            : "border border-border bg-card"
        }`}>
          {(userName || userEmail) && (
            <div className={`px-3 py-2.5 border-b ${isDark ? "border-white/10" : "border-border"}`}>
              {userName && (
                <p className={`text-sm font-medium truncate ${isDark ? "text-white" : ""}`}>{userName}</p>
              )}
              {userEmail && (
                <p className={`text-xs truncate ${isDark ? "text-white/50" : "text-muted-foreground"}`}>{userEmail}</p>
              )}
            </div>
          )}
          <div className="py-1">
            <Link href="/profile" onClick={() => setOpen(false)} className={menuItemClass}>
              <User className="h-4 w-4" />
              {t("common.profile")}
            </Link>
            <Link href="/billing" onClick={() => setOpen(false)} className={menuItemClass}>
              <Receipt className="h-4 w-4" />
              {t("common.billing")}
            </Link>
            <Link href="/settings" onClick={() => setOpen(false)} className={menuItemClass}>
              <Settings className="h-4 w-4" />
              {t("common.settings")}
            </Link>
          </div>
          <div className={`border-t py-1 ${isDark ? "border-white/10" : "border-border"}`}>
            <button onClick={handleLogout} className={`w-full ${menuItemClass}`}>
              <LogOut className="h-4 w-4" />
              {t("common.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
