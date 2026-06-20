'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  name:               z.string().min(2),
  slug:               z.string().min(2),
  sku:                z.string().optional(),
  description:        z.string().optional(),
  retail_price:       z.coerce.number().optional(),
  category_id:        z.string().optional(),
  brand_id:           z.string().optional(),
  availability:       z.enum(['in_stock', 'out_of_stock', 'on_order', 'discontinued']).default('in_stock'),
  trade_price_mode:   z.enum(['fixed', 'discount']).optional(),
  trade_price:        z.coerce.number().optional(),
  trade_discount_pct: z.coerce.number().optional(),
  is_active:          z.boolean().optional(),
  is_featured:        z.boolean().optional(),
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

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: isEdit ? {
      name:               product.name as string,
      slug:               product.slug as string,
      sku:                product.sku as string,
      description:        product.description as string,
      retail_price:       product.retail_price as number,
      category_id:        product.category_id as string,
      brand_id:           product.brand_id as string,
      availability:       (product.availability as 'in_stock' | 'out_of_stock' | 'on_order' | 'discontinued') ?? 'in_stock',
      trade_price_mode:   product.trade_price_mode as 'fixed' | 'discount',
      trade_price:        product.trade_price as number,
      trade_discount_pct: product.trade_discount_pct as number,
      is_active:          product.is_active as boolean ?? true,
      is_featured:        product.is_featured as boolean ?? false,
    } : { is_active: true, is_featured: false, availability: 'in_stock' },
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
      toast.success(isEdit ? 'Product updated' : 'Product created')
      router.push('/admin/products')
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
          <Input label="Product name" {...register('name')} error={errors.name?.message} required />
          <Input label="Slug" {...register('slug')} error={errors.slug?.message} required hint="URL-friendly identifier" />
        </div>
        <Input label="SKU" {...register('sku')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea {...register('description')} rows={5}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">Categorisation</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select {...register('category_id')}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Brand</label>
            <select {...register('brand_id')}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">— None —</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Availability</label>
          <select {...register('availability')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="on_order">On Order</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">Pricing</h3>
        <Input label="Retail price (€)" type="number" step="0.01" {...register('retail_price')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Trade pricing mode</label>
          <select {...register('trade_price_mode')}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">— No trade price —</option>
            <option value="fixed">Fixed trade price</option>
            <option value="discount">Discount percentage</option>
          </select>
        </div>
        {tradeMode === 'fixed' && (
          <Input label="Trade price (€)" type="number" step="0.01" {...register('trade_price')} />
        )}
        {tradeMode === 'discount' && (
          <Input label="Trade discount (%)" type="number" step="0.1" {...register('trade_discount_pct')} hint="e.g. 15 = 15% off retail" />
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-3">
        <h3 className="font-semibold text-slate-900 text-sm">Visibility</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register('is_active')}
            className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
          <span className="text-sm text-slate-700">Active (visible on website)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register('is_featured')}
            className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
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
