"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoBannerProps {
  variant?: "info" | "warning" | "disclaimer";
  dismissible?: boolean;
  storageKey?: string;
  className?: string;
  children: React.ReactNode;
}

const variantStyles = {
  info: {
    container: "border-l-primary/60 bg-primary/5 text-foreground/80",
    icon: Info,
  },
  warning: {
    container: "border-l-yellow-500 bg-yellow-50 text-yellow-900",
    icon: AlertTriangle,
  },
  disclaimer: {
    container: "border-l-accent bg-muted/60 text-muted-foreground",
    icon: AlertCircle,
  },
};

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

  const { container, icon: Icon } = variantStyles[variant];

  function handleDismiss() {
    setDismissed(true);
    if (storageKey) {
      localStorage.setItem(`banner-dismissed-${storageKey}`, "true");
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border-l-4 px-4 py-3 text-sm",
        container,
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="shrink-0 p-0.5 rounded hover:bg-foreground/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
