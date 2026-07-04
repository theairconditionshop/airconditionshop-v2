'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ImageUploadField from '@/components/admin/image-upload-field'

interface PageHeroRow {
  id: string
  page_key: string
  title: string | null
  subtitle: string | null
  desktop_image_url: string | null
  tablet_image_url: string | null
  mobile_image_url: string | null
  overlay_opacity: number
  cta_label: string | null
  cta_href: string | null
  show_breadcrumb: boolean
}

const PAGE_LABELS: Record<string, string> = {
  about: 'About',
  services: 'Services',
  trade: 'Trade Accounts',
  contact: 'Contact',
  quote: 'Quote Request',
  brands: 'Brands',
  blog: 'Blog',
  warranty: 'Warranty',
  faq: 'FAQ',
  commercial: 'Commercial Solutions',
  installation: 'Installation',
  accessories: 'Accessories',
}

const inputCls = 'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
const textareaCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  )
}

/**
 * One reusable editor, used for every page_key row. Admin UI automatically
 * supports any new page — no per-page component needed, just insert a new
 * row with the desired page_key.
 */
export default function PageHeroEditor({ hero }: { hero: PageHeroRow }) {
  const [form, setForm] = useState(hero)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(false)

  function patch(next: Partial<PageHeroRow>) {
    setForm(f => ({ ...f, ...next }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/page-heroes/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle,
          desktop_image_url: form.desktop_image_url,
          tablet_image_url: form.tablet_image_url,
          mobile_image_url: form.mobile_image_url,
          overlay_opacity: form.overlay_opacity,
          cta_label: form.cta_label,
          cta_href: form.cta_href,
          show_breadcrumb: form.show_breadcrumb,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Hero saved')
    } catch {
      toast.error('Failed to save — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div>
          <p className="text-sm font-semibold text-slate-900">{PAGE_LABELS[form.page_key] ?? form.page_key}</p>
          <p className="text-xs text-slate-400 mt-0.5">/{form.page_key}</p>
        </div>
        <span className="text-xs text-slate-400">{expanded ? 'Collapse' : 'Edit'}</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Hero title">
              <input className={inputCls} value={form.title ?? ''} onChange={e => patch({ title: e.target.value })} />
            </Field>
            <Field label="CTA link">
              <input className={inputCls} value={form.cta_href ?? ''} placeholder="/contact" onChange={e => patch({ cta_href: e.target.value })} />
            </Field>
          </div>
          <Field label="Hero subtitle">
            <textarea className={textareaCls} rows={2} value={form.subtitle ?? ''} onChange={e => patch({ subtitle: e.target.value })} />
          </Field>
          <Field label="CTA button text">
            <input className={inputCls} value={form.cta_label ?? ''} placeholder="Get in Touch" onChange={e => patch({ cta_label: e.target.value })} />
          </Field>

          <div className="grid sm:grid-cols-3 gap-4">
            <ImageUploadField
              label="Desktop Hero"
              hint="Shown on screens ≥1280px wide."
              aspectRatio="21 / 9"
              recommendedWidth={3840}
              recommendedHeight={1646}
              value={form.desktop_image_url}
              onChange={url => patch({ desktop_image_url: url })}
            />
            <ImageUploadField
              label="Tablet Hero"
              hint="768–1279px. Falls back to Desktop if not set."
              aspectRatio="4 / 3"
              recommendedWidth={2048}
              recommendedHeight={1536}
              value={form.tablet_image_url}
              onChange={url => patch({ tablet_image_url: url })}
            />
            <ImageUploadField
              label="Mobile Hero"
              hint="≤767px. Falls back to Desktop if not set."
              aspectRatio="9 / 16"
              recommendedWidth={1440}
              recommendedHeight={2560}
              value={form.mobile_image_url}
              onChange={url => patch({ mobile_image_url: url })}
            />
          </div>

          <Field label={`Overlay darkness (${Math.round(form.overlay_opacity * 100)}%)`}>
            <input
              type="range"
              min={0}
              max={0.7}
              step={0.05}
              value={form.overlay_opacity}
              onChange={e => patch({ overlay_opacity: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </Field>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.show_breadcrumb}
              onChange={e => patch({ show_breadcrumb: e.target.checked })}
              className="cursor-pointer"
            />
            Show breadcrumb navigation on this page
          </label>

          <div className="pt-2 border-t border-slate-100">
            <Button onClick={handleSave} loading={saving} className="gap-2">
              <Save className="w-4 h-4" /> Save Hero
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
