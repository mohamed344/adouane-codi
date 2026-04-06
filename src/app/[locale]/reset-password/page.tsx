"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CustomsLogo } from "@/components/customs-logo";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";

export default function ResetPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const schema = z.object({
    new: z.string().min(6, t("auth.passwordMin")),
    confirm: z.string(),
  }).refine((data) => data.new === data.confirm, {
    message: t("auth.passwordMatch"),
    path: ["confirm"],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const result = schema.safeParse(passwords);
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
    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: t("auth.resetError"),
      });
    } else {
      toast({
        variant: "success",
        title: t("auth.resetSuccess"),
      });
      router.push("/login");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-6 group">
            <CustomsLogo className="h-10 w-10 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight">{t("common.appName")}</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{t("auth.resetPasswordTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            {t("auth.resetPasswordSubtitle")}
          </p>
        </div>

        <Card className="rounded-2xl bg-card p-2">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("auth.newPassword")}</Label>
                <PasswordInput
                  id="newPassword"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="h-11"
                />
                {fieldErrors.new && (
                  <p className="text-xs text-destructive">{fieldErrors.new}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.confirmNewPassword")}</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="h-11"
                />
                {fieldErrors.confirm && (
                  <p className="text-xs text-destructive">{fieldErrors.confirm}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-6">
              <Button type="submit" className="w-full h-11 font-medium rounded-lg" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                {t("auth.resetPasswordButton")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
