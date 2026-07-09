import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("skeleton", className)} aria-hidden="true" {...props} />;
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <div className={cn("skeleton skeleton--text", className)} aria-hidden="true" {...props} />;
}

export function StatusCardSkeleton() {
  return (
    <article
      className="card stack stack--lg"
      data-testid="status-card-skeleton"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="skeleton--badge" />
      </div>
      <SkeletonText className="w-1/3" />
      <div className="stack stack--sm">
        <SkeletonText />
        <SkeletonText className="w-5/6" />
      </div>
    </article>
  );
}

export function QueueTableSkeleton() {
  return (
    <div
      data-testid="queue-table-skeleton"
      role="status"
      aria-label="Loading queue"
      className="stack stack--sm p-4"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function DetailPanelSkeleton() {
  return (
    <div
      className="stack stack--lg p-4"
      data-testid="detail-panel-skeleton"
      role="status"
      aria-label="Loading ticket"
    >
      <div className="flex gap-2">
        <Skeleton className="skeleton--badge" />
        <Skeleton className="skeleton--badge" />
        <Skeleton className="skeleton--badge" />
      </div>
      <Skeleton className="h-6 w-2/3" />
      <SkeletonText className="w-1/2" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function ConsoleAuthSkeleton() {
  return (
    <main id="main-content" className="density-compact flex min-h-dvh flex-col">
      <header className="border-b border-border bg-surface px-4 py-3">
        <div className="stack stack--sm">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-32" />
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center p-6" role="status" aria-label="Loading console">
        <SkeletonText className="w-40" />
      </div>
    </main>
  );
}
