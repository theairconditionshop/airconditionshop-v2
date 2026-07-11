import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import HomepageCardsEditor, { type HomepageCard } from './homepage-cards-editor'

export const metadata: Metadata = { title: 'Homepage Cards — Admin' }
export const dynamic = 'force-dynamic'

export default async function HomepageCardsPage() {
  const db = createAdminClient()
  const { data } = await db.from('homepage_cards').select('*').order('display_order')

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Homepage Cards"
        description='Manage the cards in the homepage "Comfort for every space" section. Drag to reorder — order saves automatically. Card edits apply when you press Save.'
      />
      <HomepageCardsEditor initial={(data ?? []) as HomepageCard[]} />
    </div>
  )
}
