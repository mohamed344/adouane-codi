"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Info, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoBannerProps {
  variant?: "info" | "warning" | "success" | "disclaimer";
  dismissible?: boolean;
  storageKey?: string;
  className?: string;
  children: React.ReactNode;
}

const variantStyles = {
  info: {
    container:
      "border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-2))]",
    iconColor: "text-[hsl(var(--primary))]",
    icon: Info,
  },
  warning: {
    container:
      "border-[hsl(var(--warning)/0.30)] bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))]",
    iconColor: "text-[hsl(var(--warning))]",
    icon: AlertTriangle,
  },
  success: {
    container:
      "border-[hsl(var(--success)/0.30)] bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]",
    iconColor: "text-[hsl(var(--success))]",
    icon: CheckCircle2,
  },
  disclaimer: {
    container:
      "border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--muted-fg))]",
    iconColor: "text-[hsl(var(--muted-fg))]",
    icon: AlertCircle,
  },
};

/**
 * InfoBanner — full-width inline notice (info / warning / success / disclaimer).
 * Optionally dismissible with localStorage persistence via `storageKey`.
 */
export function InfoBanner({
  variant = "info",
  dismissible = false,
  storageKey,
  className,
  children,
}: InfoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissible && storageKey) {
      const stored = localStorage.getItem(`banner-dismissed-${storageKey}`);
      if (stored === "true") setDismissed(true);
    }
  }, [dismissible, storageKey]);

  if (dismissed) return null;

  const { container, iconColor, icon: Icon } = variantStyles[variant];

  function handleDismiss() {
    setDismissed(true);
    if (storageKey) {
      localStorage.setItem(`banner-dismissed-${storageKey}`, "true");
    }
  }

  return (
    <div
      role={variant === "warning" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed",
        container,
        className
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
      <div className="flex-1 text-[hsl(var(--foreground-2))]">{children}</div>
      {dismissible ? (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="-me-1 -mt-0.5 shrink-0 rounded-md p-1 text-[hsl(var(--muted-fg))] transition-colors hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
