export default function AdminLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-48 bg-slate-200 rounded" />
      <div className="h-4 w-64 bg-slate-100 rounded" />
      <div className="grid sm:grid-cols-5 gap-4 mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 mb-3" />
            <div className="h-7 w-12 bg-slate-200 rounded mb-1" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex justify-between">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-12 bg-slate-100 rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-3 flex gap-4 border-b border-slate-50">
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-80 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
