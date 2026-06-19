'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const FIELDS = [
  { key: 'site_name',         label: 'Site name' },
  { key: 'site_tagline',      label: 'Tagline' },
  { key: 'phone',             label: 'Phone number' },
  { key: 'email',             label: 'Support email' },
  { key: 'address',           label: 'Business address' },
  { key: 'vat_number',        label: 'VAT number' },
  { key: 'meta_title',        label: 'Default meta title' },
  { key: 'meta_description',  label: 'Default meta description' },
  { key: 'google_analytics',  label: 'Google Analytics ID' },
  { key: 'facebook_url',      label: 'Facebook URL' },
  { key: 'instagram_url',     label: 'Instagram URL' },
  { key: 'linkedin_url',      label: 'LinkedIn URL' },
]

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
    <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
      {FIELDS.map(f => (
        <Input
          key={f.key}
          label={f.label}
          value={values[f.key] || ''}
          onChange={e => set(f.key, e.target.value)}
        />
      ))}
      <Button variant="brand" onClick={save} loading={saving}>Save Settings</Button>
    </div>
  )
}
