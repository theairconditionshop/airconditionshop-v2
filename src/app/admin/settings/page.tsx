import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import SiteSettingsForm from './site-settings-form'
import PromoBannerEditor from './promo-banner-editor'

export const metadata: Metadata = { title: 'Settings — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const db = createAdminClient()
  const { data: settings } = await db
    .from('site_settings')
    .select('key, value, description')
    .order('key')

  const settingsMap = Object.fromEntries((settings ?? []).map((s: { key: string; value: unknown }) => [s.key, s.value]))
  const promoBanner = (settingsMap.promo_banner as Record<string, unknown>) ?? {}

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <AdminPageHeader title="Site Settings" description="General configuration and SEO defaults" />
        <SiteSettingsForm settings={settingsMap as Record<string, string>} />
      </div>
      <PromoBannerEditor initial={promoBanner} />
    </div>
  )
}
