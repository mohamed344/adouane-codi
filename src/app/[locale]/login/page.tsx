"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { LanguageSwitcher } from "@/components/language-switcher";
import { FormField } from "@/components/form-field";
import { CustomsLogo } from "@/components/customs-logo";
import { toast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const schema = z.object({
    email: z.string().email(t("auth.invalidEmail")),
    password: z.string().min(6, t("auth.passwordMin")),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const result = schema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      toast({ variant: "destructive", title: t("auth.signInError") });
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role === "admin") {
        router.push("/admin");
        return;
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (subscription) router.push("/search");
      else router.push("/subscription");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md text-sm text-[hsl(var(--muted-fg))] transition-colors hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("common.appName")}
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Centered form — no card, directly on the page */}
      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          {/* Logo + heading */}
          <div className="mb-10 text-center">
            <CustomsLogo className="mx-auto mb-5 h-12 w-12" />
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">
              {t("auth.signInTitle")}
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
              {t("auth.signInSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              label={t("common.email")}
              htmlFor="email"
              error={fieldErrors.email}
              required
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
            </FormField>

            <FormField
              label={t("common.password")}
              htmlFor="password"
              error={fieldErrors.password}
              required
            >
              <PasswordInput
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
              />
            </FormField>

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[hsl(var(--accent))] hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {t("auth.signInButton")}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[hsl(var(--muted-fg))]">
            {t("auth.noAccount")}{" "}
            <Link href="/signup" className="font-medium text-[hsl(var(--accent))] hover:underline">
              {t("common.signup")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
