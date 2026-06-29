'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FieldDef {
  key: string
  label: string
  hint?: string
  type?: 'text' | 'textarea' | 'url' | 'email' | 'tel'
}

interface Section {
  title: string
  fields: FieldDef[]
}

const SECTIONS: Section[] = [
  {
    title: 'Company Information',
    fields: [
      { key: 'company_name',    label: 'Trading name',       hint: 'Customer-facing name. e.g. THE AIRCONDITION SHOP' },
      { key: 'legal_name',      label: 'Legal entity name',  hint: 'Used on legal pages only. e.g. AS GROUP' },
      { key: 'vat_number',      label: 'VAT number',         hint: 'e.g. MT3103-8724' },
      { key: 'company_phone',   label: 'Phone number',       type: 'tel', hint: 'e.g. +356 7966 1889' },
      { key: 'company_email',   label: 'Email address',      type: 'email' },
      { key: 'company_address', label: 'Full address',       hint: '220 Vjal L-Indipendenza, Mosta MST 9022, Malta' },
      { key: 'copyright_text',  label: 'Copyright text',     hint: 'Shown in footer bottom bar' },
    ],
  },
  {
    title: 'Opening Hours',
    fields: [
      { key: 'company_hours_weekday',  label: 'Monday – Friday', hint: 'e.g. 08:00–18:00' },
      { key: 'company_hours_saturday', label: 'Saturday',        hint: 'e.g. 08:00–14:00' },
      { key: 'company_hours_sunday',   label: 'Sunday',          hint: 'e.g. Closed' },
    ],
  },
  {
    title: 'Social Media & Reviews',
    fields: [
      { key: 'social_facebook',   label: 'Facebook URL',        type: 'url', hint: 'https://facebook.com/theairconditionshop' },
      { key: 'social_instagram',  label: 'Instagram URL',       type: 'url', hint: 'https://instagram.com/theairconditionshop' },
      { key: 'google_review_url', label: 'Google Review URL',   type: 'url', hint: 'https://g.page/r/... — links to your Google review form' },
      { key: 'google_maps_url',   label: 'Google Maps URL',     type: 'url' },
    ],
  },
  {
    title: 'SEO Defaults',
    fields: [
      { key: 'site_tagline',      label: 'Site tagline',          hint: 'Short descriptor used in meta tags' },
      { key: 'default_seo_title', label: 'Default page title',    hint: 'Used when no page-specific title is set' },
      { key: 'default_seo_desc',  label: 'Default meta description', type: 'textarea' },
    ],
  },
  {
    title: 'Installation Offer',
    fields: [
      { key: 'installation_offer_enabled', label: 'Enable installation offer block', hint: 'Set to "true" to show the FREE installation block on AC product pages, "false" to hide it' },
      { key: 'installation_pipe_price_12k',   label: 'Extra pipe price — 12,000 BTU units (€ per metre)', hint: 'e.g. 25' },
      { key: 'installation_pipe_price_large', label: 'Extra pipe price — 18,000 & 24,000 BTU units (€ per metre)', hint: 'e.g. 29' },
    ],
  },
]

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function FieldRow({ field, value, onChange }: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
}) {
  if (field.type === 'textarea') {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">{field.label}</label>
        {field.hint && <p className="text-[11px] text-slate-400">{field.hint}</p>}
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
        />
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1">
      <Input
        label={field.label}
        type={field.type || 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {field.hint && <p className="text-[11px] text-slate-400 -mt-0.5">{field.hint}</p>}
    </div>
  )
}

export default function SiteSettingsForm({ settings }: { settings: Record<string, string> }) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>(settings)
  const [saving, setSaving] = useState(false)

  function set(key: string, value: string) {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (res.ok) {
      toast.success('Settings saved')
      router.refresh()
    } else {
      toast.error('Save failed')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {SECTIONS.map(section => (
        <SectionCard key={section.title} title={section.title}>
          {section.fields.map(field => (
            <FieldRow
              key={field.key}
              field={field}
              value={values[field.key] ?? ''}
              onChange={v => set(field.key, v)}
            />
          ))}
        </SectionCard>
      ))}
      <div className="flex justify-end">
        <Button variant="brand" onClick={save} loading={saving}>Save All Settings</Button>
      </div>
    </div>
  )
}
