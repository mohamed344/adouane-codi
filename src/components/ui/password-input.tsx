"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, InputGroup, InputRightSlot, type InputProps } from "@/components/ui/input";

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  toggleAriaLabel?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, toggleAriaLabel = "Toggle password visibility", ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <InputGroup>
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pe-10", className)}
          {...props}
        />
        <InputRightSlot>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={toggleAriaLabel}
            aria-pressed={visible}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--muted-fg))] transition-colors hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </InputRightSlot>
      </InputGroup>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
