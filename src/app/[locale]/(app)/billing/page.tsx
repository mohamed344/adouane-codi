"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Calendar, Receipt } from "lucide-react";
import { formatPrice, CURRENCY } from "@/config/plans";
import { Link } from "@/i18n/routing";

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  payment_id: string | null;
  started_at: string;
  expires_at: string;
  created_at: string;
  plan: {
    name: string;
    price: number;
    billing_cycle: string;
  };
}

export default function BillingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("*, plan:plans(name, price, billing_cycle)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setSubscriptions(data as unknown as Subscription[]);
      setLoading(false);
    }
    load();
  }, [router]);

  const activeSub = subscriptions.find((s) => s.status === "active");

  function statusBadge(status: string) {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">{t("billing.active")}</Badge>;
      case "expired":
        return <Badge variant="secondary">{t("billing.expired")}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{t("billing.cancelled")}</Badge>;
      default:
        return <Badge variant="outline">{t("billing.pending")}</Badge>;
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-DZ" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div>
        <div className="py-8">
          <PageHeader
            title={t("billing.title")}
            subtitle={t("billing.subtitle")}
          />

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {t("billing.currentPlan")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeSub ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xl font-semibold">{activeSub.plan.name}</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(activeSub.plan.price)} {CURRENCY}
                          <span className="text-sm font-normal text-muted-foreground ms-1">
                            {activeSub.plan.billing_cycle === "monthly" ? t("common.perMonth") : t("common.perYear")}
                          </span>
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {t("billing.expiresAt")}: {formatDate(activeSub.expires_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(activeSub.status)}
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/subscription">{t("billing.managePlan")}</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-muted-foreground">{t("billing.noPlan")}</p>
                      <Button size="sm" asChild>
                        <Link href="/subscription">{t("billing.managePlan")}</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Invoice History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Receipt className="h-5 w-5 text-primary" />
                    {t("billing.invoiceHistory")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptions.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4">{t("billing.noInvoices")}</p>
                  ) : (
                    <>
                      {/* Desktop table */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-muted-foreground">
                              <th className="text-start py-3 font-medium">{t("billing.date")}</th>
                              <th className="text-start py-3 font-medium">{t("billing.plan")}</th>
                              <th className="text-start py-3 font-medium">{t("billing.amount")}</th>
                              <th className="text-start py-3 font-medium">{t("billing.status")}</th>
                              <th className="text-start py-3 font-medium">{t("billing.paymentId")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subscriptions.map((sub) => (
                              <tr key={sub.id} className="border-b last:border-0">
                                <td className="py-3">{formatDate(sub.created_at)}</td>
                                <td className="py-3 font-medium">{sub.plan.name}</td>
                                <td className="py-3">{formatPrice(sub.plan.price)} {CURRENCY}</td>
                                <td className="py-3">{statusBadge(sub.status)}</td>
                                <td className="py-3 font-mono text-xs text-muted-foreground">
                                  {sub.payment_id || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="sm:hidden space-y-3">
                        {subscriptions.map((sub) => (
                          <div key={sub.id} className="rounded-lg border p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{sub.plan.name}</span>
                              {statusBadge(sub.status)}
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{formatDate(sub.created_at)}</span>
                              <span className="font-semibold text-foreground">
                                {formatPrice(sub.plan.price)} {CURRENCY}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
    </div>
  );
}
