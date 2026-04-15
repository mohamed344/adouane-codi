import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FormField — label + control + (hint OR error) + a11y wiring.
 * Pass an `htmlFor` so screen readers connect the error/hint via aria-describedby
 * (the consumer is responsible for setting it on the underlying input).
 */
export function FormField({
  label,
  error,
  required,
  hint,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-xs leading-relaxed text-[hsl(var(--muted-fg))]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium leading-relaxed text-[hsl(var(--destructive))]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
