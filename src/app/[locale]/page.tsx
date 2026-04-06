"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ArrowRight, Zap, Shield, Globe, Calculator } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY, formatPrice, PLANS } from "@/config/plans";
import { useLocale } from "next-intl";
import { CustomsLogo } from "@/components/customs-logo";

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

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale() as "en" | "fr" | "ar";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fallbackPlans: Plan[] = PLANS.map((p) => ({
    id: p.slug,
    name: t(`subscription.plan_${p.slug}`),
    description: t(`subscription.plan_${p.slug}_desc`),
    price: p.price,
    billing_cycle: p.billing_cycle,
    features: p.features[locale] || p.features.en,
    is_active: true,
    is_popular: p.slug === "monthly",
  }));

  useEffect(() => {
    async function fetchPlans() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true });
        if (error) console.error("Failed to fetch plans:", error.message);
        if (data && data.length > 0) setPlans(data);
        else setPlans(fallbackPlans);
      } catch {
        setPlans(fallbackPlans);
      } finally {
        setPlansLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const features = [
    {
      icon: Zap,
      title: t("landing.service1Title"),
      desc: t("landing.service1Desc"),
    },
    {
      icon: Shield,
      title: t("landing.service2Title"),
      desc: t("landing.service2Desc"),
    },
    {
      icon: Calculator,
      title: t("landing.service3Title"),
      desc: t("landing.service3Desc"),
    },
    {
      icon: Globe,
      title: t("landing.service4Title"),
      desc: t("landing.service4Desc"),
    },
  ];

  const steps = [
    { num: "1", title: t("landing.step1Title"), desc: t("landing.step1Desc") },
    { num: "2", title: t("landing.step2Title"), desc: t("landing.step2Desc") },
    { num: "3", title: t("landing.step3Title"), desc: t("landing.step3Desc") },
  ];

  const testimonials = [
    { name: t("landing.testimonial1Name"), role: t("landing.testimonial1Role"), text: t("landing.testimonial1Text") },
    { name: t("landing.testimonial2Name"), role: t("landing.testimonial2Role"), text: t("landing.testimonial2Text") },
    { name: t("landing.testimonial3Name"), role: t("landing.testimonial3Role"), text: t("landing.testimonial3Text") },
  ];

  const ctaHref = isAuthenticated ? "/search" : "/signup";
  const ctaLabel = isAuthenticated ? t("common.dashboard") : t("landing.heroCta");

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />

      {/* ═══════════════════════════════════════════
          HERO — Split layout, logo visual on right
          ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — Copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <Zap className="h-3.5 w-3.5" />
                {t("landing.stat1Value")} {t("landing.stat1Label")}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08]">
                {t("landing.heroTitle")}
              </h1>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
                {t("landing.heroSubtitle")}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button size="lg" asChild className="h-12 px-8 rounded-xl text-base">
                  <Link href={ctaHref}>
                    {ctaLabel}
                    <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="h-12 px-6 text-base text-muted-foreground">
                  <a href="#how-it-works">
                    {t("landing.howItWorksTitle")}
                  </a>
                </Button>
              </div>

              {/* Mini stats */}
              <div className="mt-14 flex gap-10">
                {[
                  { value: t("landing.stat2Value"), label: t("landing.stat2Label") },
                  { value: t("landing.stat3Value"), label: t("landing.stat3Label") },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Abstract visual */}
            <div className="hidden lg:block">
              <div className="relative aspect-square max-w-md ms-auto">
                {/* Layered geometric shapes — warm, organic feel */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-primary/[0.06] rotate-3" />
                <div className="absolute inset-3 rounded-[2rem] bg-primary/[0.04] -rotate-2" />
                <div className="absolute inset-6 rounded-[1.5rem] bg-surface-warm flex items-center justify-center">
                  <div className="text-center">
                    <CustomsLogo className="h-20 w-20 mx-auto mb-6" />
                    <p className="text-2xl font-bold text-foreground tracking-tight">CODI PRO MAX</p>
                    <p className="text-sm text-muted-foreground mt-2">{t("landing.heroSubtitle").slice(0, 50)}...</p>
                  </div>
                </div>
                {/* Floating accent dots */}
                <div className="absolute top-8 end-8 h-4 w-4 rounded-full bg-primary/30" />
                <div className="absolute bottom-16 start-4 h-3 w-3 rounded-full bg-primary/20" />
                <div className="absolute top-1/3 start-0 h-2 w-2 rounded-full bg-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES — Bento-style grid, warm bg
          ═══════════════════════════════════════════ */}
      <section id="services" className="py-16 sm:py-24 bg-surface-warm">
        <div className="container">
          <div className="mb-12 sm:mb-16 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              {t("landing.servicesTitle")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {t("landing.servicesSubtitle")}
            </p>
          </div>

          {/* Bento grid — varied card sizes */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;

              if (i === 0) {
                return (
                  <div key={i} className="bg-card rounded-2xl p-8 sm:p-10 sm:row-span-2 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-6">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-border/50">
                      <p className="text-sm font-medium text-primary">{t("landing.stat1Value")}+ {t("landing.stat1Label")}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className="bg-card rounded-2xl p-6 sm:p-8">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary mb-5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Horizontal steps with line
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="container">
          <div className="mb-12 sm:mb-16 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              {t("landing.howItWorksTitle")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {t("landing.howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12 max-w-4xl">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {/* Step number */}
                <div className="flex items-center gap-4 mb-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {step.num}
                  </span>
                  {/* Connecting line (hidden on mobile and last item) */}
                  {i < steps.length - 1 && (
                    <div className="hidden sm:block flex-1 h-px bg-border" />
                  )}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING — Cards on white surface
          ═══════════════════════════════════════════ */}
      <section id="pricing" className="py-16 sm:py-24 bg-surface-white">
        <div className="container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              {t("landing.pricingTitle")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              {t("landing.pricingSubtitle")}
            </p>
          </div>

          {plansLoading ? (
            <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-card p-8 space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-32 mt-4" />
                  <Skeleton className="h-11 w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : plans.length > 0 ? (
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Non-popular plans side by side */}
              <div className="grid gap-4 sm:grid-cols-2">
                {plans.filter((p) => !p.is_popular).map((plan) => (
                  <div key={plan.id} className="flex flex-col rounded-2xl bg-card p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="text-end shrink-0 ms-4">
                        <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                        <p className="text-xs text-muted-foreground">
                          {CURRENCY}/{plan.billing_cycle === "monthly" ? t("common.perMonth") : t("common.perYear")}
                        </p>
                      </div>
                    </div>
                    <ul className="mb-6 space-y-2 flex-1">
                      {plan.features?.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={ctaHref}>{ctaLabel}</Link>
                    </Button>
                  </div>
                ))}
              </div>

              {/* Popular plan — full width, highlighted */}
              {plans.filter((p) => p.is_popular).map((plan) => (
                <div key={plan.id} className="rounded-2xl bg-secondary text-secondary-foreground p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {t("subscription.popular")}
                        </span>
                      </div>
                      <p className="text-secondary-foreground/70 mb-4">{plan.description}</p>
                      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                        {plan.features?.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-secondary-foreground/90">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="sm:text-end shrink-0">
                      <div className="mb-4">
                        <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                        <span className="text-sm text-secondary-foreground/60 ms-1">
                          {CURRENCY}/{plan.billing_cycle === "monthly" ? t("common.perMonth") : t("common.perYear")}
                        </span>
                      </div>
                      <Button size="lg" asChild className="h-12 px-8 rounded-xl bg-white text-secondary hover:bg-white/90">
                        <Link href={ctaHref}>{ctaLabel}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">{t("subscription.noPlans")}</p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS — Staggered cards on warm bg
          ═══════════════════════════════════════════ */}
      <section id="testimonials" className="py-16 sm:py-24 bg-surface-warm">
        <div className="container">
          <div className="mb-12 sm:mb-16 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              {t("landing.testimonialsTitle")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {t("landing.testimonialsSubtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className={`bg-card rounded-2xl p-6 sm:p-8 ${
                  i === 0 ? "sm:translate-y-0" : i === 1 ? "sm:translate-y-4" : "sm:translate-y-8"
                }`}
              >
                {/* Quote */}
                <p className={`text-foreground leading-relaxed mb-6 ${i === 0 ? "text-lg" : "text-sm"}`}>
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA — Dark, compact, strong
          ═══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-secondary">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-foreground leading-tight">
                {t("landing.ctaTitle")}
              </h2>
              <p className="mt-3 text-secondary-foreground/70 leading-relaxed max-w-lg">
                {t("landing.ctaSubtitle")}
              </p>
            </div>
            <Button size="lg" asChild className="h-12 px-8 rounded-xl text-base bg-white text-secondary hover:bg-white/90 shrink-0">
              <Link href={ctaHref}>
                {isAuthenticated ? t("common.dashboard") : t("landing.ctaButton")}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
