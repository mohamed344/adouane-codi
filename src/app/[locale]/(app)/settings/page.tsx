"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Lock, Globe, Bell, Check } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", flag: "EN" },
  { code: "fr", label: "Français", flag: "FR" },
  { code: "ar", label: "العربية", flag: "AR" },
] as const;

const TABS = ["security", "language", "notifications"] as const;
type Tab = (typeof TABS)[number];

export default function SettingsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<Tab>("security");

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    if (!passwords.current) { setPasswordError(t("settingsPage.currentPasswordRequired")); return; }
    if (passwords.new.length < 6) { setPasswordError(t("auth.passwordMin")); return; }
    if (passwords.new !== passwords.confirm) { setPasswordError(t("auth.passwordMatch")); return; }

    setPasswordLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setPasswordError(t("settingsPage.passwordError")); setPasswordLoading(false); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: passwords.current });
    if (signInError) { setPasswordError(t("settingsPage.currentPasswordWrong")); setPasswordLoading(false); return; }

    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) toast({ variant: "destructive", title: t("settingsPage.passwordError") });
    else { toast({ variant: "success", title: t("settingsPage.passwordUpdated") }); setPasswords({ current: "", new: "", confirm: "" }); }
    setPasswordLoading(false);
  }

  function handleLanguageChange(langCode: string) {
    document.cookie = `NEXT_LOCALE=${langCode};path=/;max-age=31536000`;
    router.replace(pathname, { locale: langCode });
  }

  const tabConfig = {
    security: { icon: Lock, label: t("settingsPage.changePassword") },
    language: { icon: Globe, label: t("settingsPage.languagePreference") },
    notifications: { icon: Bell, label: t("settingsPage.notifications") },
  };

  return (
    <PageShell maxWidth="wide">
      <PageHeader
        title={t("settingsPage.title")}
        subtitle={t("settingsPage.subtitle")}
        breadcrumbs={[
          { label: t("common.home", { defaultMessage: "Home" }), href: "/search" },
          { label: t("settingsPage.title") },
        ]}
      />

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Tab navigation */}
        <nav className="shrink-0 md:w-56">
          <div className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {TABS.map((tab) => {
              const config = tabConfig[tab];
              const Icon = config.icon;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex min-h-[44px] items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary-2))]"
                      : "text-[hsl(var(--muted-fg))] hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1">
          <Card variant="default" className="overflow-hidden">
            {/* Security */}
            {activeTab === "security" ? (
              <div className="p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-2">
                  <Lock className="size-5 text-[hsl(var(--primary))]" />
                  <h3 className="text-base font-semibold">{t("settingsPage.changePassword")}</h3>
                </div>
                <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
                  <FormField label={t("settingsPage.currentPassword")} htmlFor="currentPassword" required>
                    <PasswordInput
                      id="currentPassword"
                      autoComplete="current-password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    />
                  </FormField>
                  <FormField label={t("settingsPage.newPassword")} htmlFor="newPassword" required>
                    <PasswordInput
                      id="newPassword"
                      autoComplete="new-password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                  </FormField>
                  <FormField label={t("settingsPage.confirmNewPassword")} htmlFor="confirmNewPassword" required>
                    <PasswordInput
                      id="confirmNewPassword"
                      autoComplete="new-password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                  </FormField>
                  {passwordError ? (
                    <p role="alert" className="text-sm text-[hsl(var(--destructive))]">{passwordError}</p>
                  ) : null}
                  <Button type="submit" size="lg" loading={passwordLoading} disabled={passwordLoading}>
                    {t("settingsPage.updatePassword")}
                  </Button>
                </form>
              </div>
            ) : null}

            {/* Language */}
            {activeTab === "language" ? (
              <div className="p-6 sm:p-8">
                <div className="mb-2 flex items-center gap-2">
                  <Globe className="size-5 text-[hsl(var(--primary))]" />
                  <h3 className="text-base font-semibold">{t("settingsPage.languagePreference")}</h3>
                </div>
                <p className="mb-6 text-sm text-[hsl(var(--muted-fg))]">
                  {t("settingsPage.languageDescription")}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {LANGUAGES.map((lang) => {
                    const isSelected = locale === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={cn(
                          "relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-sm font-medium transition-all",
                          isSelected
                            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-2))]"
                            : "border-[hsl(var(--border))] text-[hsl(var(--foreground-2))] hover:border-[hsl(var(--border-2))] hover:bg-[hsl(var(--surface))]"
                        )}
                      >
                        {isSelected ? (
                          <div className="absolute end-2.5 top-2.5">
                            <Check className="size-4 text-[hsl(var(--primary))]" />
                          </div>
                        ) : null}
                        <span className="text-2xl font-bold">{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Notifications */}
            {activeTab === "notifications" ? (
              <div className="p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-2">
                  <Bell className="size-5 text-[hsl(var(--primary))]" />
                  <h3 className="text-base font-semibold">{t("settingsPage.notifications")}</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between rounded-lg p-4 transition-colors hover:bg-[hsl(var(--surface))]">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{t("settingsPage.subscriptionReminders")}</p>
                      <p className="mt-0.5 text-xs text-[hsl(var(--muted-fg))]">{t("settingsPage.emailNotifications")}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg p-4 transition-colors hover:bg-[hsl(var(--surface))]">
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{t("settingsPage.productUpdates")}</p>
                      <p className="mt-0.5 text-xs text-[hsl(var(--muted-fg))]">{t("settingsPage.emailNotifications")}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
