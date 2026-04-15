"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex min-h-[88px] w-full rounded-lg border bg-[hsl(var(--background))] px-3 py-2 text-sm leading-relaxed",
          "border-[hsl(var(--border))]",
          "placeholder:text-[hsl(var(--muted-fg-2))]",
          "transition-[border-color,box-shadow] duration-150 ease-out",
          "focus-visible:outline-none focus-visible:border-[hsl(var(--primary))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.20)]",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-[hsl(var(--surface))]",
          "aria-[invalid=true]:border-[hsl(var(--destructive))] aria-[invalid=true]:focus-visible:ring-[hsl(var(--destructive)/0.20)]",
          "resize-y",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
