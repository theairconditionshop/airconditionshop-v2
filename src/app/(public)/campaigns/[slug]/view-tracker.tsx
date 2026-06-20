'use client'

import { useEffect } from 'react'

export default function CampaignViewTracker({ campaignId }: { campaignId: string }) {
  useEffect(() => {
    fetch('/api/campaign-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: campaignId, event_type: 'view' }),
    }).catch(() => {})
  }, [campaignId])
  return null
}
