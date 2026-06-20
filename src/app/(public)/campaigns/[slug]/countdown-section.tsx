'use client'

import CampaignCountdown from '@/components/campaigns/campaign-countdown'

export default function CampaignCountdownSection({ endDate }: { endDate: string }) {
  return <CampaignCountdown endDate={endDate} />
}
