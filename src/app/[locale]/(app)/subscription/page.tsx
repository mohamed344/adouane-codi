"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Check, Loader2, Sparkles } from "lucide-react";
import { CURRENCY, formatPrice } from "@/config/plans";

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
      const { data } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });
      if (data) setPlans(data);
      setLoading(false);
    }
    fetchPlans();
  }, []);

  async function handleSubscribe(plan: Plan) {
    setProcessingPlan(plan.id);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Free plan: activate directly
      if (plan.price === 0) {
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          plan_id: plan.id,
          status: "active",
          payment_id: `free_${Date.now()}`,
          started_at: new Date().toISOString(),
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
        toast({ variant: "success", title: t("subscription.paymentSuccess") });
        router.push("/search");
        return;
      }

      // Paid plan: create invoice via API
      const response = await fetch("/api/subscription/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invoice");
      }

      // Redirect to SlickPay payment page
      window.location.href = data.paymentUrl;
    } catch (error) {
      console.error("Subscribe error:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      toast({
        variant: "destructive",
        title: t("subscription.paymentError"),
        description: errorMessage || undefined,
      });
    } finally {
      setProcessingPlan(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center py-12 pt-4">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t("subscription.title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            {t("subscription.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardContent className="flex flex-col flex-1 pt-8 space-y-4">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-12 w-36 mt-4" />
                  <div className="space-y-3 mt-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Skeleton className="h-10 w-full mt-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <p className="text-muted-foreground">{t("subscription.noPlans")}</p>
        ) : (
          <div className={`grid gap-8 max-w-5xl w-full justify-center ${
            plans.length === 1
              ? "grid-cols-1 max-w-md"
              : plans.length === 2
                ? "sm:grid-cols-2 max-w-3xl"
                : "sm:grid-cols-2 lg:grid-cols-3"
          }`}>
            {plans.map((plan) => {
              const isFree = plan.price === 0;

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col transition-colors duration-200 ${
                    plan.is_popular
                      ? "bg-primary/5"
                      : ""
                  }`}
                >
                  {plan.is_popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 px-3">
                      <Sparkles className="h-3 w-3" />
                      {t("subscription.popular")}
                    </Badge>
                  )}
                  <CardContent className="flex flex-col flex-1 pt-8">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.description}
                    </p>

                    <div className="mt-6 mb-6">
                      {isFree ? (
                        <span className="text-4xl font-bold">
                          {t("subscription.free")}
                        </span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">
                            {formatPrice(plan.price)}
                          </span>
                          <span className="text-lg font-medium ml-1">
                            {CURRENCY}
                          </span>
                          <span className="text-muted-foreground">
                            {plan.billing_cycle === "monthly"
                              ? t("common.perMonth")
                              : t("common.perYear")}
                          </span>
                        </>
                      )}
                    </div>

                    <ul className="mb-8 space-y-3 flex-1">
                      {plan.features?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.is_popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan)}
                      disabled={processingPlan !== null}
                    >
                      {processingPlan === plan.id && (
                        <Loader2 className="animate-spin" />
                      )}
                      {processingPlan === plan.id
                        ? t("subscription.paymentProcessing")
                        : isFree
                          ? t("subscription.getStartedFree")
                          : t("subscription.subscribe")}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
