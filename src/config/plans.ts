export interface PlanDefinition {
  slug: "free" | "monthly" | "annual";
  price: number;
  billing_cycle: "monthly" | "yearly";
  features: {
    en: string[];
    fr: string[];
    ar: string[];
  };
}

export const PLANS: PlanDefinition[] = [
  {
    slug: "free",
    price: 0,
    billing_cycle: "monthly",
    features: {
      en: [
        "5 HS code lookups per day",
        "Basic tariff information",
        "Community support",
      ],
      fr: [
        "5 recherches de codes SH par jour",
        "Informations tarifaires de base",
        "Support communautaire",
      ],
      ar: [
        "5 عمليات بحث عن رموز النظام المنسق يوميًا",
        "معلومات تعريفية أساسية",
        "دعم المجتمع",
      ],
    },
  },
  {
    slug: "monthly",
    price: 2900,
    billing_cycle: "monthly",
    features: {
      en: [
        "Unlimited HS code lookups",
        "Duty calculator",
        "Regulatory alerts",
        "Document management",
        "Email support",
      ],
      fr: [
        "Recherches illimitées de codes SH",
        "Calculateur de droits",
        "Alertes réglementaires",
        "Gestion documentaire",
        "Support par e-mail",
      ],
      ar: [
        "بحث غير محدود عن رموز النظام المنسق",
        "حاسبة الرسوم",
        "تنبيهات تنظيمية",
        "إدارة الوثائق",
        "دعم عبر البريد الإلكتروني",
      ],
    },
  },
  {
    slug: "annual",
    price: 24900,
    billing_cycle: "yearly",
    features: {
      en: [
        "Everything in Monthly",
        "ALCES integration",
        "Trade intelligence reports",
        "Priority support",
        "API access",
        "Save 28% vs monthly",
      ],
      fr: [
        "Tout le plan Mensuel",
        "Intégration ALCES",
        "Rapports d'intelligence commerciale",
        "Support prioritaire",
        "Accès API",
        "Économisez 28% vs mensuel",
      ],
      ar: [
        "كل مزايا الخطة الشهرية",
        "تكامل ALCES",
        "تقارير الاستخبارات التجارية",
        "دعم ذو أولوية",
        "الوصول إلى واجهة البرمجة",
        "وفّر 28% مقارنة بالشهري",
      ],
    },
  },
];

export const CURRENCY = "DA";

export function formatPrice(price: number): string {
  return price.toLocaleString("fr-DZ");
}

export function getPlanBySlug(slug: string): PlanDefinition | undefined {
  return PLANS.find((p) => p.slug === slug);
}
