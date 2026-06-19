import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { getSession, getProfile } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { Package, FileText, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Trade Dashboard',
}

export default async function TradeDashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile || profile.role !== 'trade' || profile.trade_status !== 'approved') {
    redirect('/trade')
  }

  const db = await createClient()
  const { data: quoteRequests } = await db
    .from('quote_requests')
    .select('id, created_at, service_type, budget_range, status')
    .eq('email', user.email!)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: serviceRequests } = await db
    .from('service_requests')
    .select('id, created_at, service_type, status, preferred_date')
    .eq('customer_email', user.email!)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Trade Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {profile.full_name || user.email}</p>
          </div>

          {/* Quick actions */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <a href="/products" className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 transition-colors flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Browse Products</p>
                <p className="text-xs text-slate-500">Trade prices applied</p>
              </div>
            </a>
            <a href="/quote" className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 transition-colors flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Request Quote</p>
                <p className="text-xs text-slate-500">Project or bulk orders</p>
              </div>
            </a>
            <a href="tel:+35679661889" className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 transition-colors flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                <Phone className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Trade Support</p>
                <p className="text-xs text-slate-500">+356 7966 1889</p>
              </div>
            </a>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Quote requests */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Recent Quote Requests</h2>
              {!quoteRequests?.length ? (
                <p className="text-sm text-slate-400 py-4 text-center">No quote requests yet.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {quoteRequests.map((q: { id: string; created_at: string; service_type?: string; status: string }) => (
                    <div key={q.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{q.service_type || 'General'}</p>
                        <p className="text-xs text-slate-400">{new Date(q.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{q.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service requests */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Recent Service Requests</h2>
              {!serviceRequests?.length ? (
                <p className="text-sm text-slate-400 py-4 text-center">No service requests yet.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {serviceRequests.map((s: { id: string; created_at: string; service_type: string; status: string }) => (
                    <div key={s.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.service_type}</p>
                        <p className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{s.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
