"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { toast } from "@/components/ui/use-toast";
import { Check, Sparkles } from "lucide-react";
import { CURRENCY, formatPrice } from "@/config/plans";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  is_active: boolean;
  is_popular?: boolean;
}

export default function SubscriptionPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      const supabase = createClient();
      const { data } = await supabase.from("plans").select("*").eq("is_active", true).order("price", { ascending: true });
      if (data) setPlans(data);
      setLoading(false);
    }
    fetchPlans();
  }, []);

  async function handleSubscribe(plan: Plan) {
    setProcessingPlan(plan.id);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      if (plan.price === 0) {
        await supabase.from("subscriptions").insert({
          user_id: user.id, plan_id: plan.id, status: "active",
          payment_id: `free_${Date.now()}`, started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });
        toast({ variant: "success", title: t("subscription.paymentSuccess") });
        router.push("/search");
        return;
      }

      const response = await fetch("/api/subscription/create-invoice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, locale }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create invoice");
      window.location.href = data.paymentUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      toast({ variant: "destructive", title: t("subscription.paymentError"), description: errorMessage || undefined });
    } finally {
      setProcessingPlan(null);
    }
  }

  return (
    <PageShell maxWidth="wide">
      <PageHeader
        title={t("subscription.title")}
        subtitle={t("subscription.subtitle")}
      />

      {loading ? (
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
        </div>
      ) : plans.length === 0 ? (
        <p className="text-center text-[hsl(var(--muted-fg))]">{t("subscription.noPlans")}</p>
      ) : (
        <div className={cn(
          "mx-auto grid max-w-5xl gap-6",
          plans.length === 1 ? "max-w-md grid-cols-1" :
          plans.length === 2 ? "max-w-3xl sm:grid-cols-2" :
          "sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {plans.map((plan) => {
            const isFree = plan.price === 0;
            const featured = plan.is_popular;
            return (
              <Card
                key={plan.id}
                variant={featured ? "featured" : "default"}
                className={cn("relative flex flex-col", featured && "lg:scale-[1.02]")}
              >
                {featured ? (
                  <Badge variant="indigo" className="absolute -top-3 start-1/2 -translate-x-1/2 gap-1 px-3">
                    <Sparkles className="size-3" />
                    {t("subscription.popular")}
                  </Badge>
                ) : null}
                <CardContent className="flex flex-1 flex-col p-6 sm:p-8">
                  <h3 className="text-lg font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-fg))]">{plan.description}</p>

                  <div className="mt-6 mb-6 flex items-baseline gap-1.5">
                    {isFree ? (
                      <span className="font-mono text-4xl font-semibold text-[hsl(var(--foreground))]">
                        {t("subscription.free")}
                      </span>
                    ) : (
                      <>
                        <span className="font-mono text-4xl font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-sm text-[hsl(var(--muted-fg))]">
                          {CURRENCY}/{plan.billing_cycle === "monthly" ? t("common.perMonth") : t("common.perYear")}
                        </span>
                      </>
                    )}
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[hsl(var(--foreground-2))]">
                        <Check className={cn("mt-0.5 size-4 shrink-0", featured ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--success))]")} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn("w-full", featured && "glow-primary")}
                    size="lg"
                    variant={featured ? "primary" : "outline"}
                    onClick={() => handleSubscribe(plan)}
                    loading={processingPlan === plan.id}
                    disabled={processingPlan !== null}
                  >
                    {processingPlan === plan.id
                      ? t("subscription.paymentProcessing")
                      : isFree ? t("subscription.getStartedFree") : t("subscription.subscribe")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
