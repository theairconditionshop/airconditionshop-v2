'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminPageHeader from '@/components/admin/page-header'
import CampaignForm, { type CampaignFormData } from '@/components/admin/campaign-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Copy, Trash2 } from 'lucide-react'

import type { Campaign } from '@/types/database'
interface EditCampaignClientProps {
  campaign: Campaign
}

function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function EditCampaignClient({ campaign }: EditCampaignClientProps) {
  const router = useRouter()
  const id = campaign.id as string
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  async function handleSave(data: CampaignFormData) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? `Server error ${res.status}`)
      }
      router.push('/admin/marketing/campaigns')
    } catch (err) {
      console.error('[EditCampaign] save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this campaign? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? `Server error ${res.status}`)
      }
      router.push('/admin/marketing/campaigns')
    } catch (err) {
      console.error('[EditCampaign] delete failed:', err)
    } finally {
      setDeleting(false)
    }
  }

  async function handleDuplicate() {
    setDuplicating(true)
    try {
      const copyTitle = `${campaign.title} (Copy)`
      const copySlug = slugify(copyTitle) + '-' + Date.now()

      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = campaign
      void _id; void _ca; void _ua

      const payload = {
        ...rest,
        title: copyTitle,
        slug: copySlug,
        status: 'draft' as const,
      }

      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? `Server error ${res.status}`)
      }
      const { id: newId } = await res.json()
      router.push(newId ? `/admin/marketing/campaigns/${newId}/edit` : '/admin/marketing/campaigns')
    } catch (err) {
      console.error('[EditCampaign] duplicate failed:', err)
    } finally {
      setDuplicating(false)
    }
  }

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDuplicate}
        disabled={duplicating || saving || deleting}
        className="gap-1"
      >
        <Copy className="w-4 h-4" />
        {duplicating ? 'Duplicating…' : 'Duplicate'}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={deleting || saving || duplicating}
        className="gap-1"
      >
        <Trash2 className="w-4 h-4" />
        {deleting ? 'Deleting…' : 'Delete'}
      </Button>
    </div>
  )

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

      <AdminPageHeader
        title="Edit Campaign"
        action={actions}
      />

      <CampaignForm
        campaign={campaign}
        onSave={handleSave}
        isSaving={saving}
      />
    </div>
  )
}
