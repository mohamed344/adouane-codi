"use client";

import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  eyebrow?: string;
  className?: string;
}

/**
 * PageHeader — page-level title block.
 * Left-aligned headline (Linear/Vercel pattern) with an optional eyebrow,
 * breadcrumbs, subtitle, and right-side action slot.
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 sm:mb-10", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-1 text-sm text-[hsl(var(--muted-fg))]"
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
              ) : null}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="rounded-sm transition-colors hover:text-[hsl(var(--foreground))]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className="font-medium text-[hsl(var(--foreground))]"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))] sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-base leading-relaxed text-[hsl(var(--muted-fg))] max-w-2xl">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
