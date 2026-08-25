interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className = '', rounded = 'rounded-md' }: SkeletonProps) {
  return <div className={`skeleton ${rounded} ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-ink-850 p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10" rounded="rounded-xl" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="mt-4 h-7 w-20" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}

export function DocRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10" rounded="rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-16" rounded="rounded-full" />
      <Skeleton className="h-8 w-8" rounded="rounded-lg" />
    </div>
  );
}

export function PodcastCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-ink-850 p-4">
      <Skeleton className="h-32 w-full" rounded="rounded-xl" />
      <Skeleton className="mt-4 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}
