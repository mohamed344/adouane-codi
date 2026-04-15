"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Button — CODI PRO MAX
 * Linear/Vercel modern minimal. Indigo gradient primary, slate-100 secondary.
 *
 * Variants
 *   primary     — indigo gradient, white text (default)
 *   secondary   — slate-100 surface, slate-900 text
 *   outline     — transparent + 1px slate border
 *   ghost       — transparent until hover
 *   destructive — red surface
 *   link        — text link with underline on hover
 *
 * Sizes
 *   sm   — h-8  px-3
 *   md   — h-10 px-4 (default)
 *   lg   — h-11 px-6
 *   icon — h-10 w-10 (square)
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium tracking-tight",
    "transition-[background,box-shadow,transform,color] duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "active:scale-[0.98]",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        // alias: legacy callers use `default` — maps to primary
        default: [
          "rounded-lg",
          "bg-[hsl(var(--primary))] text-[hsl(var(--on-primary))]",
          "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.16),0_1px_2px_hsl(var(--primary)/0.3),0_4px_14px_-4px_hsl(var(--primary)/0.45)]",
          "hover:bg-[hsl(var(--primary-2))]",
          "hover:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.18),0_1px_2px_hsl(var(--primary)/0.35),0_8px_22px_-6px_hsl(var(--primary)/0.55)]",
        ].join(" "),
        primary: [
          "rounded-lg",
          "bg-[hsl(var(--primary))] text-[hsl(var(--on-primary))]",
          "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.16),0_1px_2px_hsl(var(--primary)/0.3),0_4px_14px_-4px_hsl(var(--primary)/0.45)]",
          "hover:bg-[hsl(var(--primary-2))]",
          "hover:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.18),0_1px_2px_hsl(var(--primary)/0.35),0_8px_22px_-6px_hsl(var(--primary)/0.55)]",
        ].join(" "),
        secondary: [
          "rounded-lg",
          "bg-[hsl(var(--surface-2))] text-[hsl(var(--foreground))]",
          "border border-[hsl(var(--border))]",
          "hover:bg-[hsl(var(--surface-3))] hover:border-[hsl(var(--border-2))]",
        ].join(" "),
        outline: [
          "rounded-lg",
          "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
          "border border-[hsl(var(--border))]",
          "hover:bg-[hsl(var(--surface))] hover:border-[hsl(var(--border-2))]",
        ].join(" "),
        ghost: [
          "rounded-lg",
          "text-[hsl(var(--foreground-2))]",
          "hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]",
        ].join(" "),
        destructive: [
          "rounded-lg",
          "bg-[hsl(var(--destructive))] text-white",
          "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.16),0_1px_2px_hsl(var(--destructive)/0.3),0_4px_14px_-4px_hsl(var(--destructive)/0.4)]",
          "hover:brightness-95",
        ].join(" "),
        link: [
          "rounded-md h-auto p-0 px-1",
          "text-[hsl(var(--primary))] underline-offset-4 hover:underline",
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        // alias: legacy callers use `default` — maps to md
        default: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    compoundVariants: [
      { variant: "link", size: "sm", className: "h-auto px-1 text-xs" },
      { variant: "link", size: "md", className: "h-auto px-1 text-sm" },
      { variant: "link", size: "lg", className: "h-auto px-1 text-base" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, disabled, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" /> : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
