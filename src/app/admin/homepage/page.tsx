import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import HomepageSectionEditor from './homepage-section-editor'

export const metadata: Metadata = { title: 'Homepage — Admin' }
export const dynamic = 'force-dynamic'

// Sections shown first (in this order)
const PRIORITY = ['hero', 'why_choose_us', 'cta', 'services', 'btu_calculator']

export default async function HomepageCmsPage() {
  const db = createAdminClient()
  const { data: raw } = await db
    .from('homepage_sections')
    .select('*')
    .order('section_key')

  const sections = (raw ?? []) as Array<{
    id: string
    section_key: string
    title?: string
    subtitle?: string
    is_active?: boolean
    data: Record<string, unknown>
  }>

  // Sort: priority sections first, rest alphabetically
  const sorted = [...sections].sort((a, b) => {
    const ai = PRIORITY.indexOf(a.section_key)
    const bi = PRIORITY.indexOf(b.section_key)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.section_key.localeCompare(b.section_key)
  })

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Homepage"
        description="Edit your homepage content. Every change goes live immediately after saving."
      />

      <div className="space-y-2">
        {sorted.map(section => (
          <HomepageSectionEditor key={section.id} section={section} />
        ))}
      </div>

      {!sections.length && (
        <div className="py-16 text-center text-slate-400">
          <p className="font-medium">No homepage sections found.</p>
          <p className="text-sm mt-1">Add sections via the Supabase dashboard or contact your developer.</p>
        </div>
      )}
    </div>
  )
}
