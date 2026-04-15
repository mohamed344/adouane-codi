"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge — CODI PRO MAX
 * Pill / chip used for status, counts, plan tier, etc.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 [&_svg]:size-3 [&_svg]:shrink-0 transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--surface-2))] text-[hsl(var(--foreground-2))] ring-1 ring-inset ring-[hsl(var(--border))]",
        indigo:
          "bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary-2))] ring-1 ring-inset ring-[hsl(var(--primary)/0.20)]",
        violet:
          "bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent-2))] ring-1 ring-inset ring-[hsl(var(--accent)/0.25)]",
        emerald:
          "bg-[hsl(var(--success-soft))] text-[hsl(var(--success))] ring-1 ring-inset ring-[hsl(var(--success)/0.25)]",
        amber:
          "bg-[hsl(var(--warning-soft))] text-[hsl(var(--warning))] ring-1 ring-inset ring-[hsl(var(--warning)/0.30)]",
        rose:
          "bg-[hsl(var(--destructive-soft))] text-[hsl(var(--destructive))] ring-1 ring-inset ring-[hsl(var(--destructive)/0.25)]",
        slate:
          "bg-[hsl(var(--surface-2))] text-[hsl(var(--muted-fg))] ring-1 ring-inset ring-[hsl(var(--border))]",
        outline:
          "border border-[hsl(var(--border-2))] text-[hsl(var(--foreground-2))] bg-transparent",
        solid:
          "bg-[hsl(var(--primary))] text-[hsl(var(--on-primary))]",
        /* legacy compat aliases for shadcn-style callers */
        secondary:
          "bg-[hsl(var(--surface-2))] text-[hsl(var(--foreground-2))] ring-1 ring-inset ring-[hsl(var(--border))]",
        destructive:
          "bg-[hsl(var(--destructive-soft))] text-[hsl(var(--destructive))] ring-1 ring-inset ring-[hsl(var(--destructive)/0.25)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
