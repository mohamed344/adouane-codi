"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input — CODI PRO MAX
 * h-10, slate border, indigo focus ring, supports left/right slot via wrapper.
 *
 * For icon slots, wrap with <InputGroup>:
 *   <InputGroup>
 *     <InputLeftSlot><SearchIcon /></InputLeftSlot>
 *     <Input ... />
 *   </InputGroup>
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-[hsl(var(--background))] px-3 py-2 text-sm",
          "border-[hsl(var(--border))]",
          "placeholder:text-[hsl(var(--muted-fg-2))]",
          "transition-[border-color,box-shadow] duration-150 ease-out",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[hsl(var(--foreground))]",
          "focus-visible:outline-none focus-visible:border-[hsl(var(--primary))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.20)]",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-[hsl(var(--surface))]",
          "aria-[invalid=true]:border-[hsl(var(--destructive))] aria-[invalid=true]:focus-visible:ring-[hsl(var(--destructive)/0.20)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

/* ---------- InputGroup (for icon slots) ---------- */

const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex items-center", className)}
      {...props}
    >
      {children}
    </div>
  )
);
InputGroup.displayName = "InputGroup";

const InputLeftSlot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "pointer-events-none absolute start-3 flex items-center text-[hsl(var(--muted-fg))] [&_svg]:size-4",
      className
    )}
    {...props}
  />
));
InputLeftSlot.displayName = "InputLeftSlot";

const InputRightSlot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute end-2 flex items-center gap-1 text-[hsl(var(--muted-fg))] [&_svg]:size-4",
      className
    )}
    {...props}
  />
));
InputRightSlot.displayName = "InputRightSlot";

export { Input, InputGroup, InputLeftSlot, InputRightSlot };
