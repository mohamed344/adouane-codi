"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/app-header";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Lock, Globe, Bell, Loader2 } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
] as const;

export default function SettingsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (passwords.new.length < 6) {
      setPasswordError(t("auth.passwordMin"));
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError(t("auth.passwordMatch"));
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });

    if (error) {
      toast({ variant: "destructive", title: t("settingsPage.passwordError") });
    } else {
      toast({ variant: "success", title: t("settingsPage.passwordUpdated") });
      setPasswords({ current: "", new: "", confirm: "" });
    }
    setPasswordLoading(false);
  }

  function handleLanguageChange(langCode: string) {
    document.cookie = `NEXT_LOCALE=${langCode};path=/;max-age=31536000`;
    router.replace(pathname, { locale: langCode });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader activeItem="settings" />

      <main className="flex-1">
        <div className="container py-8 max-w-2xl">
          <PageHeader
            title={t("settingsPage.title")}
            subtitle={t("settingsPage.subtitle")}
          />

          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-primary" />
                  {t("settingsPage.changePassword")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t("settingsPage.currentPassword")}</Label>
                    <PasswordInput
                      id="currentPassword"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t("settingsPage.newPassword")}</Label>
                    <PasswordInput
                      id="newPassword"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">{t("settingsPage.confirmNewPassword")}</Label>
                    <PasswordInput
                      id="confirmNewPassword"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                  <div className="pt-2">
                    <Button type="submit" className="rounded-lg" disabled={passwordLoading}>
                      {passwordLoading && <Loader2 className="animate-spin" />}
                      {t("settingsPage.updatePassword")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Language Preference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-primary" />
                  {t("settingsPage.languagePreference")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("settingsPage.languageDescription")}
                </p>
                <div className="flex flex-wrap gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        locale === lang.code
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground/70 hover:border-foreground/30 hover:bg-muted"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-primary" />
                  {t("settingsPage.notifications")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("settingsPage.subscriptionReminders")}</p>
                      <p className="text-xs text-muted-foreground">{t("settingsPage.emailNotifications")}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("settingsPage.productUpdates")}</p>
                      <p className="text-xs text-muted-foreground">{t("settingsPage.emailNotifications")}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
