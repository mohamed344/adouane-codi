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
import { LanguageSwitcher } from "@/components/language-switcher";
import { CustomsLogo } from "@/components/customs-logo";
import {
  CheckCircle,
  FileText,
  Calendar,
  CreditCard,
  ArrowRight,
  Receipt,
} from "lucide-react";
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
  if (billingCycle === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch the plan details from DB
      const { data: plan } = await supabase
        .from("plans")
        .select("id, name, price, billing_cycle")
        .eq("id", planId)
        .single();

      if (!plan) {
        setLoading(false);
        return;
      }

      // Check if user already has an active subscription for this plan
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan_id", plan.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingSub) {
        // Already active — just show the invoice
        setInvoice({
          planName: plan.name,
          amount: plan.price,
          date: new Date(existingSub.started_at).toLocaleDateString(),
          transactionId: existingSub.payment_id || "N/A",
          billingCycle: plan.billing_cycle,
          expiresAt: new Date(existingSub.expires_at).toLocaleDateString(),
        });
        setLoading(false);
        return;
      }

      // SlickPay redirected here after payment — create active subscription
      const expiresAt = getExpirationDate(plan.billing_cycle);
      const paymentId = `slickpay_${Date.now()}`;

      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan_id: plan.id,
        status: "active",
        payment_id: paymentId,
        started_at: new Date().toISOString(),
        expires_at: expiresAt,
      });

      if (error) {
        console.error("Failed to create subscription:", error);
        setLoading(false);
        return;
      }

      setInvoice({
        planName: plan.name,
        amount: plan.price,
        date: new Date().toLocaleDateString(),
        transactionId: paymentId,
        billingCycle: plan.billing_cycle,
        expiresAt: new Date(expiresAt).toLocaleDateString(),
      });

      setLoading(false);
    }

    activateSubscription();
  }, [planId, router]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CustomsLogo className="h-7 w-7" />
            <span className="text-sm font-bold tracking-tight text-foreground">
              {t("common.appName")}
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 py-12 pt-4">
        {loading ? (
          <Card className="w-full max-w-lg">
            <CardContent className="pt-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : invoice ? (
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold">
                {t("subscription.successTitle")}
              </h1>
              <p className="text-muted-foreground">
                {t("subscription.successSubtitle")}
              </p>
            </div>

            <Card className="border-border/50 shadow-xl shadow-black/[0.04]">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  {t("subscription.invoiceSummary")}
                </CardTitle>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  {t("subscription.paid")}
                </Badge>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-dashed">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{t("subscription.planLabel")}</span>
                  </div>
                  <span className="font-semibold">
                    {invoice.planName}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({invoice.billingCycle === "monthly"
                        ? t("subscription.billingMonthly")
                        : t("subscription.billingYearly")})
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-dashed">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">{t("subscription.amountLabel")}</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {formatPrice(invoice.amount)} {CURRENCY}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-dashed">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{t("subscription.dateLabel")}</span>
                  </div>
                  <span className="font-medium">{invoice.date}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-dashed">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{t("subscription.expiresLabel")}</span>
                  </div>
                  <span className="font-medium">{invoice.expiresAt}</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                    <span className="text-sm">
                      {t("subscription.transactionLabel")}
                    </span>
                  </div>
                  <span className="font-mono text-sm">{invoice.transactionId}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full h-11 shadow-md shadow-primary/20"
              onClick={() => router.push("/search")}
            >
              {t("subscription.goToSearch")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t("subscription.noInvoiceFound")}
            </p>
            <Button variant="outline" onClick={() => router.push("/subscription")}>
              {t("common.back")}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
