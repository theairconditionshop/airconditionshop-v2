import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import HomepageSectionEditor from './homepage-section-editor'

export const metadata: Metadata = { title: 'Homepage CMS — Admin' }
export const dynamic = 'force-dynamic'

export default async function HomepageCmsPage() {
  const db = createAdminClient()
  const { data: sections } = await db
    .from('homepage_sections')
    .select('*')
    .order('sort_order')

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Homepage CMS"
        description="Edit homepage sections. Changes go live immediately after saving."
      />
      <div className="space-y-4">
        {(sections ?? []).map((section: Record<string, unknown>) => (
          <HomepageSectionEditor key={section.id as string} section={section} />
        ))}
      </div>
    </div>
  )
}
