'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronDown, Save, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ImageUploadField from '@/components/admin/image-upload-field'

// ── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string
  section_key: string
  title?: string
  subtitle?: string
  is_active?: boolean
  data: Record<string, unknown>
}

// ── Generic labelled input / textarea helpers ────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      {hint && <p className="text-[11px] text-slate-400 -mt-0.5">{hint}</p>}
      {children}
    </div>
  )
}

const inputCls = 'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
const textareaCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors'

// ── Section editors ──────────────────────────────────────────────────────────

function HeroEditor({ data, onChange, onImageChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onImageChange?: (d: Record<string, unknown>) => void }) {
  const cta1 = (data.cta_primary  as { label?: string; href?: string }) ?? {}
  const cta2 = (data.cta_secondary as { label?: string; href?: string }) ?? {}

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Main headline">
          <input className={inputCls} value={(data.headline as string) ?? ''} placeholder="Malta's Premier HVAC Specialists"
            onChange={e => onChange({ ...data, headline: e.target.value })} />
        </Field>
        <Field label="Badge / eyebrow text" hint="Small text above the headline">
          <input className={inputCls} value={(data.badge as string) ?? ''} placeholder="HVAC · Refrigeration · Ventilation · Installation Materials"
            onChange={e => onChange({ ...data, badge: e.target.value })} />
        </Field>
      </div>
      <Field label="Sub-headline / description">
        <textarea className={textareaCls} rows={3} value={(data.description as string) ?? ''}
          placeholder="Premium air conditioning solutions for Malta…"
          onChange={e => onChange({ ...data, description: e.target.value })} />
      </Field>
      <ImageUploadField
        label="Background Image"
        hint="Upload a high-quality HVAC photo. Recommended: 1920×1080px or wider."
        aspectRatio="16 / 9"
        value={(data.media_url as string) || null}
        onChange={url => {
          const next = { ...data, media_url: url ?? '' }
          onChange(next)
          onImageChange?.(next)
        }}
      />

      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Button</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Button text">
            <input className={inputCls} value={cta1.label ?? ''} placeholder="Explore Products"
              onChange={e => onChange({ ...data, cta_primary: { ...cta1, label: e.target.value } })} />
          </Field>
          <Field label="Button link">
            <input className={inputCls} value={cta1.href ?? ''} placeholder="/products"
              onChange={e => onChange({ ...data, cta_primary: { ...cta1, href: e.target.value } })} />
          </Field>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Secondary Button</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Button text">
            <input className={inputCls} value={cta2.label ?? ''} placeholder="Get a Quote"
              onChange={e => onChange({ ...data, cta_secondary: { ...cta2, label: e.target.value } })} />
          </Field>
          <Field label="Button link">
            <input className={inputCls} value={cta2.href ?? ''} placeholder="/quote"
              onChange={e => onChange({ ...data, cta_secondary: { ...cta2, href: e.target.value } })} />
          </Field>
        </div>
      </div>
    </div>
  )
}

function ServicesPageEditor({ data, onChange, onImageChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onImageChange?: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <ImageUploadField
        label="Engineer / Service Photo"
        hint="Shown in the 'Why regular servicing matters' section on the /services page. Recommended: 1200×1500px portrait or similar."
        aspectRatio="4 / 5"
        value={(data.engineer_photo_url as string) || null}
        onChange={url => {
          const next = { ...data, engineer_photo_url: url ?? '' }
          onChange(next)
          onImageChange?.(next)
        }}
      />
    </div>
  )
}

function TradePageEditor({ data, onChange, onImageChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onImageChange?: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <ImageUploadField
        label="Warehouse / Stock Photo"
        hint="Shown large in the imagery strip on the /trade page. Recommended: 1600×1200px or similar."
        aspectRatio="4 / 3"
        value={(data.warehouse_photo_url as string) || null}
        onChange={url => {
          const next = { ...data, warehouse_photo_url: url ?? '' }
          onChange(next)
          onImageChange?.(next)
        }}
      />
      <ImageUploadField
        label="Installer Photo"
        hint="Shown in the imagery strip on the /trade page. Recommended: 1200×900px or similar."
        aspectRatio="4 / 3"
        value={(data.installer_photo_url as string) || null}
        onChange={url => {
          const next = { ...data, installer_photo_url: url ?? '' }
          onChange(next)
          onImageChange?.(next)
        }}
      />
      <ImageUploadField
        label="Trade Counter Photo"
        hint="Shown in the imagery strip on the /trade page. Recommended: 1200×900px or similar."
        aspectRatio="4 / 3"
        value={(data.counter_photo_url as string) || null}
        onChange={url => {
          const next = { ...data, counter_photo_url: url ?? '' }
          onChange(next)
          onImageChange?.(next)
        }}
      />
    </div>
  )
}

function AboutPageEditor({ data, onChange, onImageChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onImageChange?: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <ImageUploadField
        label="Showroom Photo"
        hint="Shown in the 'Our Story' section on the /about page. Recommended: 1600×900px (16:9) or similar."
        aspectRatio="16 / 9"
        value={(data.showroom_photo_url as string) || null}
        onChange={url => {
          const next = { ...data, showroom_photo_url: url ?? '' }
          onChange(next)
          onImageChange?.(next)
        }}
      />
    </div>
  )
}

function WhyChooseUsEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  type Item = { icon: string; title: string; description: string }
  const items: Item[] = Array.isArray(data.items)
    ? (data.items as Item[])
    : [
        { icon: 'shield-check', title: '', description: '' },
        { icon: 'wrench',       title: '', description: '' },
        { icon: 'clock',        title: '', description: '' },
      ]

  function updateItem(i: number, patch: Partial<Item>) {
    const next = items.map((item, idx) => idx === i ? { ...item, ...patch } : item)
    onChange({ ...data, items: next })
  }

  return (
    <div className="space-y-4">
      <Field label="Section heading">
        <input className={inputCls} value={(data.heading as string) ?? ''} placeholder="Why choose us"
          onChange={e => onChange({ ...data, heading: e.target.value })} />
      </Field>

      {items.map((item, i) => (
        <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Feature {i + 1}</p>
          <Field label="Title">
            <input className={inputCls} value={item.title} placeholder={['Authorised Dealer', 'Expert Installation', 'Fast Response'][i] ?? 'Feature title'}
              onChange={e => updateItem(i, { title: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea className={textareaCls} rows={2} value={item.description}
              placeholder="Short description of this feature…"
              onChange={e => updateItem(i, { description: e.target.value })} />
          </Field>
        </div>
      ))}
    </div>
  )
}

function CtaEditor({ data, onChange, onImageChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onImageChange?: (d: Record<string, unknown>) => void }) {
  const cta1 = (data.cta_primary  as { label?: string; href?: string }) ?? {}
  const cta2 = (data.cta_secondary as { label?: string; href?: string }) ?? {}

  return (
    <div className="space-y-4">
      <Field label="Headline">
        <input className={inputCls} value={(data.heading as string) ?? ''} placeholder="Ready to get started?"
          onChange={e => onChange({ ...data, heading: e.target.value })} />
      </Field>
      <Field label="Description">
        <textarea className={textareaCls} rows={2} value={(data.description as string) ?? ''}
          placeholder="Contact us today for a free site survey…"
          onChange={e => onChange({ ...data, description: e.target.value })} />
      </Field>
      <ImageUploadField
        label="Right-Side Image"
        hint="Shown on desktop beside the text. Leave empty for full-width text layout."
        aspectRatio="4 / 3"
        value={(data.image_url as string) || null}
        onChange={url => {
          const next = { ...data, image_url: url ?? '' }
          onChange(next)
          onImageChange?.(next)
        }}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Button</p>
          <Field label="Button text">
            <input className={inputCls} value={cta1.label ?? ''} placeholder="Request a Quote"
              onChange={e => onChange({ ...data, cta_primary: { ...cta1, label: e.target.value } })} />
          </Field>
          <Field label="Button link">
            <input className={inputCls} value={cta1.href ?? ''} placeholder="/quote"
              onChange={e => onChange({ ...data, cta_primary: { ...cta1, href: e.target.value } })} />
          </Field>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Secondary Button</p>
          <Field label="Button text">
            <input className={inputCls} value={cta2.label ?? ''} placeholder="Contact Us"
              onChange={e => onChange({ ...data, cta_secondary: { ...cta2, label: e.target.value } })} />
          </Field>
          <Field label="Button link">
            <input className={inputCls} value={cta2.href ?? ''} placeholder="/contact"
              onChange={e => onChange({ ...data, cta_secondary: { ...cta2, href: e.target.value } })} />
          </Field>
        </div>
      </div>
    </div>
  )
}

function BtuPromoEditor({ data, onChange, onImageChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onImageChange?: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Heading" hint="Leave blank for default text">
        <input className={inputCls} value={(data.heading as string) ?? ''} placeholder="Not sure which air conditioner you need?"
          onChange={e => onChange({ ...data, heading: e.target.value })} />
      </Field>
      <Field label="Description">
        <textarea className={textareaCls} rows={2} value={(data.description as string) ?? ''}
          placeholder="Calculate the right cooling capacity…"
          onChange={e => onChange({ ...data, description: e.target.value })} />
      </Field>
      <ImageUploadField
        label="Section Image"
        hint="Optional — leave empty to show the 3-step process illustration instead."
        aspectRatio="4 / 3"
        value={(data.image_url as string) || null}
        onChange={url => {
          const next = { ...data, image_url: url ?? '' }
          onChange(next)
          onImageChange?.(next)
        }}
      />
    </div>
  )
}

function TradeCtaEditor({ data, onChange, onImageChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onImageChange?: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <ImageUploadField
        label="Installer Photo"
        hint="HVAC installer or technician at work. Shown beside the trade content."
        aspectRatio="3 / 4"
        value={(data.image_url as string) || null}
        onChange={url => {
          const next = { ...data, image_url: url ?? '' }
          onChange(next)
          onImageChange?.(next)
        }}
      />
    </div>
  )
}

function ServicesEditor({ data, onChange, onImageChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onImageChange?: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Section heading">
        <input className={inputCls} value={(data.heading as string) ?? ''} placeholder="Our Services"
          onChange={e => onChange({ ...data, heading: e.target.value })} />
      </Field>
      <Field label="Description">
        <textarea className={textareaCls} rows={2} value={(data.description as string) ?? ''}
          placeholder="What we offer…"
          onChange={e => onChange({ ...data, description: e.target.value })} />
      </Field>
      <ImageUploadField
        label="Services Photo"
        hint="HVAC technician or installation. Shown above the heading on mobile, beside services on desktop."
        aspectRatio="4 / 3"
        value={(data.image_url as string) || null}
        onChange={url => {
          const next = { ...data, image_url: url ?? '' }
          onChange(next)
          onImageChange?.(next)
        }}
      />
    </div>
  )
}

function GenericEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const keys = Object.keys(data).filter(k => typeof data[k] === 'string' || typeof data[k] === 'number')

  if (!keys.length) {
    return (
      <p className="text-sm text-slate-400 py-2">
        This section has no editable text fields yet. Contact your developer to set it up.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {keys.map(k => (
        <Field key={k} label={k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}>
          <input className={inputCls} value={String(data[k])}
            onChange={e => onChange({ ...data, [k]: e.target.value })} />
        </Field>
      ))}
    </div>
  )
}

// ── Section label map ────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  hero:           'Homepage Hero',
  why_choose_us:  'Why Choose Us',
  cta:            'Call To Action',
  services:       'Services Section',
  btu_calculator: 'BTU Calculator Promo',
  btu_promo:      'BTU Calculator Promo',
  trade_cta:      'Trade Programme',
  services_page:  'Services Page Photo',
  trade_page:     'Trade Page Photos',
  about_page:     'About Page Photo',
  brands:         'Featured Brands',
  products:       'Featured Products',
  testimonials:   'Customer Reviews',
  faq_section:    'FAQ Section',
}

function sectionLabel(key: string) {
  return SECTION_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function sectionDescription(key: string): string {
  const map: Record<string, string> = {
    hero:           'Main banner at the top of the homepage',
    why_choose_us:  'Three reasons customers choose you',
    cta:            'Bottom call-to-action block',
    services:       'Services overview section',
    services_page:  'Photo shown on the standalone /services page',
    trade_page:     'Warehouse, installer and trade counter photos shown on /trade',
    about_page:     'Showroom photo shown on the standalone /about page',
    btu_calculator: 'BTU calculator promotional block',
    brands:         'Brand logos displayed on homepage',
    products:       'Featured product grid',
    testimonials:   'Customer testimonials',
    faq_section:    'Frequently asked questions',
  }
  return map[key] ?? 'Homepage section'
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function HomepageSectionEditor({ section }: { section: Section }) {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [data, setData]       = useState<Record<string, unknown>>(section.data ?? {})
  const [saving, setSaving]   = useState(false)
  const [dirty, setDirty]     = useState(false)

  function handleChange(next: Record<string, unknown>) {
    setData(next)
    setDirty(true)
  }

  async function saveData(payload: Record<string, unknown>) {
    setSaving(true)
    const res = await fetch(`/api/admin/homepage/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: payload }),
    })
    if (res.ok) {
      setDirty(false)
      router.refresh()
    }
    setSaving(false)
    return res.ok
  }

  async function save() {
    const ok = await saveData(data)
    if (ok) toast.success('Section saved — changes are now live')
    else toast.error('Save failed. Please try again.')
  }

  async function handleImageChange(next: Record<string, unknown>) {
    setData(next)
    setDirty(false)
    const ok = await saveData(next)
    if (ok) toast.success('Image saved automatically')
    else {
      setDirty(true)
      toast.error('Auto-save failed — click Save Changes to retry.')
    }
  }

  const key = section.section_key

  function renderEditor() {
    if (key === 'hero')           return <HeroEditor data={data} onChange={handleChange} onImageChange={handleImageChange} />
    if (key === 'why_choose_us')  return <WhyChooseUsEditor data={data} onChange={handleChange} />
    if (key === 'cta')            return <CtaEditor data={data} onChange={handleChange} onImageChange={handleImageChange} />
    if (key === 'services')       return <ServicesEditor data={data} onChange={handleChange} onImageChange={handleImageChange} />
    if (key === 'btu_promo' || key === 'btu_calculator') return <BtuPromoEditor data={data} onChange={handleChange} onImageChange={handleImageChange} />
    if (key === 'trade_cta')      return <TradeCtaEditor data={data} onChange={handleChange} onImageChange={handleImageChange} />
    if (key === 'services_page')  return <ServicesPageEditor data={data} onChange={handleChange} onImageChange={handleImageChange} />
    if (key === 'trade_page')     return <TradePageEditor data={data} onChange={handleChange} onImageChange={handleImageChange} />
    if (key === 'about_page')     return <AboutPageEditor data={data} onChange={handleChange} onImageChange={handleImageChange} />
    return <GenericEditor data={data} onChange={handleChange} />
  }

  return (
    <div className={cn(
      'bg-white rounded-2xl border transition-colors overflow-hidden',
      open ? 'border-blue-200 shadow-sm' : 'border-slate-100 hover:border-slate-200'
    )}>
      {/* Header row — click to expand */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <div className={cn('w-2 h-2 rounded-full shrink-0 mt-0.5', Object.keys(data).length > 0 ? 'bg-emerald-400' : 'bg-slate-300')} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm">{sectionLabel(key)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{sectionDescription(key)}</p>
        </div>
        {dirty && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            Unsaved
          </span>
        )}
        {open
          ? <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
          : <Eye className="w-4 h-4 text-slate-400 shrink-0" />
        }
        <ChevronDown className={cn('w-4 h-4 text-slate-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-5">
          {renderEditor()}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              Changes go live on the website immediately after saving.
            </p>
            <Button
              variant="brand"
              size="sm"
              onClick={save}
              loading={saving}
              disabled={!dirty}
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
