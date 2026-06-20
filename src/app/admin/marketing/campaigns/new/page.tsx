'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminPageHeader from '@/components/admin/page-header'
import CampaignForm, { type CampaignFormData } from '@/components/admin/campaign-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function NewCampaignPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSave(data: CampaignFormData) {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? `Server error ${res.status}`)
      }
      router.push('/admin/marketing/campaigns')
    } catch (err) {
      console.error('[NewCampaign] save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link href="/admin/marketing/campaigns">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <AdminPageHeader title="New Campaign" />

      <CampaignForm onSave={handleSave} isSaving={saving} />
    </div>
  )
}
