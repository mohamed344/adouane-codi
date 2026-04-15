"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, Calendar, Receipt, ArrowUpRight, TrendingUp } from "lucide-react";
import { formatPrice, CURRENCY } from "@/config/plans";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { InfoBanner } from "@/components/info-banner";

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  payment_id: string | null;
  started_at: string;
  expires_at: string;
  created_at: string;
  plan: { name: string; price: number; billing_cycle: string };
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
      if (!user) { router.push("/login"); return; }
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

  function getStatusKey(status: string): "active" | "expired" | "cancelled" | "pending" {
    if (status === "active") return "active";
    if (status === "expired") return "expired";
    if (status === "cancelled") return "cancelled";
    return "pending";
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-DZ" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    );
  }

  const expiryWarning = activeSub && (() => {
    const days = Math.ceil((new Date(activeSub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 7 && days > 0 ? days : null;
  })();

  return (
    <PageShell maxWidth="default">
      <PageHeader
        title={t("billing.title")}
        subtitle={t("billing.subtitle")}
        breadcrumbs={[
          { label: t("common.home"), href: "/search" },
          { label: t("billing.title") },
        ]}
      />

      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton variant="stats-grid" className="grid-cols-1 sm:grid-cols-3" />
          <LoadingSkeleton variant="table" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current Plan */}
          <Card variant={activeSub ? "featured" : "default"} className="overflow-hidden">
            {activeSub ? (
              <>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)]">
                          <CreditCard className="size-5 text-[hsl(var(--primary))]" />
                        </div>
                        <StatusBadge status={getStatusKey(activeSub.status)} label={t(`billing.${activeSub.status}`)} />
                      </div>
                      <h2 className="mb-1 text-xl font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                        {activeSub.plan.name}
                      </h2>
                      <p className="text-3xl font-semibold text-[hsl(var(--primary))]">
                        {formatPrice(activeSub.plan.price)} {CURRENCY}
                        <span className="ms-1 text-sm font-normal text-[hsl(var(--muted-fg))]">
                          {activeSub.plan.billing_cycle === "monthly" ? t("common.perMonth") : t("common.perYear")}
                        </span>
                      </p>
                    </div>
                    <Button asChild size="lg">
                      <Link href="/subscription">
                        <TrendingUp className="size-4" />
                        {t("billing.managePlan")}
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Dates row */}
                <div className="grid grid-cols-2 divide-x divide-[hsl(var(--border))] border-t border-[hsl(var(--border))]">
                  <div className="px-6 py-4 sm:px-8">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                      {t("billing.startedAt", { defaultMessage: "Started" })}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
                      <Calendar className="size-3.5 text-[hsl(var(--muted-fg))]" />
                      {formatDate(activeSub.started_at)}
                    </p>
                  </div>
                  <div className="px-6 py-4 sm:px-8">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                      {t("billing.expiresAt")}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
                      <Calendar className="size-3.5 text-[hsl(var(--muted-fg))]" />
                      {formatDate(activeSub.expires_at)}
                    </p>
                  </div>
                </div>

                {expiryWarning ? (
                  <div className="border-t border-[hsl(var(--warning)/0.30)]">
                    <InfoBanner variant="warning">
                      {t("billing.expiryWarning", {
                        days: expiryWarning,
                        defaultMessage: `Your subscription expires in ${expiryWarning} days`,
                      })}
                    </InfoBanner>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="px-8 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--surface-2))]">
                  <CreditCard className="size-7 text-[hsl(var(--muted-fg))]" />
                </div>
                <p className="mb-4 text-base font-semibold text-[hsl(var(--foreground))]">
                  {t("billing.noPlan")}
                </p>
                <Button asChild size="lg">
                  <Link href="/subscription">
                    <ArrowUpRight className="size-4" />
                    {t("billing.managePlan")}
                  </Link>
                </Button>
              </div>
            )}
          </Card>

          {/* Invoice History */}
          <Card variant="default" className="overflow-hidden">
            <div className="border-b border-[hsl(var(--border))] px-6 py-5 sm:px-8">
              <h3 className="flex items-center gap-2 text-base font-semibold text-[hsl(var(--foreground))]">
                <Receipt className="size-5 text-[hsl(var(--primary))]" />
                {t("billing.invoiceHistory")}
              </h3>
            </div>
            <div className="px-6 py-6 sm:px-8">
              {subscriptions.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title={t("billing.noInvoices")}
                  description={t("billing.noInvoicesDesc", {
                    defaultMessage: "Your invoice history will appear here once you subscribe.",
                  })}
                />
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto sm:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[hsl(var(--border))]">
                          <th className="py-3 text-start text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                            {t("billing.date")}
                          </th>
                          <th className="py-3 text-start text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                            {t("billing.plan")}
                          </th>
                          <th className="py-3 text-start text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                            {t("billing.amount")}
                          </th>
                          <th className="py-3 text-start text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                            {t("billing.status")}
                          </th>
                          <th className="py-3 text-start text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                            {t("billing.paymentId")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((sub) => (
                          <tr key={sub.id} className="border-b border-[hsl(var(--border)/0.50)] transition-colors hover:bg-[hsl(var(--surface))] last:border-0">
                            <td className="py-4 text-[hsl(var(--foreground-2))]">{formatDate(sub.created_at)}</td>
                            <td className="py-4 font-semibold text-[hsl(var(--foreground))]">{sub.plan.name}</td>
                            <td className="py-4 font-mono text-[hsl(var(--foreground))]">
                              {formatPrice(sub.plan.price)} {CURRENCY}
                            </td>
                            <td className="py-4">
                              <StatusBadge status={getStatusKey(sub.status)} label={t(`billing.${sub.status}`)} />
                            </td>
                            <td className="py-4 font-mono text-xs text-[hsl(var(--muted-fg))]">
                              {sub.payment_id || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-3 sm:hidden">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="space-y-2 rounded-lg border border-[hsl(var(--border))] p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[hsl(var(--foreground))]">{sub.plan.name}</span>
                          <StatusBadge status={getStatusKey(sub.status)} label={t(`billing.${sub.status}`)} />
                        </div>
                        <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-fg))]">
                          <span>{formatDate(sub.created_at)}</span>
                          <span className="font-mono font-semibold text-[hsl(var(--foreground))]">
                            {formatPrice(sub.plan.price)} {CURRENCY}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
