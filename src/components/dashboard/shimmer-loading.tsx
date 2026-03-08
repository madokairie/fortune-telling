'use client';

import { cn } from '@/lib/utils';

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-secondary/60',
        className
      )}
    />
  );
}

export function ShimmerLoading() {
  return (
    <div className="space-y-6">
      {/* Overall fortune card skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <ShimmerBlock className="h-5 w-32" />
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-5/6" />
        <ShimmerBlock className="h-4 w-3/4" />
      </div>

      {/* Business cards skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <ShimmerBlock className="h-4 w-36" />
          <ShimmerBlock className="h-3 w-full" />
          <ShimmerBlock className="h-3 w-4/5" />
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <ShimmerBlock className="h-4 w-28" />
          <ShimmerBlock className="h-3 w-full" />
          <ShimmerBlock className="h-3 w-4/5" />
        </div>
      </div>

      {/* Private card skeleton */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <ShimmerBlock className="h-4 w-32" />
        <ShimmerBlock className="h-3 w-full" />
        <ShimmerBlock className="h-3 w-5/6" />
      </div>

      {/* Lucky section skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <ShimmerBlock className="h-10 w-10 mx-auto rounded-full" />
          <ShimmerBlock className="h-3 w-16 mx-auto" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <ShimmerBlock className="h-10 w-10 mx-auto rounded-full" />
          <ShimmerBlock className="h-3 w-16 mx-auto" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2 col-span-2 md:col-span-1">
          <ShimmerBlock className="h-10 w-10 mx-auto rounded-full" />
          <ShimmerBlock className="h-3 w-16 mx-auto" />
        </div>
      </div>
    </div>
  );
}
