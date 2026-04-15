"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { LanguageSwitcher } from "@/components/language-switcher";
import { FormField } from "@/components/form-field";
import { CustomsLogo } from "@/components/customs-logo";
import { toast } from "@/components/ui/use-toast";

export default function ResetPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const schema = z
    .object({
      new: z.string().min(6, t("auth.passwordMin")),
      confirm: z.string(),
    })
    .refine((data) => data.new === data.confirm, {
      message: t("auth.passwordMatch"),
      path: ["confirm"],
    });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    const result = schema.safeParse(passwords);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => { if (err.path[0]) errors[err.path[0] as string] = err.message; });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) toast({ variant: "destructive", title: t("auth.resetError") });
    else { toast({ variant: "success", title: t("auth.resetSuccess") }); router.push("/login"); }
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
              {t("auth.resetPasswordTitle")}
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
              {t("auth.resetPasswordSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label={t("auth.newPassword")} htmlFor="newPassword" error={fieldErrors.new} required>
              <PasswordInput id="newPassword" autoComplete="new-password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} invalid={!!fieldErrors.new} />
            </FormField>
            <FormField label={t("auth.confirmNewPassword")} htmlFor="confirmPassword" error={fieldErrors.confirm} required>
              <PasswordInput id="confirmPassword" autoComplete="new-password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} invalid={!!fieldErrors.confirm} />
            </FormField>
            <Button type="submit" size="lg" className="w-full" loading={loading} disabled={loading}>
              {t("auth.resetPasswordButton")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
