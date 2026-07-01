'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Brand { id: string; name: string }

export default function NewSeriesButton({ brands }: { brands: Brand[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [brandId, setBrandId] = useState(brands[0]?.id ?? '')
  const [saving, setSaving] = useState(false)

  async function create() {
    if (name.trim().length < 2) { toast.error('Enter a series name'); return }
    setSaving(true)
    const res = await fetch('/api/admin/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), brand_id: brandId || null }),
    })
    if (res.ok) {
      const { id } = await res.json()
      toast.success('Series created')
      router.push(`/admin/series/${id}/edit`)
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Failed to create series')
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <Button variant="brand" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5" /> New Series
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !saving && setOpen(false)}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-slate-900">New AC Series</h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Brand</label>
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm bg-white"
          >
            <option value="">— No brand —</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Series name</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="e.g. Pular"
            className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
          />
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="brand" size="sm" onClick={create} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Create
          </Button>
        </div>
      </div>
    </div>
  )
}
