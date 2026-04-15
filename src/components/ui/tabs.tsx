"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

/**
 * Tabs — CODI PRO MAX
 * Underline-style (Linear pattern). Headless behavior from Radix.
 */
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center gap-1 border-b border-[hsl(var(--border))]",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex h-10 items-center justify-center px-3 text-sm font-medium",
      "text-[hsl(var(--muted-fg))] transition-colors duration-150 ease-out",
      "hover:text-[hsl(var(--foreground))]",
      "focus-visible:outline-none focus-visible:text-[hsl(var(--foreground))]",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:text-[hsl(var(--foreground))]",
      // active underline
      "after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:scale-x-0 after:bg-[hsl(var(--primary))] after:transition-transform after:duration-200 after:ease-out",
      "data-[state=active]:after:scale-x-100",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-md",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
