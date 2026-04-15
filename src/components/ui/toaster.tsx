"use client";

import { CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

function getIcon(variant?: string) {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="size-5 shrink-0" />;
    case "destructive":
      return <XCircle className="size-5 shrink-0" />;
    case "info":
      return <Info className="size-5 shrink-0" />;
    default:
      return <AlertCircle className="size-5 shrink-0 text-[hsl(var(--muted-fg))]" />;
  }
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} variant={variant} {...props}>
          {getIcon(variant as string)}
          <div className="grid flex-1 gap-1">
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? (
              <ToastDescription>{description}</ToastDescription>
            ) : null}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
