"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/language-switcher";
import { FormField } from "@/components/form-field";
import { CustomsLogo } from "@/components/customs-logo";

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const schema = z.object({ email: z.string().email(t("auth.invalidEmail")) });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError("");
    const result = schema.safeParse({ email });
    if (!result.success) { setFieldError(result.error.issues[0].message); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/${locale}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setFieldError(error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setFieldError(String(err));
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <div className="flex items-center justify-between px-6 py-5">
        <Link href="/login" className="inline-flex items-center gap-2 rounded-md text-sm text-[hsl(var(--muted-fg))] transition-colors hover:text-[hsl(var(--foreground))]">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("auth.backToLogin")}
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <CustomsLogo className="mx-auto mb-5 h-12 w-12" />
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">
              {t("auth.forgotPasswordTitle")}
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
              {t("auth.forgotPasswordSubtitle")}
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-[hsl(var(--success)/0.30)] bg-[hsl(var(--success-soft))] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)]">
                <CheckCircle2 className="size-6 text-[hsl(var(--success))]" />
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[hsl(var(--foreground-2))]">
                {t("auth.resetEmailSent")}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">
                  <ArrowLeft className="size-4 rtl:rotate-180" />
                  {t("auth.backToLogin")}
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label={t("common.email")} htmlFor="email" error={fieldError} required>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!fieldError} />
              </FormField>
              <Button type="submit" size="lg" className="w-full" loading={loading} disabled={loading}>
                {t("auth.sendResetLink")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
