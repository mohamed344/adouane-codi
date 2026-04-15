"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  Calculator,
  FileSearch,
  Languages,
  BarChart3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY, formatPrice, PLANS } from "@/config/plans";
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

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale() as "en" | "fr" | "ar";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ───── Auth state (preserved) ─────
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ───── Plans fetch (preserved) ─────
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───── IntersectionObserver for fade-up reveals ─────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const features = [
    { icon: Zap, title: t("landing.service1Title"), desc: t("landing.service1Desc") },
    { icon: Shield, title: t("landing.service2Title"), desc: t("landing.service2Desc") },
    { icon: Calculator, title: t("landing.service3Title"), desc: t("landing.service3Desc") },
    { icon: Globe, title: t("landing.service4Title"), desc: t("landing.service4Desc") },
  ];

  const steps = [
    { num: "01", title: t("landing.step1Title"), desc: t("landing.step1Desc") },
    { num: "02", title: t("landing.step2Title"), desc: t("landing.step2Desc") },
    { num: "03", title: t("landing.step3Title"), desc: t("landing.step3Desc") },
  ];

  const testimonials = [
    { name: t("landing.testimonial1Name"), role: t("landing.testimonial1Role"), text: t("landing.testimonial1Text") },
    { name: t("landing.testimonial2Name"), role: t("landing.testimonial2Role"), text: t("landing.testimonial2Text") },
    { name: t("landing.testimonial3Name"), role: t("landing.testimonial3Role"), text: t("landing.testimonial3Text") },
  ];

  const ctaHref = isAuthenticated ? "/search" : "/signup";
  const ctaLabel = isAuthenticated ? t("common.search") : t("landing.heroCta");

  // Trust strip — text labels (replace with actual logos if available)
  const trustLogos = [
    "ALG-CUSTOMS",
    "CMA CGM",
    "MAERSK",
    "DHL",
    "UPS",
    "FEDEX",
    "MSC",
    "EVERGREEN",
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[hsl(var(--background))]">
      <Header />

      {/* ═══════════════════════════════════════════
          HERO — mesh gradient + grid + shimmer badge
          ═══════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden pt-16 sm:pt-24 pb-24 sm:pb-32">
        {/* Layered backgrounds */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-grid" />
        {/* Soft fade to background at the bottom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-[hsl(var(--background))]"
        />

        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-6xl lg:text-7xl">
              {t("landing.heroTitle").split(" ").map((word, i, arr) =>
                i === arr.length - 1 ? (
                  <span key={i} className="text-gradient"> {word}</span>
                ) : (
                  <span key={i}>{i > 0 ? " " : ""}{word}</span>
                )
              )}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-[hsl(var(--muted-fg))] sm:text-xl">
              {t("landing.heroSubtitle")}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="glow-primary">
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how-it-works">{t("landing.howItWorksTitle")}</a>
              </Button>
            </div>

            {/* mini stats inline */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {[
                { value: t("landing.stat2Value"), label: t("landing.stat2Label") },
                { value: t("landing.stat3Value"), label: t("landing.stat3Label") },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-semibold text-[hsl(var(--foreground))]">
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LOGOS — marquee strip
          ═══════════════════════════════════════════ */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-10">
        <div className="container-app">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--muted-fg))]">
            {t("landing.testimonialsSubtitle")}
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
            <div className="marquee gap-12">
              {[...trustLogos, ...trustLogos].map((label, i) => (
                <span
                  key={`${label}-${i}`}
                  className="font-mono text-sm font-semibold tracking-tight text-[hsl(var(--muted-fg-2))]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES — 3 column icon cards (reveal)
          ═══════════════════════════════════════════ */}
      <section id="features" className="py-24 sm:py-32">
        <div className="container-app">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
              {t("landing.servicesTitle")}
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.025em] text-[hsl(var(--foreground))] sm:text-4xl">
              {t("landing.servicesSubtitle")}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.slice(0, 3).map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={i}
                  variant="interactive"
                  className="reveal p-7"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.20)]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[hsl(var(--muted-fg))]">
                    {feature.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — 3 numbered steps
          ═══════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="border-y border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-24 sm:py-32"
      >
        <div className="container-app">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
              {t("landing.howItWorksTitle")}
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.025em] text-[hsl(var(--foreground))] sm:text-4xl">
              {t("landing.howItWorksSubtitle")}
            </h2>
          </div>

          <div className="relative grid gap-10 md:grid-cols-3">
            {/* Connecting line behind the cards */}
            <div
              aria-hidden="true"
              className="absolute inset-x-12 top-6 hidden h-px bg-gradient-to-r from-transparent via-[hsl(var(--border-2))] to-transparent md:block"
            />
            {steps.map((step, i) => (
              <div
                key={i}
                className="reveal relative"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] font-mono text-sm font-semibold text-[hsl(var(--primary))]">
                  {step.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-fg))]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BENTO — asymmetric showcase
          ═══════════════════════════════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="container-app">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
              {t("common.features")}
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              {t("landing.servicesSubtitle")}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-6 md:grid-rows-2">
            {/* Tall left card — AI tariff search */}
            <Card variant="interactive" className="reveal md:col-span-2 md:row-span-2 p-7">
              <div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.20)]">
                <FileSearch className="size-5" />
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-[-0.015em]">
                {features[0].title}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-[hsl(var(--muted-fg))]">
                {features[0].desc}
              </p>
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3">
                <p className="font-mono text-xs text-[hsl(var(--muted-fg))]">$ tariff search</p>
                <p className="mt-1 font-mono text-sm text-[hsl(var(--foreground))]">
                  → 8517.12.00
                  <span className="text-[hsl(var(--muted-fg))]"> · Smartphones</span>
                </p>
              </div>
            </Card>

            {/* Top-right pair */}
            <Card variant="interactive" className="reveal md:col-span-2 p-6" style={{ transitionDelay: "60ms" }}>
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent-2))]">
                <Languages className="size-5" />
              </div>
              <h3 className="mb-1 font-semibold tracking-[-0.015em]">{features[3].title}</h3>
              <p className="text-sm leading-relaxed text-[hsl(var(--muted-fg))]">{features[3].desc}</p>
            </Card>

            <Card variant="interactive" className="reveal md:col-span-2 p-6" style={{ transitionDelay: "120ms" }}>
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]">
                <Shield className="size-5" />
              </div>
              <h3 className="mb-1 font-semibold tracking-[-0.015em]">{features[1].title}</h3>
              <p className="text-sm leading-relaxed text-[hsl(var(--muted-fg))]">{features[1].desc}</p>
            </Card>

            {/* Bottom-right wide card */}
            <Card variant="interactive" className="reveal md:col-span-4 p-6" style={{ transitionDelay: "180ms" }}>
              <div className="flex items-center gap-4">
                <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]">
                  <BarChart3 className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold tracking-[-0.015em]">{features[2].title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-[hsl(var(--muted-fg))]">
                    {features[2].desc}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING — 3 plans, indigo highlight on featured
          ═══════════════════════════════════════════ */}
      <section
        id="pricing"
        className="border-y border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-24 sm:py-32"
      >
        <div className="container-app">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
              {t("landing.pricingTitle")}
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              {t("landing.pricingSubtitle")}
            </h2>
          </div>

          {plansLoading ? (
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          ) : plans.length > 0 ? (
            <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3 lg:items-stretch">
              {plans.map((plan) => {
                const featured = plan.is_popular;
                return (
                  <Card
                    key={plan.id}
                    variant={featured ? "featured" : "default"}
                    className={cn("relative flex flex-col p-8", featured && "lg:scale-[1.02]")}
                  >
                    {featured ? (
                      <Badge variant="indigo" className="absolute -top-3 start-1/2 -translate-x-1/2">
                        ★ {t("subscription.popular")}
                      </Badge>
                    ) : null}

                    <CardContent className="flex flex-1 flex-col p-0">
                      <h3 className="text-base font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-fg))]">
                        {plan.description}
                      </p>

                      <div className="mt-6 flex items-baseline gap-1.5">
                        <span className="font-mono text-4xl font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-sm text-[hsl(var(--muted-fg))]">
                          {CURRENCY}/{plan.billing_cycle === "monthly" ? t("common.perMonth") : t("common.perYear")}
                        </span>
                      </div>

                      <ul className="mt-6 mb-8 flex-1 space-y-3">
                        {plan.features?.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-[hsl(var(--foreground-2))]">
                            <Check
                              className={cn(
                                "mt-0.5 size-4 shrink-0",
                                featured ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--success))]"
                              )}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        asChild
                        size="lg"
                        variant={featured ? "primary" : "outline"}
                        className={cn("w-full", featured && "glow-primary")}
                      >
                        <Link href={ctaHref}>{ctaLabel}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-[hsl(var(--muted-fg))]">{t("subscription.noPlans")}</p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS — staggered grid
          ═══════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 sm:py-32">
        <div className="container-app">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
              {t("landing.testimonialsTitle")}
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
              {t("landing.testimonialsSubtitle")}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <Card
                key={i}
                variant="default"
                className={cn(
                  "reveal p-7",
                  i === 1 && "lg:translate-y-6",
                  i === 2 && "lg:translate-y-12"
                )}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <p className="mb-6 text-base leading-relaxed text-[hsl(var(--foreground-2))]">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent-2))] text-sm font-semibold text-white">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-fg))]">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA — mesh + glowing CTA
          ═══════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-mesh" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-grid" />

        <div className="container-app">
          <Card variant="elevated" className="mx-auto max-w-4xl p-10 sm:p-14 text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.025em] text-[hsl(var(--foreground))] sm:text-4xl">
              {t("landing.ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[hsl(var(--muted-fg))]">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="glow-primary">
                <Link href={ctaHref}>
                  {isAuthenticated ? t("common.search") : t("landing.ctaButton")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#pricing">{t("landing.pricingTitle")}</a>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
