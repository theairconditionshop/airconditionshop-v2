import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-shimmer rounded-lg', className)} />
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 overflow-hidden flex flex-col">
      {/* Image — matches real card's aspect-[4/3] */}
      <div className="aspect-[4/3] animate-shimmer" />

      {/* Info — matches real card padding and content layout */}
      <div className="flex flex-col flex-1 p-4 lg:p-5 gap-2">
        {/* Brand pill */}
        <div className="h-2.5 w-14 animate-shimmer rounded-full" />
        {/* Product name — 2 lines */}
        <div className="h-3.5 w-full animate-shimmer rounded" />
        <div className="h-3.5 w-3/4 animate-shimmer rounded" />

        {/* Price row + CTA */}
        <div className="mt-3 flex items-end justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-10 animate-shimmer rounded" />
            <div className="h-4 w-20 animate-shimmer rounded" />
          </div>
          <div className="h-3 w-20 animate-shimmer rounded" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-24 space-y-6">
        {[5, 4, 3].map((lines, gi) => (
          <div key={gi} className="space-y-2">
            <div className="h-2.5 w-20 animate-shimmer rounded-full" />
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="h-8 animate-shimmer rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full animate-shimmer rounded" />
        </td>
      ))}
    </tr>
  )
}
