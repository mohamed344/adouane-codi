"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { CustomsLogo } from "@/components/customs-logo";
import { z } from "zod";

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
      toast({
        variant: "destructive",
        title: t("auth.signInError"),
      });
      setLoading(false);
      return;
    }

    // Check user role and redirect accordingly
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if user is admin
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role === "admin") {
        router.push("/admin");
        return;
      }

      // Regular user: check subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (subscription) {
        router.push("/search");
      } else {
        router.push("/subscription");
      }
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.06]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <CustomsLogo className="h-8 w-8 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-base font-bold tracking-tight">{t("common.appName")}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo above card */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm border border-primary/10">
              <CustomsLogo className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t("auth.signInTitle")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("auth.signInSubtitle")}</p>
          </div>

          <Card className="border-border/50 shadow-xl shadow-black/[0.04] backdrop-blur-sm">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("common.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("common.password")}</Label>
                  <PasswordInput
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-11"
                  />
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive">{fieldErrors.password}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pb-6">
                <Button type="submit" className="w-full h-11 font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
                  {t("auth.signInButton")}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {t("auth.noAccount")}{" "}
                  <Link href="/signup" className="text-primary font-medium hover:underline">
                    {t("common.signup")}
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
