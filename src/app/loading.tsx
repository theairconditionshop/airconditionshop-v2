export default function Loading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-200 rounded" />
          <div className="hidden lg:flex items-center gap-6">
            {[80, 96, 64, 72, 56, 64].map((w, i) => (
              <div key={i} className="h-4 bg-slate-100 rounded" style={{ width: w }} />
            ))}
          </div>
          <div className="h-8 w-28 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="pt-16">
        <div className="bg-slate-50 h-[420px] w-full" />
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <div className="h-3 w-32 bg-slate-100 rounded mb-4" />
          <div className="h-9 w-64 bg-slate-200 rounded mb-3" />
          <div className="h-4 w-96 bg-slate-100 rounded" />
        </div>

        {/* Card grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden bg-white">
              <div className="aspect-[4/3] bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="h-5 w-20 bg-slate-200 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
