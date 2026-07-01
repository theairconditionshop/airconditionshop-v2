'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, GripVertical, Palette, Package, ChevronDown, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, slugify } from '@/lib/utils'
import SeriesImageGallery from '@/components/admin/series-image-gallery'
import type { ProductSeries, SeriesColour, ProductVariant, SeriesImage } from '@/types/database'

interface Opt { id: string; name: string }

// Local editable rows carry a client key + (for variants) colour_slug
type ColourRow  = Partial<SeriesColour> & { _key: string; name: string; slug: string }
type VariantRow = Partial<ProductVariant> & { _key: string; colour_slug: string | null }

let keyCounter = 0
const nk = () => `new-${keyCounter++}`

export default function SeriesEditor({
  series, brands, categories,
}: { series: ProductSeries; brands: Opt[]; categories: Opt[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // ── Series fields ──
  const [name, setName]               = useState(series.name)
  const [slug, setSlug]               = useState(series.slug)
  const [brandId, setBrandId]         = useState(series.brand_id ?? '')
  const [categoryId, setCategoryId]   = useState(series.category_id ?? '')
  const [tagline, setTagline]         = useState(series.tagline ?? '')
  const [description, setDescription] = useState(series.description ?? '')
  const [features, setFeatures]       = useState((series.features ?? []).join('\n'))
  const [acType, setAcType]           = useState(series.ac_type ?? '')
  const [warranty, setWarranty]       = useState(series.warranty_years?.toString() ?? '')
  const [hasColours, setHasColours]   = useState(series.has_colours)
  const [visibility, setVisibility]   = useState<ProductSeries['price_visibility']>(series.price_visibility)
  const [isActive, setIsActive]       = useState(series.is_active)
  const [isFeatured, setIsFeatured]   = useState(series.is_featured)
  const [seoTitle, setSeoTitle]       = useState(series.seo_title ?? '')
  const [seoDesc, setSeoDesc]         = useState(series.seo_desc ?? '')

  // ── Colours ──
  const [colours, setColours] = useState<ColourRow[]>(
    (series.colours ?? []).sort((a, b) => a.display_order - b.display_order)
      .map(c => ({ ...c, _key: c.id! }))
  )
  const [deletedColourIds, setDeletedColourIds] = useState<string[]>([])

  // ── Variants ──
  const colourSlugFor = (colourId: string | null): string | null => {
    if (!colourId) return null
    const c = (series.colours ?? []).find(x => x.id === colourId)
    return c?.slug ?? null
  }
  const [variants, setVariants] = useState<VariantRow[]>(
    (series.variants ?? []).sort((a, b) => (a.display_order - b.display_order) || ((a.btu ?? 0) - (b.btu ?? 0)))
      .map(v => ({ ...v, _key: v.id!, colour_slug: colourSlugFor(v.colour_id) }))
  )
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  const images = (series.images ?? []) as SeriesImage[]
  const savedColours = (series.colours ?? []) as SeriesColour[]

  // ── Colour ops ──
  function addColour() {
    setColours(prev => [...prev, { _key: nk(), name: 'New colour', slug: '', hex: '#ffffff', display_order: prev.length, is_active: true, is_default: prev.length === 0 }])
  }
  function updateColour(key: string, patch: Partial<ColourRow>) {
    setColours(prev => prev.map(c => c._key === key ? { ...c, ...patch } : c))
  }
  function removeColour(key: string) {
    setColours(prev => {
      const c = prev.find(x => x._key === key)
      if (c?.id) setDeletedColourIds(d => [...d, c.id!])
      return prev.filter(x => x._key !== key)
    })
  }

  // ── Variant ops ──
  function addVariant() {
    setVariants(prev => [...prev, {
      _key: nk(), colour_slug: null, btu: null, label: '', sku: '',
      trade_price_mode: 'fixed', availability: 'in_stock', is_active: true, display_order: prev.length,
    }])
  }
  function updateVariant(key: string, patch: Partial<VariantRow>) {
    setVariants(prev => prev.map(v => v._key === key ? { ...v, ...patch } : v))
  }
  function removeVariant(key: string) {
    setVariants(prev => {
      const v = prev.find(x => x._key === key)
      if (v?.id) setDeletedVariantIds(d => [...d, v.id!])
      return prev.filter(x => x._key !== key)
    })
  }

  function num(v: string): number | null {
    if (v.trim() === '') return null
    const n = Number(v); return Number.isFinite(n) ? n : null
  }

  async function save() {
    if (name.trim().length < 2) { toast.error('Series name is required'); return }
    setSaving(true)

    const payload = {
      series: {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        brand_id: brandId || null,
        category_id: categoryId || null,
        tagline: tagline || null,
        description: description || null,
        features: features.split('\n').map(f => f.trim()).filter(Boolean),
        ac_type: acType || null,
        warranty_years: warranty.trim() === '' ? null : Number(warranty),
        has_colours: hasColours,
        price_visibility: visibility,
        is_active: isActive,
        is_featured: isFeatured,
        seo_title: seoTitle || null,
        seo_desc: seoDesc || null,
      },
      colours: hasColours ? colours.map((c, i) => ({
        id: c.id,
        name: c.name,
        slug: (c.slug?.trim() || slugify(c.name)),
        hex: c.hex ?? null,
        display_order: i,
        is_default: c.is_default ?? false,
        is_active: c.is_active ?? true,
      })) : [],
      variants: variants.map((v, i) => ({
        id: v.id,
        colour_slug: hasColours ? v.colour_slug : null,
        btu: v.btu ?? null,
        label: v.label || null,
        sku: v.sku || null,
        model_indoor: v.model_indoor || null,
        model_outdoor: v.model_outdoor || null,
        cooling_btu: v.cooling_btu ?? null,
        heating_btu: v.heating_btu ?? null,
        seer: v.seer ?? null,
        scop: v.scop ?? null,
        seer_class: v.seer_class || null,
        scop_class: v.scop_class || null,
        energy_rating: v.energy_rating || null,
        dimensions_indoor: v.dimensions_indoor || null,
        dimensions_outdoor: v.dimensions_outdoor || null,
        copper_gas: v.copper_gas || null,
        copper_liquid: v.copper_liquid || null,
        refrigerant: v.refrigerant || null,
        retail_price: v.retail_price ?? null,
        original_price: v.original_price ?? null,
        sale_price: v.sale_price ?? null,
        trade_price: v.trade_price ?? null,
        trade_discount_pct: v.trade_discount_pct ?? null,
        trade_price_mode: v.trade_price_mode ?? 'fixed',
        availability: v.availability ?? 'in_stock',
        is_active: v.is_active ?? true,
        display_order: i,
      })),
      // Only send deletions for colours we didn't also drop by disabling has_colours
      deletedColourIds: hasColours ? deletedColourIds : savedColours.map(c => c.id),
      deletedVariantIds,
    }

    const res = await fetch(`/api/admin/series/${series.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      toast.success('Series saved')
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Save failed')
    }
    setSaving(false)
  }

  async function deleteSeries() {
    if (!confirm('Delete this entire series, including all colours, variants and images? This cannot be undone.')) return
    const res = await fetch(`/api/admin/series/${series.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Series deleted'); router.push('/admin/series') }
    else toast.error('Delete failed')
  }

  const inputCls = 'h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const smInput  = 'h-9 w-full rounded-md border border-slate-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-slate-900">Edit Series</h1>
          <p className="text-sm text-slate-500">/products/{brands.find(b => b.id === brandId)?.name.toLowerCase() ?? '—'}/{slug}</p>
        </div>
        <button onClick={deleteSeries} className="text-xs text-red-500 hover:text-red-600 inline-flex items-center gap-1 cursor-pointer">
          <Trash className="w-3.5 h-3.5" /> Delete series
        </button>
      </div>

      {/* ── Basic info ── */}
      <section className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">Series Info</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Series name</label>
            <input className={inputCls} value={name} onChange={e => { setName(e.target.value); if (!series.slug) setSlug(slugify(e.target.value)) }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Slug</label>
            <input className={inputCls} value={slug} onChange={e => setSlug(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Brand</label>
            <select className={inputCls} value={brandId} onChange={e => setBrandId(e.target.value)}>
              <option value="">— No brand —</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select className={inputCls} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">— No category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">AC type</label>
            <input className={inputCls} value={acType} onChange={e => setAcType(e.target.value)} placeholder="wall_mounted" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Warranty (years)</label>
            <input className={inputCls} type="number" value={warranty} onChange={e => setWarranty(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Tagline</label>
          <input className={inputCls} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Short one-liner shown under the title" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Features <span className="text-slate-400 font-normal">(one per line)</span></label>
          <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" value={features} onChange={e => setFeatures(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-5 pt-1">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4" /> Active (visible on site)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4" /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={hasColours} onChange={e => setHasColours(e.target.checked)} className="w-4 h-4" /> Has colour options
          </label>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            Pricing:
            <select className="h-9 rounded-md border border-slate-200 px-2 text-sm" value={visibility} onChange={e => setVisibility(e.target.value as ProductSeries['price_visibility'])}>
              <option value="public">Public</option>
              <option value="trade_only">Trade only</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Hero gallery ── */}
      <section className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">Hero Images <span className="text-slate-400 font-normal">— shown when no colour is selected</span></h3>
        <SeriesImageGallery seriesId={series.id} colourId={null} label="Series hero" initial={images.filter(i => i.colour_id == null)} />
      </section>

      {/* ── Colours ── */}
      {hasColours && (
        <section className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5"><Palette className="w-4 h-4 text-slate-400" /> Colours</h3>
            <Button variant="outline" size="sm" onClick={addColour} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add colour</Button>
          </div>
          {colours.length === 0 && <p className="text-xs text-slate-400">No colours yet. Add the finishes shown in the brochure.</p>}
          <div className="space-y-4">
            {colours.map(c => {
              const savedColour = savedColours.find(sc => sc.id === c.id)
              return (
                <div key={c._key} className="rounded-lg border border-slate-150 border-slate-200 p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                    <input type="color" value={c.hex ?? '#ffffff'} onChange={e => updateColour(c._key, { hex: e.target.value })} className="w-9 h-9 rounded cursor-pointer border border-slate-200" />
                    <input className={cn(smInput, 'flex-1 min-w-32')} value={c.name} onChange={e => updateColour(c._key, { name: e.target.value })} placeholder="Colour name" />
                    <input className={cn(smInput, 'w-32')} value={c.slug ?? ''} onChange={e => updateColour(c._key, { slug: e.target.value })} placeholder="slug (auto)" />
                    <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={c.is_default ?? false} onChange={e => updateColour(c._key, { is_default: e.target.checked })} /> Default
                    </label>
                    <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={c.is_active ?? true} onChange={e => updateColour(c._key, { is_active: e.target.checked })} /> Active
                    </label>
                    <button onClick={() => removeColour(c._key)} className="text-red-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {savedColour ? (
                    <SeriesImageGallery seriesId={series.id} colourId={savedColour.id} label={`${savedColour.name} gallery`} initial={images.filter(i => i.colour_id === savedColour.id)} />
                  ) : (
                    <p className="text-[11px] text-amber-600 bg-amber-50 rounded px-2 py-1">Save the series to enable this colour’s image gallery.</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Variants ── */}
      <section className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5"><Package className="w-4 h-4 text-slate-400" /> BTU Variants</h3>
          <Button variant="outline" size="sm" onClick={addVariant} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add variant</Button>
        </div>
        {variants.length === 0 && <p className="text-xs text-slate-400">No variants yet. Add one per BTU size.</p>}
        <div className="space-y-2">
          {variants.map(v => {
            const isOpen = expanded === v._key
            return (
              <div key={v._key} className="rounded-lg border border-slate-200">
                {/* Summary row */}
                <div className="flex items-center gap-2 p-3 flex-wrap">
                  <input className={cn(smInput, 'w-24')} type="number" value={v.btu ?? ''} onChange={e => updateVariant(v._key, { btu: num(e.target.value) ?? undefined, cooling_btu: num(e.target.value) ?? undefined })} placeholder="BTU" />
                  <input className={cn(smInput, 'flex-1 min-w-28')} value={v.label ?? ''} onChange={e => updateVariant(v._key, { label: e.target.value })} placeholder="Label e.g. 12,000 BTU" />
                  <input className={cn(smInput, 'w-40')} value={v.sku ?? ''} onChange={e => updateVariant(v._key, { sku: e.target.value })} placeholder="SKU" />
                  {hasColours && (
                    <select className={cn(smInput, 'w-36')} value={v.colour_slug ?? ''} onChange={e => updateVariant(v._key, { colour_slug: e.target.value || null })}>
                      <option value="">All colours</option>
                      {colours.map(c => <option key={c._key} value={c.slug?.trim() || slugify(c.name)}>{c.name}</option>)}
                    </select>
                  )}
                  <input className={cn(smInput, 'w-28')} type="number" step="0.01" value={v.retail_price ?? ''} onChange={e => updateVariant(v._key, { retail_price: num(e.target.value) ?? undefined })} placeholder="Retail €" />
                  <button onClick={() => setExpanded(isOpen ? null : v._key)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                    <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  <button onClick={() => removeVariant(v._key)} className="text-red-400 hover:text-red-600 cursor-pointer p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
                {/* Details */}
                {isOpen && (
                  <div className="border-t border-slate-100 p-3 grid sm:grid-cols-3 gap-3">
                    <Field label="Indoor model"><input className={smInput} value={v.model_indoor ?? ''} onChange={e => updateVariant(v._key, { model_indoor: e.target.value })} /></Field>
                    <Field label="Outdoor model"><input className={smInput} value={v.model_outdoor ?? ''} onChange={e => updateVariant(v._key, { model_outdoor: e.target.value })} /></Field>
                    <Field label="Energy rating"><input className={smInput} value={v.energy_rating ?? ''} onChange={e => updateVariant(v._key, { energy_rating: e.target.value })} placeholder="A++" /></Field>
                    <Field label="Original / was €"><input className={smInput} type="number" step="0.01" value={v.original_price ?? ''} onChange={e => updateVariant(v._key, { original_price: num(e.target.value) ?? undefined })} /></Field>
                    <Field label="Trade price €"><input className={smInput} type="number" step="0.01" value={v.trade_price ?? ''} onChange={e => updateVariant(v._key, { trade_price: num(e.target.value) ?? undefined })} /></Field>
                    <Field label="Sale price €"><input className={smInput} type="number" step="0.01" value={v.sale_price ?? ''} onChange={e => updateVariant(v._key, { sale_price: num(e.target.value) ?? undefined })} /></Field>
                    <Field label="Heating BTU"><input className={smInput} type="number" value={v.heating_btu ?? ''} onChange={e => updateVariant(v._key, { heating_btu: num(e.target.value) ?? undefined })} /></Field>
                    <Field label="SEER"><input className={smInput} type="number" step="0.1" value={v.seer ?? ''} onChange={e => updateVariant(v._key, { seer: num(e.target.value) ?? undefined })} /></Field>
                    <Field label="SCOP"><input className={smInput} type="number" step="0.1" value={v.scop ?? ''} onChange={e => updateVariant(v._key, { scop: num(e.target.value) ?? undefined })} /></Field>
                    <Field label="Indoor dims (WxHxD)"><input className={smInput} value={v.dimensions_indoor ?? ''} onChange={e => updateVariant(v._key, { dimensions_indoor: e.target.value })} /></Field>
                    <Field label="Outdoor dims (WxHxD)"><input className={smInput} value={v.dimensions_outdoor ?? ''} onChange={e => updateVariant(v._key, { dimensions_outdoor: e.target.value })} /></Field>
                    <Field label="Refrigerant"><input className={smInput} value={v.refrigerant ?? ''} onChange={e => updateVariant(v._key, { refrigerant: e.target.value })} placeholder="R-32" /></Field>
                    <Field label="Copper gas (G)"><input className={smInput} value={v.copper_gas ?? ''} onChange={e => updateVariant(v._key, { copper_gas: e.target.value })} placeholder='3/8"' /></Field>
                    <Field label="Copper liquid (L)"><input className={smInput} value={v.copper_liquid ?? ''} onChange={e => updateVariant(v._key, { copper_liquid: e.target.value })} placeholder='1/4"' /></Field>
                    <Field label="Availability">
                      <select className={smInput} value={v.availability ?? 'in_stock'} onChange={e => updateVariant(v._key, { availability: e.target.value as ProductVariant['availability'] })}>
                        <option value="in_stock">In stock</option>
                        <option value="on_order">On order</option>
                        <option value="out_of_stock">Out of stock</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </Field>
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer self-end">
                      <input type="checkbox" checked={v.is_active ?? true} onChange={e => updateVariant(v._key, { is_active: e.target.checked })} /> Active
                    </label>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── SEO ── */}
      <section className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">SEO</h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">SEO title</label>
          <input className={inputCls} value={seoTitle} onChange={e => setSeoTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">SEO description</label>
          <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" value={seoDesc} onChange={e => setSeoDesc(e.target.value)} />
        </div>
      </section>

      {/* ── Sticky save bar ── */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-56 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 flex items-center justify-end gap-2 z-30">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/series')}>Cancel</Button>
        <Button variant="brand" size="sm" onClick={save} disabled={saving} className="gap-1.5">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Changes
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-slate-500">{label}</label>
      {children}
    </div>
  )
}
