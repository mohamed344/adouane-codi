"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CustomsLogo } from "@/components/customs-logo";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-foreground text-white">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <CustomsLogo className="h-9 w-9" />
              <span className="text-xl font-bold">{t("common.appName")}</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              {t("landing.footerDesc")}
            </p>
            <p className="text-xs text-white/50 italic">
              {t("landing.footerMinistry")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider text-white/90">
              {t("landing.footerQuickLinks")}
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              {[
                { href: "#services", label: t("common.services") },
                { href: "#how-it-works", label: t("common.howItWorks") },
                { href: "#features", label: t("common.features") },
                { href: "#pricing", label: t("common.pricing") },
              ].map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-primary transition-colors duration-200">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider text-white/90">
              {t("landing.footerLegal")}
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              {[
                { label: t("common.about") },
                { label: t("common.terms") },
                { label: t("common.privacy") },
              ].map((item) => (
                <li key={item.label}>
                  <Link href="/" className="hover:text-primary transition-colors duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider text-white/90">
              {t("landing.footerContact")}
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t("landing.footerAddress")}
              </li>
              <li className="flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t("landing.footerEmail")}
              </li>
              <li className="flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t("landing.footerPhone")}
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-xs text-white/40 leading-relaxed max-w-3xl">
            {t("disclaimer.footerText")}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} {t("common.appName")}. {t("landing.footerRights")}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-white/50">{t("common.systemOperational")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
