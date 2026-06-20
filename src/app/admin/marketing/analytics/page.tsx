import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'

export const metadata: Metadata = { title: 'Campaign Analytics — Admin' }
export const dynamic = 'force-dynamic'

type CampaignRow = {
  id: string
  title: string
  status?: string
}

type CampaignSummary = {
  id: string
  title: string
  status: string
  views: number
  cta_clicks: number
  shares: number
  lead_submits: number
  conversion_rate: number
}

function ConversionBadge({ rate }: { rate: number }) {
  const label = `${rate.toFixed(1)}%`
  if (rate > 5) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        {label}
      </span>
    )
  }
  if (rate >= 1) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
      {label}
    </span>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 px-5 py-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</span>
    </div>
  )
}

export default async function CampaignAnalyticsPage() {
  const db = createAdminClient()

  const [{ data: campaigns, error: campaignsError }, { data: analyticsRaw, error: analyticsRawError }] =
    await Promise.all([
      db.from('campaigns').select('id, title, status'),
      db.from('campaign_analytics').select('campaign_id, event_type'),
    ])

  if (campaignsError) console.error('[admin/marketing/analytics] campaigns:', campaignsError.message)
  if (analyticsRawError) console.error('[admin/marketing/analytics] analytics:', analyticsRawError.message)

  // Aggregate in-memory
  const counts: Record<string, Record<string, number>> = {}
  for (const row of (analyticsRaw ?? []) as { campaign_id: string; event_type: string }[]) {
    if (!counts[row.campaign_id]) counts[row.campaign_id] = {}
    counts[row.campaign_id][row.event_type] = (counts[row.campaign_id][row.event_type] ?? 0) + 1
  }

  const campaignList = (campaigns ?? []) as CampaignRow[]

  const summaries: CampaignSummary[] = campaignList.map(c => {
    const ev = counts[c.id] ?? {}
    const views = ev['view'] ?? 0
    const cta_clicks = ev['cta_click'] ?? 0
    const shares = ev['share'] ?? 0
    const lead_submits = ev['lead_submit'] ?? 0
    const conversion_rate = views > 0 ? (lead_submits / views) * 100 : 0
    return {
      id: c.id,
      title: c.title,
      status: c.status ?? 'draft',
      views,
      cta_clicks,
      shares,
      lead_submits,
      conversion_rate,
    }
  })

  summaries.sort((a, b) => b.views - a.views)

  const hasData = analyticsRaw && analyticsRaw.length > 0

  const totalViews = summaries.reduce((s, c) => s + c.views, 0)
  const totalClicks = summaries.reduce((s, c) => s + c.cta_clicks, 0)
  const totalShares = summaries.reduce((s, c) => s + c.shares, 0)
  const totalLeads = summaries.reduce((s, c) => s + c.lead_submits, 0)

  return (
    <div>
      <AdminPageHeader
        title="Campaign Analytics"
        description="Automatically tracked engagement across all campaigns."
      />

      {!hasData ? (
        <div className="mt-6 rounded-xl border border-slate-100 bg-white py-16 text-center">
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            No analytics data yet. Analytics are tracked automatically when visitors view campaigns.
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total Views" value={totalViews} />
            <StatCard label="Total Clicks" value={totalClicks} />
            <StatCard label="Total Shares" value={totalShares} />
            <StatCard label="Total Leads" value={totalLeads} />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Campaign Name', 'Status', 'Views', 'CTA Clicks', 'Shares', 'Leads', 'Conversion Rate'].map(col => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 font-medium text-slate-600 text-xs whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {summaries.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{c.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          c.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : c.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-700'
                            : c.status === 'ended'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 tabular-nums">{c.views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700 tabular-nums">{c.cta_clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700 tabular-nums">{c.shares.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700 tabular-nums">{c.lead_submits.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <ConversionBadge rate={c.conversion_rate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
