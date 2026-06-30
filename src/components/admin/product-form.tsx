'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AC_TYPES } from '@/lib/ac-types'
import { PRODUCT_TYPES } from '@/services/ai/gemini-product-parser'

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const schema = z.object({
  name:               z.string().min(2),
  slug:               z.string().min(2).regex(SLUG_REGEX, 'Slug must be lowercase letters, numbers and hyphens only — no spaces'),
  sku:                z.string().optional(),
  description:        z.string().optional(),
  original_price:     z.coerce.number().optional(),
  sale_price:         z.coerce.number().optional(),
  category_id:        z.string().optional(),
  brand_id:           z.string().optional(),
  ac_type:            z.string().optional(),
  product_type:       z.string().optional(),
  price_visibility:   z.enum(['public', 'trade_only']).default('public'),
  availability:       z.enum(['in_stock', 'out_of_stock', 'on_order', 'discontinued']).default('in_stock'),
  trade_price_mode:   z.enum(['fixed', 'discount']).optional(),
  trade_price:        z.coerce.number().optional(),
  trade_discount_pct: z.coerce.number().optional(),
  is_active:          z.boolean().optional(),
  is_featured:        z.boolean().optional(),
  // HVAC technical fields
  cooling_btu:        z.coerce.number().optional(),
  heating_btu:        z.coerce.number().optional(),
  room_size_min:      z.coerce.number().optional(),
  room_size_max:      z.coerce.number().optional(),
  energy_rating:      z.string().optional(),
  seer:               z.coerce.number().optional(),
  scop:               z.coerce.number().optional(),
  wifi_enabled:       z.boolean().optional(),
  refrigerant:        z.string().optional(),
  indoor_noise_db:    z.coerce.number().optional(),
  outdoor_noise_db:   z.coerce.number().optional(),
  voltage:            z.coerce.number().optional(),
  warranty_years:     z.coerce.number().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  product?: Record<string, unknown>
  categories: { id: string; name: string }[]
  brands: { id: string; name: string }[]
}

export default function ProductForm({ product, categories, brands }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: isEdit ? {
      name:               product.name as string,
      slug:               product.slug as string,
      sku:                product.sku as string,
      description:        product.description as string,
      original_price:     product.original_price as number,
      sale_price:         product.sale_price as number,
      category_id:        product.category_id as string,
      brand_id:           product.brand_id as string,
      ac_type:            product.ac_type as string,
      product_type:       product.product_type as string,
      price_visibility:   (product.price_visibility as 'public' | 'trade_only') ?? 'public',
      availability:       (product.availability as 'in_stock' | 'out_of_stock' | 'on_order' | 'discontinued') ?? 'in_stock',
      trade_price_mode:   product.trade_price_mode as 'fixed' | 'discount',
      trade_price:        product.trade_price as number,
      trade_discount_pct: product.trade_discount_pct as number,
      is_active:          product.is_active as boolean ?? true,
      is_featured:        product.is_featured as boolean ?? false,
      cooling_btu:        product.cooling_btu as number,
      heating_btu:        product.heating_btu as number,
      room_size_min:      product.room_size_min as number,
      room_size_max:      product.room_size_max as number,
      energy_rating:      product.energy_rating as string,
      seer:               product.seer as number,
      scop:               product.scop as number,
      wifi_enabled:       product.wifi_enabled as boolean ?? false,
      refrigerant:        product.refrigerant as string,
      indoor_noise_db:    product.indoor_noise_db as number,
      outdoor_noise_db:   product.outdoor_noise_db as number,
      voltage:            product.voltage as number ?? 230,
      warranty_years:     product.warranty_years as number ?? 2,
    } : { is_active: true, is_featured: false, availability: 'in_stock', wifi_enabled: false, voltage: 230, warranty_years: 2 },
  })

  const tradeMode = watch('trade_price_mode')

  async function onSubmit(data: FormData) {
    const url    = isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products'
    const method = isEdit ? 'PUT' : 'POST'
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success(isEdit ? 'Product updated' : 'Product created — add images below')
      if (!isEdit) {
        const { id } = await res.json()
        router.push(`/admin/products/${id}/edit`)
      } else {
        router.push('/admin/products')
      }
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Save failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">Basic Info</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Product name"
            {...register('name')}
            error={errors.name?.message}
            required
            onChange={e => {
              register('name').onChange(e)
              if (!isEdit) setValue('slug', slugify(e.target.value), { shouldValidate: true })
            }}
          />
          <Input
            label="Slug"
            {...register('slug')}
            error={errors.slug?.message}
            required
            hint="lowercase, hyphens only — auto-filled from name"
          />
        </div>
        <Input label="SKU" {...register('sku')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea {...register('description')} rows={5}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">Categorisation</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select {...register('category_id')}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Brand</label>
            <select {...register('brand_id')}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— None —</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">AC Type</label>
          <select {...register('ac_type')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Not an AC unit —</option>
            {AC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <p className="text-[11px] text-slate-400">Select to enable AC Type filtering and the installation offer block</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Product Type</label>
          <select {...register('product_type')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Select type —</option>
            {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <p className="text-[11px] text-slate-400">Used for import classification and filtering</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Price Visibility</label>
          <select {...register('price_visibility')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="public">Public Pricing — visible to everyone</option>
            <option value="trade_only">Trade Only — prices hidden from public</option>
          </select>
          <p className="text-[11px] text-slate-400">
            Trade Only hides price and buy buttons for non-logged-in visitors. Product remains fully public and indexable.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Availability</label>
          <select {...register('availability')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="on_order">On Order</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">Pricing</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Original price / RRP (€)" type="number" step="0.01" {...register('original_price')} hint="Regular price — shown struck-through when on sale" />
          <Input label="Sale price (€)" type="number" step="0.01" {...register('sale_price')} hint="Discounted price shown in green — leave blank for no sale" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Trade pricing mode</label>
          <select {...register('trade_price_mode')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— No trade price —</option>
            <option value="fixed">Fixed trade price</option>
            <option value="discount">Discount percentage</option>
          </select>
        </div>
        {tradeMode === 'fixed' && (
          <Input label="Trade price (€)" type="number" step="0.01" {...register('trade_price')} />
        )}
        {tradeMode === 'discount' && (
          <Input label="Trade discount (%)" type="number" step="0.1" {...register('trade_discount_pct')} hint="e.g. 15 = 15% off original price" />
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">HVAC Technical Specifications</h3>
        <p className="text-xs text-slate-500">Fill in cooling BTU to enable BTU calculator product matching.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Cooling BTU" type="number" {...register('cooling_btu')} placeholder="9000" hint="Used for BTU calculator matching" />
          <Input label="Heating BTU" type="number" {...register('heating_btu')} placeholder="10000" />
          <Input label="Room size min (m²)" type="number" step="0.5" {...register('room_size_min')} placeholder="15" />
          <Input label="Room size max (m²)" type="number" step="0.5" {...register('room_size_max')} placeholder="25" />
          <Input label="Energy rating" {...register('energy_rating')} placeholder="A+++" />
          <Input label="SEER" type="number" step="0.1" {...register('seer')} placeholder="8.5" />
          <Input label="SCOP" type="number" step="0.1" {...register('scop')} placeholder="4.0" />
          <Input label="Refrigerant" {...register('refrigerant')} placeholder="R-32" />
          <Input label="Indoor noise (dB)" type="number" {...register('indoor_noise_db')} placeholder="20" />
          <Input label="Outdoor noise (dB)" type="number" {...register('outdoor_noise_db')} placeholder="48" />
          <Input label="Voltage (V)" type="number" {...register('voltage')} placeholder="230" />
          <Input label="Warranty (years)" type="number" {...register('warranty_years')} placeholder="5" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register('wifi_enabled')}
            className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Wi-Fi enabled</span>
        </label>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-3">
        <h3 className="font-semibold text-slate-900 text-sm">Visibility</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register('is_active')}
            className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Active (visible on website)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register('is_featured')}
            className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-blue-500" />
          <span className="text-sm text-slate-700">Featured on homepage</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="brand" loading={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
