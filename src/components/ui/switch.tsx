"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

/**
 * Switch — CODI PRO MAX
 * Indigo when checked, slate-300 when unchecked.
 */
const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
      "border-2 border-transparent",
      "transition-colors duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-[hsl(var(--primary))]",
      "data-[state=unchecked]:bg-[hsl(var(--surface-3))]",
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white",
        "shadow-[0_1px_2px_rgba(15,23,42,0.15),0_3px_6px_-2px_rgba(15,23,42,0.20)]",
        "ring-0",
        "transition-transform duration-200 ease-out",
        "data-[state=checked]:translate-x-5",
        "data-[state=unchecked]:translate-x-0",
        "rtl:data-[state=checked]:-translate-x-5"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
