import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import PageHeroEditor from './page-hero-editor'

export const metadata: Metadata = { title: 'Page Heroes — Admin' }
export const dynamic = 'force-dynamic'

export default async function PageHeroesAdminPage() {
  const db = createAdminClient()
  const { data: raw } = await db
    .from('page_heroes')
    .select('*')
    .order('page_key')

  const heroes = (raw ?? []) as Array<{
    id: string
    page_key: string
    title: string | null
    subtitle: string | null
    desktop_image_url: string | null
    tablet_image_url: string | null
    mobile_image_url: string | null
    overlay_opacity: number
    cta_label: string | null
    cta_href: string | null
    show_breadcrumb: boolean
  }>

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Page Heroes"
        description="Edit the hero banner (title, subtitle, desktop/tablet/mobile images, CTA) for every page on the site. One reusable editor — new pages appear here automatically once a row exists."
      />

      <div className="space-y-2">
        {heroes.map(hero => (
          <PageHeroEditor key={hero.id} hero={hero} />
        ))}
      </div>

      {!heroes.length && (
        <div className="py-16 text-center text-slate-400">
          <p className="font-medium">No page heroes found.</p>
          <p className="text-sm mt-1">Add rows to the page_heroes table via Supabase or contact your developer.</p>
        </div>
      )}
    </div>
  )
}
