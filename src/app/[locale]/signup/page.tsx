"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { LanguageSwitcher } from "@/components/language-switcher";
import { FormField } from "@/components/form-field";
import { CustomsLogo } from "@/components/customs-logo";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const schema = z
    .object({
      firstName: z.string().min(1, t("auth.firstNameRequired")),
      lastName: z.string().min(1, t("auth.lastNameRequired")),
      email: z.string().email(t("auth.invalidEmail")),
      phone: z.string().optional(),
      password: z.string().min(6, t("auth.passwordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.passwordMatch"),
      path: ["confirmPassword"],
    });

  function handleNextStep() {
    setFieldErrors({});
    if (!formData.firstName.trim()) { setFieldErrors({ firstName: t("auth.firstNameRequired") }); return; }
    if (!formData.lastName.trim()) { setFieldErrors({ lastName: t("auth.lastNameRequired") }); return; }
    const emailResult = z.string().email(t("auth.invalidEmail")).safeParse(formData.email);
    if (!emailResult.success) { setFieldErrors({ email: emailResult.error.issues[0].message }); return; }
    setStep(2);
  }

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

    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || null,
        },
      },
    });

    if (authError) {
      toast({ variant: "destructive", title: t("auth.signUpError") });
      setLoading(false);
      return;
    }

    setLoading(false);
    setSent(true);
  }

  function getPasswordStrength(password: string) {
    if (password.length === 0) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: t("auth.passwordWeak", { defaultMessage: "Weak" }), color: "bg-[hsl(var(--destructive))]" };
    if (score <= 3) return { level: 2, label: t("auth.passwordMedium", { defaultMessage: "Medium" }), color: "bg-[hsl(var(--warning))]" };
    return { level: 3, label: t("auth.passwordStrong", { defaultMessage: "Strong" }), color: "bg-[hsl(var(--success))]" };
  }

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md text-sm text-[hsl(var(--muted-fg))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("common.appName")}
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Centered form */}
      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <CustomsLogo className="mx-auto mb-5 h-12 w-12" />
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">
              {t("auth.signUpTitle")}
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
              {t("auth.signUpSubtitle")}
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-[hsl(var(--success)/0.30)] bg-[hsl(var(--success-soft))] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)]">
                <CheckCircle2 className="size-6 text-[hsl(var(--success))]" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-[hsl(var(--foreground))]">
                {t("auth.confirmEmailTitle")}
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-[hsl(var(--foreground-2))]">
                {t("auth.confirmEmailSent")}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">
                  <ArrowLeft className="size-4 rtl:rotate-180" />
                  {t("auth.backToLogin")}
                </Link>
              </Button>
            </div>
          ) : (
          <>
          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-3" aria-label={`Step ${step} of 2`}>
            <div className="flex flex-1 flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-fg))]">
                Step 1
              </span>
              <div className={cn("h-1 rounded-full", step >= 1 ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--surface-3))]")} />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-fg))]">
                Step 2
              </span>
              <div className={cn("h-1 rounded-full", step >= 2 ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--surface-3))]")} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label={t("common.firstName")} htmlFor="firstName" error={fieldErrors.firstName} required>
                    <Input id="firstName" autoComplete="given-name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} invalid={!!fieldErrors.firstName} />
                  </FormField>
                  <FormField label={t("common.lastName")} htmlFor="lastName" error={fieldErrors.lastName} required>
                    <Input id="lastName" autoComplete="family-name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} invalid={!!fieldErrors.lastName} />
                  </FormField>
                </div>
                <FormField label={t("common.email")} htmlFor="email" error={fieldErrors.email} required>
                  <Input id="email" type="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} invalid={!!fieldErrors.email} />
                </FormField>
                <Button type="button" onClick={handleNextStep} size="lg" className="w-full">
                  {t("common.continue", { defaultMessage: "Continue" })}
                </Button>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <FormField label={t("common.phone")} htmlFor="phone">
                  <Input id="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </FormField>
                <FormField label={t("common.password")} htmlFor="password" error={fieldErrors.password} required>
                  <PasswordInput id="password" autoComplete="new-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} invalid={!!fieldErrors.password} />
                  {formData.password ? (
                    <div className="mt-2">
                      <div className="mb-1 flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= strength.level ? strength.color : "bg-[hsl(var(--surface-3))]")} />
                        ))}
                      </div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))]">{strength.label}</p>
                    </div>
                  ) : null}
                </FormField>
                <FormField label={t("auth.confirmPassword")} htmlFor="confirmPassword" error={fieldErrors.confirmPassword} required>
                  <PasswordInput id="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} invalid={!!fieldErrors.confirmPassword} />
                </FormField>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} size="lg">
                    {t("common.back", { defaultMessage: "Back" })}
                  </Button>
                  <Button type="submit" className="flex-1" size="lg" loading={loading} disabled={loading}>
                    {t("auth.signUpButton")}
                  </Button>
                </div>
              </>
            ) : null}
          </form>

          <p className="mt-8 text-center text-sm text-[hsl(var(--muted-fg))]">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="font-medium text-[hsl(var(--accent))] hover:underline">
              {t("common.login")}
            </Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
