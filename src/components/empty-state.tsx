import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState — friendly placeholder for empty lists / first-run states.
 * Centered icon in indigo-tinted bubble, title, description, optional CTA.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-4 py-16 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] ring-1 ring-[hsl(var(--primary)/0.20)]">
        <Icon className="h-7 w-7 text-[hsl(var(--primary))]" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-[hsl(var(--foreground))]">
        {title}
      </h3>
      <p className="max-w-sm text-sm leading-relaxed text-[hsl(var(--muted-fg))]">
        {description}
      </p>
      {action ? (
        <Button onClick={action.onClick} variant="primary" size="md" className="mt-2">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
