import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import EditCampaignClient from './edit-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCampaignPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !campaign) {
    notFound()
  }

  return <EditCampaignClient campaign={campaign} />
}
