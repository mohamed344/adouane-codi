import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  variant: "profile-card" | "table" | "pricing-grid" | "stats-grid" | "form";
  className?: string;
}

export function LoadingSkeleton({ variant, className }: LoadingSkeletonProps) {
  switch (variant) {
    case "stats-grid":
      return (
        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
            className
          )}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      );

    case "profile-card":
      return (
        <div className={cn("space-y-6", className)}>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      );

    case "table":
      return (
        <div className={cn("space-y-3", className)}>
          <Skeleton className="h-10 w-full rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      );

    case "pricing-grid":
      return (
        <div
          className={cn(
            "grid grid-cols-1 gap-6 md:grid-cols-3",
            className
          )}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      );

    case "form":
      return (
        <div className={cn("space-y-4", className)}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="mt-6 h-10 w-full rounded-lg" />
        </div>
      );
  }
}
