import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} {...rest} />;
}

export function SkeletonStack({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] p-4">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-7 w-28" />
    </div>
  );
}

export function SkeletonChart({ height = 200 }: { height?: number }) {
  return <Skeleton className="w-full rounded-lg" style={{ height }} />;
}
