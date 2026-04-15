import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Kbd — keyboard hint shortcut, e.g. ⌘K, Esc, ↵
 */
const Kbd = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => (
  <kbd
    ref={ref}
    className={cn(
      "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-1.5 font-mono text-[10px] font-medium text-[hsl(var(--muted-fg))]",
      className
    )}
    {...props}
  >
    {children}
  </kbd>
));
Kbd.displayName = "Kbd";

export { Kbd };
