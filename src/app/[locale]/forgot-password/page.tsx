"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CustomsLogo } from "@/components/customs-logo";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { z } from "zod";

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const schema = z.object({
    email: z.string().email(t("auth.invalidEmail")),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError("");

    const result = schema.safeParse({ email });
    if (!result.success) {
      setFieldError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const redirectTo = `${window.location.origin}/auth/callback?next=/${locale}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (!error) {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-6 group">
            <CustomsLogo className="h-10 w-10 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight">{t("common.appName")}</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{t("auth.forgotPasswordTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            {t("auth.forgotPasswordSubtitle")}
          </p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/[0.04]">
          {sent ? (
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("auth.resetEmailSent")}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("auth.backToLogin")}
              </Link>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("common.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                  {fieldError && (
                    <p className="text-xs text-destructive">{fieldError}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pb-6">
                <Button type="submit" className="w-full h-11 font-medium rounded-lg" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
                  {t("auth.sendResetLink")}
                </Button>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("auth.backToLogin")}
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
