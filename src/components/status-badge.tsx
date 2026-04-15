import { CheckCircle2, XCircle, Clock, AlertCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: {
    icon: CheckCircle2,
    label: "Active",
    className:
      "bg-[hsl(var(--success-soft))] text-[hsl(var(--success))] ring-1 ring-inset ring-[hsl(var(--success)/0.25)]",
  },
  expired: {
    icon: XCircle,
    label: "Expired",
    className:
      "bg-[hsl(var(--destructive-soft))] text-[hsl(var(--destructive))] ring-1 ring-inset ring-[hsl(var(--destructive)/0.25)]",
  },
  cancelled: {
    icon: MinusCircle,
    label: "Cancelled",
    className:
      "bg-[hsl(var(--surface-2))] text-[hsl(var(--muted-fg))] ring-1 ring-inset ring-[hsl(var(--border))]",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    className:
      "bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))] ring-1 ring-inset ring-[hsl(var(--warning)/0.30)]",
  },
  warning: {
    icon: AlertCircle,
    label: "Warning",
    className:
      "bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))] ring-1 ring-inset ring-[hsl(var(--warning)/0.30)]",
  },
} as const;

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {displayLabel}
    </span>
  );
}
