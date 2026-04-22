import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[#1a2740]',
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#1a2740] bg-[#0c1526]/80 p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}
