import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import HomepageSectionEditor from './homepage-section-editor'

export const metadata: Metadata = { title: 'Homepage CMS — Admin' }
export const dynamic = 'force-dynamic'

// Map raw DB keys → friendly display names for non-technical staff
const SECTION_NAMES: Record<string, string> = {
  hero:             'Homepage Hero',
  why_choose_us:    'Why Choose Us',
  brands:           'Featured Brands',
  products:         'Featured Products',
  btu_calculator:   'BTU Calculator Promo',
  testimonials:     'Customer Reviews',
  faq_section:      'FAQ Section',
  cta:              'Call To Action',
}

function toTitleCase(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function friendlyName(key: string): string {
  return SECTION_NAMES[key] ?? toTitleCase(key)
}

function hasContent(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false
  return Object.keys(data as object).length > 0
}

export default async function HomepageCmsPage() {
  const db = createAdminClient()
  const { data: sections } = await db
    .from('homepage_sections')
    .select('*')
    .order('section_key')

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Homepage CMS"
        description="Manage your homepage content. Changes go live immediately after saving."
      />

      <div className="mb-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
        <strong>Tip:</strong> Click any section below to edit its content. All changes are saved and published instantly.
        To reorder sections, contact your developer.
      </div>

      <div className="space-y-3">
        {(sections ?? []).map((section: Record<string, unknown>) => {
          const key    = section.section_key as string
          const active = hasContent(section.data)
          return (
            <div key={section.id as string} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 transition-colors">
              {/* Section header — always visible */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 bg-slate-50/50">
                <div className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{friendlyName(key)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">key: {key}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {active ? 'Has content' : 'Empty'}
                </span>
              </div>
              {/* Editor — expanded by default */}
              <div className="p-4">
                <HomepageSectionEditor section={section} />
              </div>
            </div>
          )
        })}
      </div>

      {(!sections || sections.length === 0) && (
        <div className="text-center py-12 text-slate-400">
          <p className="font-medium">No homepage sections configured yet.</p>
          <p className="text-sm mt-1">Contact your developer to set up the initial sections.</p>
        </div>
      )}
    </div>
  )
}
