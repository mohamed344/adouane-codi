"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { CustomsLogo } from "@/components/customs-logo";

/**
 * Footer — slate-50 surface with 4-column link grid + bottom system status bar.
 */
export function Footer() {
  const t = useTranslations();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const linkClass =
    "text-sm text-[hsl(var(--muted-fg))] transition-colors hover:text-[hsl(var(--foreground))]";

  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
      <div className="container-app py-16">
        {/* Top row */}
        <div className="mb-10 flex justify-end">
          <button
            onClick={scrollToTop}
            type="button"
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-fg))] transition-colors hover:text-[hsl(var(--foreground))]"
            aria-label="Back to top"
          >
            {t("common.backToTop")}
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Main grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5 flex items-center gap-2.5">
              <CustomsLogo className="h-9 w-9" />
              <span className="text-lg font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                {t("common.appName")}
              </span>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[hsl(var(--muted-fg))]">
              {t("landing.footerDesc")}
            </p>
            <p className="text-xs italic text-[hsl(var(--muted-fg-2))]">
              {t("landing.footerMinistry")}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--foreground))]">
              {t("landing.footerQuickLinks")}
            </h4>
            <ul className="space-y-3">
              {[
                { href: "#features", label: t("common.services") },
                { href: "#how-it-works", label: t("common.howItWorks") },
                { href: "#features", label: t("common.features") },
                { href: "#pricing", label: t("common.pricing") },
              ].map((item, i) => (
                <li key={`${item.href}-${i}`}>
                  <a href={item.href} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links">
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--foreground))]">
              {t("landing.footerLegal")}
            </h4>
            <ul className="space-y-3">
              {[
                t("common.about"),
                t("common.terms"),
                t("common.privacy"),
              ].map((label) => (
                <li key={label}>
                  <Link href="/" className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--foreground))]">
              {t("landing.footerContact")}
            </h4>
            <ul className="space-y-3 text-sm text-[hsl(var(--muted-fg))]">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                {t("landing.footerAddress")}
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                {t("landing.footerEmail")}
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                {t("landing.footerPhone")}
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 border-t border-[hsl(var(--border))] pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-[hsl(var(--muted-fg-2))]">
            {t("disclaimer.footerText")}
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[hsl(var(--border))] pt-6 sm:flex-row">
          <p className="text-xs text-[hsl(var(--muted-fg))]">
            &copy; {new Date().getFullYear()} {t("common.appName")}.{" "}
            {t("landing.footerRights")}
          </p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--success))] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
            </span>
            <span className="text-xs text-[hsl(var(--muted-fg))]">
              {t("common.systemOperational")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
