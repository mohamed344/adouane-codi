"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/page-shell";
import { CheckCircle2, FileText, Calendar, CreditCard, ArrowRight, Receipt } from "lucide-react";
import { formatPrice, CURRENCY } from "@/config/plans";

interface InvoiceDetails {
  planName: string;
  amount: number;
  date: string;
  transactionId: string;
  billingCycle: string;
  expiresAt: string;
}

function getExpirationDate(billingCycle: string): string {
  const date = new Date();
  if (billingCycle === "yearly") date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

export default function SubscriptionSuccessPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const planId = searchParams.get("plan") || "";

  useEffect(() => {
    async function activateSubscription() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: plan } = await supabase.from("plans").select("id, name, price, billing_cycle").eq("id", planId).single();
      if (!plan) { setLoading(false); return; }

      const { data: existingSub } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("plan_id", plan.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).single();

      if (existingSub) {
        setInvoice({ planName: plan.name, amount: plan.price, date: new Date(existingSub.started_at).toLocaleDateString(), transactionId: existingSub.payment_id || "N/A", billingCycle: plan.billing_cycle, expiresAt: new Date(existingSub.expires_at).toLocaleDateString() });
        setLoading(false); return;
      }

      const expiresAt = getExpirationDate(plan.billing_cycle);
      const paymentId = `slickpay_${Date.now()}`;
      const { error } = await supabase.from("subscriptions").insert({ user_id: user.id, plan_id: plan.id, status: "active", payment_id: paymentId, started_at: new Date().toISOString(), expires_at: expiresAt });
      if (error) { console.error("Failed to create subscription:", error); setLoading(false); return; }

      setInvoice({ planName: plan.name, amount: plan.price, date: new Date().toLocaleDateString(), transactionId: paymentId, billingCycle: plan.billing_cycle, expiresAt: new Date(expiresAt).toLocaleDateString() });
      setLoading(false);
    }
    activateSubscription();
  }, [planId, router]);

  return (
    <PageShell maxWidth="narrow">
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        {loading ? (
          <Card variant="default" className="w-full max-w-lg">
            <CardContent className="space-y-6 p-8">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </CardContent>
          </Card>
        ) : invoice ? (
          <div className="w-full max-w-lg space-y-6">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--success-soft))]">
                <CheckCircle2 className="size-9 text-[hsl(var(--success))]" />
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">{t("subscription.successTitle")}</h1>
              <p className="text-[hsl(var(--muted-fg))]">{t("subscription.successSubtitle")}</p>
            </div>

            <Card variant="default">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[hsl(var(--border))] pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="size-5 text-[hsl(var(--primary))]" />
                  {t("subscription.invoiceSummary")}
                </CardTitle>
                <Badge variant="emerald">{t("subscription.paid")}</Badge>
              </CardHeader>
              <CardContent className="space-y-0 p-0">
                {[
                  { icon: FileText, label: t("subscription.planLabel"), value: `${invoice.planName} (${invoice.billingCycle === "monthly" ? t("subscription.billingMonthly") : t("subscription.billingYearly")})` },
                  { icon: CreditCard, label: t("subscription.amountLabel"), value: `${formatPrice(invoice.amount)} ${CURRENCY}`, bold: true },
                  { icon: Calendar, label: t("subscription.dateLabel"), value: invoice.date },
                  { icon: Calendar, label: t("subscription.expiresLabel"), value: invoice.expiresAt },
                  { icon: Receipt, label: t("subscription.transactionLabel"), value: invoice.transactionId, mono: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-dashed border-[hsl(var(--border)/0.60)] px-6 py-3.5 last:border-0">
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-fg))]">
                      <row.icon className="size-4" />
                      {row.label}
                    </div>
                    <span className={`text-sm ${row.bold ? "text-lg font-semibold text-[hsl(var(--foreground))]" : row.mono ? "font-mono text-xs text-[hsl(var(--muted-fg))]" : "font-medium text-[hsl(var(--foreground))]"}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={() => router.push("/search")}>
              {t("subscription.goToSearch")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-[hsl(var(--muted-fg))]">{t("subscription.noInvoiceFound")}</p>
            <Button variant="outline" onClick={() => router.push("/subscription")}>{t("common.back")}</Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
