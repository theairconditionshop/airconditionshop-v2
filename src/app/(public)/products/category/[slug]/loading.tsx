import { ProductGridSkeleton } from '@/components/ui/skeleton'

export default function CategoryLoading() {
  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-2 mb-8">
          <div className="h-2.5 w-32 animate-shimmer rounded-full" />
          <div className="h-7 w-56 animate-shimmer rounded-lg" />
          <div className="h-3.5 w-96 animate-shimmer rounded mt-2" />
        </div>
        <div className="h-3 w-24 animate-shimmer rounded mb-5" />
        <ProductGridSkeleton count={8} />
      </div>
    </main>
  )
}
