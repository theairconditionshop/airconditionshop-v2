import { ProductGridSkeleton } from '@/components/ui/skeleton'

export default function BrandLoading() {
  return (
    <main className="min-h-screen pt-20">
      {/* Hero skeleton */}
      <div className="h-48 lg:h-64 animate-shimmer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-10 animate-shimmer rounded-lg" />
          <div className="space-y-2">
            <div className="h-6 w-40 animate-shimmer rounded" />
            <div className="h-3.5 w-64 animate-shimmer rounded" />
          </div>
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </main>
  )
}
