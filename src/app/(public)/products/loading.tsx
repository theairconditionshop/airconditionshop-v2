import { ProductGridSkeleton, SidebarSkeleton } from '@/components/ui/skeleton'

export default function ProductsLoading() {
  return (
    <main className="min-h-screen pt-20 bg-slate-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Title skeleton */}
        <div className="mb-6 lg:mb-8 space-y-2">
          <div className="h-2.5 w-16 animate-shimmer rounded-full" />
          <div className="h-7 w-48 animate-shimmer rounded-lg" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <SidebarSkeleton />
          <div className="flex-1 min-w-0">
            <div className="h-3 w-24 animate-shimmer rounded mb-4" />
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </main>
  )
}
