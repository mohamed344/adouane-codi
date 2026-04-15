"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 end-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-4 sm:end-4 sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  cn(
    "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden p-4 pe-10",
    "rounded-xl border bg-[hsl(var(--background))]",
    "shadow-[0_10px_38px_-10px_rgba(15,23,42,0.40),0_10px_20px_-15px_rgba(15,23,42,0.20)]",
    "data-[state=open]:[animation:toast-in_220ms_cubic-bezier(0.16,1,0.3,1)]",
    "data-[state=closed]:[animation:toast-out_180ms_ease-in]",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:transition-none"
  ),
  {
    variants: {
      variant: {
        default: "border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
        success:
          "border-[hsl(var(--success)/0.30)] bg-[hsl(var(--success-soft))] text-[hsl(var(--success))]",
        destructive:
          "border-[hsl(var(--destructive)/0.30)] bg-[hsl(var(--destructive-soft))] text-[hsl(var(--destructive))]",
        info:
          "border-[hsl(var(--primary)/0.30)] bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-2))]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-current bg-transparent px-3 text-xs font-medium",
      "transition-colors hover:bg-current/10",
      "focus:outline-none focus:ring-2 focus:ring-current/40",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute end-2 top-2 rounded-md p-1.5 text-current opacity-60 transition-opacity",
      "hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-current/40",
      className
    )}
    toast-close=""
    aria-label="Close"
    {...props}
  >
    <X className="size-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
