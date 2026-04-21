import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-zinc-800/60 bg-[length:200%_100%] animate-shimmer',
        'bg-[linear-gradient(90deg,#27272a_25%,#3f3f46_50%,#27272a_75%)]',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

export function SkeletonStudentRow() {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-24 hidden sm:block" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-800">
        <Skeleton className="h-3.5 w-40" />
      </div>
      <div className="divide-y divide-zinc-800/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-4">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDetailPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="lg:col-span-2 space-y-5">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
