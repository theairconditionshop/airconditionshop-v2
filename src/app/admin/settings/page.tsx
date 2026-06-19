import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import SiteSettingsForm from './site-settings-form'

export const metadata: Metadata = { title: 'Settings — Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const db = createAdminClient()
  const { data: settings } = await db
    .from('site_settings')
    .select('key, value, description')
    .order('key')

  const settingsMap = Object.fromEntries((settings ?? []).map((s: { key: string; value: string }) => [s.key, s.value]))

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Site Settings" description="General configuration and SEO defaults" />
      <SiteSettingsForm settings={settingsMap} />
    </div>
  )
}
