"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { Loader2, AlertCircle } from "lucide-react";
import { formatPrice, CURRENCY } from "@/config/plans";

interface Plan { id: string; name: string; price: number; billing_cycle: string }

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
      if (!planId) { setError(t("subscription.invalidPlan")); setLoading(false); return; }
      const supabase = createClient();
      const { data: fetchedPlan } = await supabase.from("plans").select("id, name, price, billing_cycle").eq("id", planId).eq("is_active", true).single();
      if (!fetchedPlan || fetchedPlan.price === 0) { setError(t("subscription.invalidPlan")); setLoading(false); return; }
      setPlan(fetchedPlan);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      try {
        const response = await fetch("/api/subscription/create-invoice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId, locale }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create invoice");
        window.location.href = data.paymentUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : t("subscription.paymentError"));
        setLoading(false);
      }
    }
    initiatePayment();
  }, [planId, locale, router, t]);

  return (
    <PageShell maxWidth="narrow">
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card variant="elevated" className="w-full max-w-md">
          <CardContent className="space-y-6 p-8 text-center">
            {error ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--destructive-soft))]">
                  <AlertCircle className="size-7 text-[hsl(var(--destructive))]" />
                </div>
                <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">{t("subscription.paymentError")}</h1>
                <p className="text-sm text-[hsl(var(--muted-fg))]">{error}</p>
                <Button variant="outline" onClick={() => router.push("/subscription")} className="w-full">{t("common.back")}</Button>
              </>
            ) : (
              <>
                <Loader2 className="mx-auto size-10 animate-spin text-[hsl(var(--primary))]" />
                <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">{t("subscription.redirectingToPayment")}</h1>
                {plan ? <p className="font-mono text-sm text-[hsl(var(--muted-fg))]">{plan.name} — {formatPrice(plan.price)} {CURRENCY}</p> : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
