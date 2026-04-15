"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-[hsl(var(--foreground-2))]",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
      {required ? (
        <span
          aria-hidden="true"
          className="ms-1 text-[hsl(var(--destructive))]"
        >
          *
        </span>
      ) : null}
    </label>
  )
);
Label.displayName = "Label";

export { Label };
