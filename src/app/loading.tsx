export default function Loading() {
  return (
    <div className="min-h-screen bg-white" aria-busy="true" aria-label="Loading page content">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="h-4 w-44 bg-slate-200 rounded animate-shimmer" />
          <div className="hidden lg:flex items-center gap-5">
            {[80, 72, 88, 64, 60].map((w, i) => (
              <div key={i} className="h-3 bg-slate-100 rounded animate-shimmer" style={{ width: w }} />
            ))}
          </div>
          <div className="h-9 w-28 bg-slate-100 rounded-xl animate-shimmer" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="pt-16">
        <div className="bg-slate-950 h-[480px] w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 animate-shimmer" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4">
            <div className="h-3 w-48 bg-white/10 rounded-full animate-shimmer" />
            <div className="h-10 w-[520px] max-w-full bg-white/10 rounded-xl animate-shimmer" />
            <div className="h-6 w-[380px] max-w-full bg-white/[0.07] rounded-xl animate-shimmer" />
            <div className="flex gap-3 mt-4">
              <div className="h-12 w-44 bg-blue-600/30 rounded-xl animate-shimmer" />
              <div className="h-12 w-36 bg-white/10 rounded-xl animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section header */}
        <div className="mb-10">
          <div className="h-3 w-28 bg-slate-100 rounded animate-shimmer mb-3" />
          <div className="h-8 w-72 bg-slate-200 rounded animate-shimmer mb-3" />
          <div className="h-4 w-[440px] max-w-full bg-slate-100 rounded animate-shimmer" />
        </div>

        {/* Product card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
              <div className="aspect-[4/3] bg-slate-100 animate-shimmer" />
              <div className="p-4 space-y-2.5">
                <div className="h-2.5 w-14 bg-slate-100 rounded animate-shimmer" />
                <div className="h-4 w-full bg-slate-200 rounded animate-shimmer" />
                <div className="h-4 w-4/5 bg-slate-100 rounded animate-shimmer" />
                <div className="h-5 w-20 bg-slate-200 rounded animate-shimmer mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
