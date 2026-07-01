import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { Package, MessageSquare, FileText, Wrench, Users, TrendingUp, Layers } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard — Admin' }

async function getStats() {
  const db = createAdminClient()
  const [products, series, enquiries, quotes, services, trade] = await Promise.all([
    db.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    db.from('product_series').select('id', { count: 'exact', head: true }).eq('is_active', true),
    db.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    db.from('quote_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    db.from('service_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'trade').eq('trade_status', 'pending'),
  ])
  return {
    products:    products.count ?? 0,
    series:      series.count ?? 0,
    enquiries:   enquiries.count ?? 0,
    quotes:      quotes.count ?? 0,
    services:    services.count ?? 0,
    tradePending: trade.count ?? 0,
  }
}

async function getRecentEnquiries() {
  const db = createAdminClient()
  const { data } = await db
    .from('enquiries')
    .select('id, name, email, message, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

export default async function AdminDashboard() {
  const [stats, recentEnquiries] = await Promise.all([getStats(), getRecentEnquiries()])

  const STAT_CARDS = [
    { label: 'Products',         value: stats.products,     href: '/admin/products',   color: 'bg-sky-50 text-sky-600',       Icon: Package },
    { label: 'AC Series',         value: stats.series,       href: '/admin/series',     color: 'bg-indigo-50 text-indigo-600', Icon: Layers },
    { label: 'New Enquiries',     value: stats.enquiries,    href: '/admin/enquiries',  color: 'bg-amber-50 text-amber-600',   Icon: MessageSquare },
    { label: 'Quote Requests',    value: stats.quotes,       href: '/admin/quotes',     color: 'bg-purple-50 text-purple-600', Icon: FileText },
    { label: 'Service Requests',  value: stats.services,     href: '/admin/services',   color: 'bg-emerald-50 text-emerald-600', Icon: Wrench },
    { label: 'Trade Pending',     value: stats.tradePending, href: '/admin/trade',      color: 'bg-rose-50 text-rose-600',     Icon: Users },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of your store</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {STAT_CARDS.map(({ label, value, href, color, Icon }) => (
          <a key={label} href={href}
            className="bg-white rounded-xl border border-slate-100 p-4 lg:p-5 hover:border-sky-200 hover:shadow-sm transition-all group">
            <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <p className="text-xl lg:text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{label}</p>
          </a>
        ))}
      </div>

      {/* Recent enquiries */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-900 text-sm">Recent Enquiries</h2>
          <a href="/admin/enquiries" className="text-xs text-sky-600 hover:underline">View all</a>
        </div>
        <div className="divide-y divide-slate-50">
          {recentEnquiries.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No enquiries yet.</p>
          )}
          {recentEnquiries.map((e: { id: string; name: string; email: string; message: string; created_at: string; status: string }) => (
            <div key={e.id} className="px-4 sm:px-5 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                  <span className="font-medium text-sm text-slate-900">{e.name}</span>
                  <span className="text-xs text-slate-400 truncate max-w-[160px]">{e.email}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{e.message}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${e.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {e.status}
                </span>
                <span className="text-[10px] text-slate-400">{new Date(e.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        {[
          { label: 'Edit Homepage',   href: '/admin/homepage',     desc: 'Update hero, sections, CTAs' },
          { label: 'Add Product',     href: '/admin/products/new', desc: 'Create a new product listing' },
          { label: 'Write Blog Post', href: '/admin/blog/new',     desc: 'Publish news or a guide' },
        ].map(q => (
          <a key={q.label} href={q.href}
            className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 hover:border-sky-200 transition-colors group">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-sky-500 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">{q.label}</span>
            </div>
            <p className="text-xs text-slate-500">{q.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
