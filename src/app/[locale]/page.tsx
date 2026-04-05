"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY, formatPrice, PLANS } from "@/config/plans";
import { useLocale } from "next-intl";

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

/* ===== SVG ICON COMPONENTS ===== */
function IconTariff({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="8" className="fill-primary/10" />
      <path d="M16 14h16M16 20h16M16 26h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
      <circle cx="32" cy="32" r="8" className="fill-primary/20" />
      <path d="M29 32h6M32 29v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-primary" />
    </svg>
  );
}

function IconCompliance({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="8" className="fill-primary/10" />
      <path d="M24 12L34 18V28C34 33 29.5 37.5 24 38C18.5 37.5 14 33 14 28V18L24 12Z" stroke="currentColor" strokeWidth="2" className="text-primary" fill="none" />
      <path d="M19 25L22 28L29 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
    </svg>
  );
}

function IconCalculator({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="8" className="fill-primary/10" />
      <rect x="12" y="10" width="24" height="28" rx="4" stroke="currentColor" strokeWidth="2" className="text-primary" fill="none" />
      <rect x="16" y="14" width="16" height="6" rx="1" className="fill-primary/20" />
      <circle cx="19" cy="28" r="1.5" className="fill-primary" />
      <circle cx="24" cy="28" r="1.5" className="fill-primary" />
      <circle cx="29" cy="28" r="1.5" className="fill-primary" />
      <circle cx="19" cy="33" r="1.5" className="fill-primary" />
      <circle cx="24" cy="33" r="1.5" className="fill-primary" />
      <circle cx="29" cy="33" r="1.5" className="fill-primary" />
    </svg>
  );
}

function IconTrade({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="8" className="fill-primary/10" />
      <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="2" className="text-primary" fill="none" />
      <ellipse cx="24" cy="24" rx="6" ry="12" stroke="currentColor" strokeWidth="1.5" className="text-primary" fill="none" />
      <path d="M12 24h24M14 18h20M14 30h20" stroke="currentColor" strokeWidth="1" className="text-primary/60" />
    </svg>
  );
}

function IconDocument({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="8" className="fill-primary/10" />
      <path d="M14 12H28L34 18V36H14V12Z" stroke="currentColor" strokeWidth="2" className="text-primary" fill="none" />
      <path d="M28 12V18H34" stroke="currentColor" strokeWidth="2" className="text-primary" />
      <path d="M18 24h12M18 28h12M18 32h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-primary/60" />
    </svg>
  );
}

function IconIntegration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="8" className="fill-primary/10" />
      <rect x="12" y="12" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" className="text-primary" fill="none" />
      <rect x="26" y="26" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" className="text-primary" fill="none" />
      <path d="M22 17h4a4 4 0 014 4v4" stroke="currentColor" strokeWidth="2" className="text-primary" />
      <circle cx="31" cy="17" r="3" className="fill-primary/30" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="31" r="3" className="fill-primary/30" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* ===== MAIN COMPONENT ===== */
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

  const services = [
    { icon: IconTariff, title: t("landing.service1Title"), desc: t("landing.service1Desc") },
    { icon: IconCompliance, title: t("landing.service2Title"), desc: t("landing.service2Desc") },
    { icon: IconCalculator, title: t("landing.service3Title"), desc: t("landing.service3Desc") },
    { icon: IconTrade, title: t("landing.service4Title"), desc: t("landing.service4Desc") },
    { icon: IconDocument, title: t("landing.service5Title"), desc: t("landing.service5Desc") },
    { icon: IconIntegration, title: t("landing.service6Title"), desc: t("landing.service6Desc") },
  ];

  const steps = [
    { num: "01", title: t("landing.step1Title"), desc: t("landing.step1Desc") },
    { num: "02", title: t("landing.step2Title"), desc: t("landing.step2Desc") },
    { num: "03", title: t("landing.step3Title"), desc: t("landing.step3Desc") },
    { num: "04", title: t("landing.step4Title"), desc: t("landing.step4Desc") },
  ];

  const features = [
    {
      title: t("landing.feature1Title"),
      desc: t("landing.feature1Desc"),
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: t("landing.feature2Title"),
      desc: t("landing.feature2Desc"),
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
    },
    {
      title: t("landing.feature3Title"),
      desc: t("landing.feature3Desc"),
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: t("landing.feature4Title"),
      desc: t("landing.feature4Desc"),
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
  ];

  const testimonials = [
    { name: t("landing.testimonial1Name"), role: t("landing.testimonial1Role"), text: t("landing.testimonial1Text") },
    { name: t("landing.testimonial2Name"), role: t("landing.testimonial2Role"), text: t("landing.testimonial2Text") },
    { name: t("landing.testimonial3Name"), role: t("landing.testimonial3Role"), text: t("landing.testimonial3Text") },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl leading-[1.1] text-foreground">
              {t("landing.heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
              {t("landing.heroSubtitle")}
            </p>
            <div className="mt-10">
              <Button size="lg" asChild className="text-base px-8 h-12 rounded-lg">
                <Link href={isAuthenticated ? "/search" : "/signup"}>
                  {isAuthenticated ? t("common.dashboard") : t("landing.heroCta")}
                  <ArrowRight className="ms-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: t("landing.stat1Value"), label: t("landing.stat1Label") },
                { value: t("landing.stat2Value"), label: t("landing.stat2Label") },
                { value: t("landing.stat3Value"), label: t("landing.stat3Label") },
              ].map((stat, i) => (
                <div key={i} className="text-center py-4">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES SECTION ===== */}
      <section id="services" className="py-20 sm:py-24">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold sm:text-4xl text-foreground">{t("landing.servicesTitle")}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("landing.servicesSubtitle")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {services.map((service, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-colors group">
                <div className="mb-4">
                  <service.icon className="h-11 w-11" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section id="how-it-works" className="py-20 sm:py-24">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold sm:text-4xl text-foreground">{t("landing.howItWorksTitle")}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("landing.howItWorksSubtitle")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-lg font-bold">{step.num}</span>
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-20 sm:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            {/* Shield visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-primary/8 to-primary/3" />
                <div className="absolute inset-0 rounded-3xl border border-primary/10" />
                <svg className="w-40 h-40 relative z-10" viewBox="0 0 200 200" fill="none">
                  <path d="M100 20L170 55V105C170 145 140 175 100 185C60 175 30 145 30 105V55L100 20Z" className="fill-primary/10 stroke-primary/40" strokeWidth="2" />
                  <path d="M100 40L150 65V105C150 135 130 158 100 165C70 158 50 135 50 105V65L100 40Z" className="fill-primary/5 stroke-primary/20" strokeWidth="1" />
                  <path d="M75 100L90 115L125 80" className="stroke-primary" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold sm:text-4xl text-foreground">{t("landing.featuresTitle")}</h2>
              <p className="mt-4 text-lg text-muted-foreground">{t("landing.featuresSubtitle")}</p>

              <div className="mt-10 space-y-6">
                {features.map((feature, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-150">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold sm:text-4xl text-foreground">{t("landing.pricingTitle")}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t("landing.pricingSubtitle")}</p>
          </div>

          {plansLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg flex flex-col p-8 space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-32 mt-4" />
                  <div className="space-y-3 mt-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Skeleton className="h-10 w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : plans.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col bg-card border rounded-lg p-8 ${
                    plan.is_popular
                      ? "border-primary/40 ring-1 ring-primary/20 shadow-md"
                      : "border-border"
                  }`}
                >
                  {plan.is_popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                      {t("subscription.popular")}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-extrabold text-foreground">{formatPrice(plan.price)}</span>
                    <span className="text-sm text-muted-foreground ms-1">
                      {CURRENCY} {plan.billing_cycle === "monthly" ? t("common.perMonth") : t("common.perYear")}
                    </span>
                  </div>
                  <ul className="mb-8 space-y-3 flex-1">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full rounded-lg"
                    variant={plan.is_popular ? "default" : "outline"}
                  >
                    <Link href={isAuthenticated ? "/search" : "/signup"}>
                      {isAuthenticated ? t("common.dashboard") : t("landing.heroCta")}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>{t("subscription.noPlans")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section id="testimonials" className="py-20 sm:py-24">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold sm:text-4xl text-foreground">{t("landing.testimonialsTitle")}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t("landing.testimonialsSubtitle")}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6">
                <svg className="h-7 w-7 text-primary/20 mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {testimonial.text}
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-sm">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 sm:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold sm:text-4xl leading-tight text-foreground">
              {t("landing.ctaTitle")}
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              {t("landing.ctaSubtitle")}
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="text-base px-8 h-12 rounded-lg">
                <Link href={isAuthenticated ? "/search" : "/signup"}>
                  {isAuthenticated ? t("common.dashboard") : t("landing.ctaButton")}
                  <ArrowRight className="ms-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
