'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface BannerData {
  text?:      string
  cta_label?: string
  cta_href?:  string
  bg_color?:  string
  is_active?: boolean
}

const inputCls = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      {children}
    </div>
  )
}

export default function PromoBannerEditor({ initial }: { initial: BannerData }) {
  const [data, setData]     = useState<BannerData>(initial)
  const [saving, setSaving] = useState(false)

  function set(key: keyof BannerData, value: unknown) {
    setData(d => ({ ...d, [key]: value }))
  }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/admin/promo-banner', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('Promo banner saved')
    } else {
      toast.error('Save failed')
    }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Promotional Banner</h2>
          <p className="text-xs text-slate-400 mt-0.5">Site-wide banner shown at the top of every page</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => set('is_active', !data.is_active)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${data.is_active ? 'bg-blue-600' : 'bg-slate-200'}`}
            role="switch"
            aria-checked={data.is_active}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && set('is_active', !data.is_active)}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${data.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-xs text-slate-500">{data.is_active ? 'Active' : 'Hidden'}</span>
        </label>
      </div>

      <div className="p-6 space-y-4">
        {/* Preview */}
        {data.is_active && data.text && (
          <div
            className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white"
            style={{ backgroundColor: data.bg_color || '#2563EB' }}
          >
            {data.text}
            {data.cta_label && data.cta_href && <span className="underline ml-2">{data.cta_label} →</span>}
          </div>
        )}

        <Field label="Banner text" hint="The message shown in the banner. Keep it short — under 80 characters.">
          <input className={inputCls} value={data.text ?? ''} placeholder="Summer special — free installation on all split AC units this month!"
            onChange={e => set('text', e.target.value)} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="CTA button label" hint="Optional. Leave blank for no button.">
            <input className={inputCls} value={data.cta_label ?? ''} placeholder="Shop Now"
              onChange={e => set('cta_label', e.target.value)} />
          </Field>
          <Field label="CTA link URL">
            <input className={inputCls} value={data.cta_href ?? ''} placeholder="/products"
              onChange={e => set('cta_href', e.target.value)} />
          </Field>
        </div>

        <Field label="Background colour" hint="Use a hex colour code. Default: #2563EB (brand blue).">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.bg_color || '#2563EB'}
              onChange={e => set('bg_color', e.target.value)}
              className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer p-1"
            />
            <input className={`${inputCls} flex-1`} value={data.bg_color ?? '#2563EB'}
              placeholder="#2563EB"
              onChange={e => set('bg_color', e.target.value)} />
          </div>
        </Field>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="brand" size="sm" onClick={save} loading={saving}>Save Banner</Button>
        </div>
      </div>
    </div>
  )
}
