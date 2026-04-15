import { cn } from "@/lib/utils";

const maxWidthMap = {
  narrow: "max-w-2xl",
  default: "max-w-4xl",
  wide: "max-w-6xl",
  full: "max-w-7xl",
} as const;

interface PageShellProps {
  children: React.ReactNode;
  maxWidth?: keyof typeof maxWidthMap;
  className?: string;
}

/**
 * PageShell — wraps every protected page with consistent max-width and padding.
 * Use `maxWidth="full"` for dashboard / list pages.
 */
export function PageShell({
  children,
  maxWidth = "default",
  className,
}: PageShellProps) {
  return (
    <main
      id="main-content"
      className={cn(
        "flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12",
        className
      )}
    >
      <div className={cn("mx-auto w-full", maxWidthMap[maxWidth])}>
        {children}
      </div>
    </main>
  );
}
