"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CustomsLogo } from "@/components/customs-logo";
import { Loader2, AlertCircle } from "lucide-react";
import { formatPrice, CURRENCY } from "@/config/plans";

interface Plan {
  id: string;
  name: string;
  price: number;
  billing_cycle: string;
}

export default function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const planId = searchParams.get("plan") || "";

  useEffect(() => {
    async function initiatePayment() {
      if (!planId) {
        setError(t("subscription.invalidPlan"));
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // Fetch plan from DB
      const { data: fetchedPlan } = await supabase
        .from("plans")
        .select("id, name, price, billing_cycle")
        .eq("id", planId)
        .eq("is_active", true)
        .single();

      if (!fetchedPlan || fetchedPlan.price === 0) {
        setError(t("subscription.invalidPlan"));
        setLoading(false);
        return;
      }

      setPlan(fetchedPlan);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/subscription/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, locale }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create invoice");
        }

        // Redirect to SlickPay payment page
        window.location.href = data.paymentUrl;
      } catch (err) {
        console.error("Checkout error:", err);
        setError(
          err instanceof Error ? err.message : t("subscription.paymentError")
        );
        setLoading(false);
      }
    }

    initiatePayment();
  }, [planId, locale, router, t]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.06]" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <CustomsLogo className="h-8 w-8 transition-transform duration-300 group-hover:scale-105" />
            <span className="text-base font-bold tracking-tight">
              {t("common.appName")}
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md border-border/50 shadow-xl shadow-black/[0.04]">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            {error ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-xl font-bold">
                    {t("subscription.paymentError")}
                  </h1>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/subscription")}
                  className="w-full"
                >
                  {t("common.back")}
                </Button>
              </>
            ) : (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <div className="space-y-2">
                  <h1 className="text-xl font-bold">
                    {t("subscription.redirectingToPayment")}
                  </h1>
                  {plan && (
                    <p className="text-muted-foreground">
                      {plan.name} - {formatPrice(plan.price)} {CURRENCY}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
