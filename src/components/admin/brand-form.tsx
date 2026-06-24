'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ImageUploadField from '@/components/admin/image-upload-field'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const schema = z.object({
  name:              z.string().min(2, 'Brand name must be at least 2 characters'),
  slug:              z.string().min(2, 'Slug must be at least 2 characters'),
  is_active:         z.boolean().optional(),
  description:       z.string().optional(),
  display_order:     z.coerce.number().int().min(0).optional(),
  logo_display_mode: z.enum(['invert', 'grayscale', 'normal']).optional(),
  seo_title:         z.string().max(200).optional(),
  seo_desc:          z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

export default function BrandForm({ brand }: { brand?: Record<string, unknown> }) {
  const router = useRouter()
  const isEdit = !!brand
  const [logoUrl, setLogoUrl]             = useState<string | null>((brand?.logo_url as string) || null)
  const [heroUrl, setHeroUrl]             = useState<string | null>((brand?.hero_url as string) || null)
  const [showOptional, setShowOptional]   = useState(isEdit && !!(brand?.description || brand?.hero_url))
  const [showAdvanced, setShowAdvanced]   = useState(isEdit)
  const slugManuallyEdited                = useRef(isEdit)

  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: isEdit ? {
      name:              brand.name as string,
      slug:              brand.slug as string,
      is_active:         (brand.is_active as boolean) ?? true,
      description:       (brand.description as string) ?? '',
      display_order:     brand.display_order as number,
      logo_display_mode: (brand.logo_display_mode as 'invert' | 'grayscale' | 'normal') ?? 'invert',
      seo_title:         (brand.seo_title as string) ?? '',
      seo_desc:          (brand.seo_desc as string) ?? '',
    } : { is_active: true, logo_display_mode: 'invert' },
  })

  const nameValue = useWatch({ control, name: 'name' })

  useEffect(() => {
    if (!nameValue || slugManuallyEdited.current) return
    setValue('slug', toSlug(nameValue), { shouldValidate: true })
  }, [nameValue, setValue])

  const slugRegProps = register('slug', {
    onChange: () => { slugManuallyEdited.current = true },
  })

  async function onSubmit(data: FormData) {
    const autoTitle = `${data.name} Products Malta | THE AIRCONDITION SHOP`
    const autoDesc  = `Explore ${data.name} products available from THE AIRCONDITION SHOP Malta.`
    const payload = {
      name:              data.name,
      slug:              data.slug,
      is_active:         data.is_active ?? true,
      description:       data.description?.trim() || null,
      display_order:     data.display_order,
      logo_url:          logoUrl,
      hero_url:          heroUrl,
      logo_display_mode: data.logo_display_mode ?? 'invert',
      seo_title:         data.seo_title?.trim() || autoTitle,
      seo_desc:          data.seo_desc?.trim()  || autoDesc,
    }

    const url    = isEdit ? `/api/admin/brands/${brand!.id}` : '/api/admin/brands'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast.success(isEdit ? 'Brand updated' : 'Brand created')
      router.push('/admin/brands')
      router.refresh()
    } else {
      const json = await res.json().catch(() => null)
      toast.error(json?.error ? `Save failed: ${json.error}` : 'Save failed — please try again')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Required: Name + Logo + Active ── */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900">Brand Details</h2>
        <Input
          label="Brand Name"
          {...register('name')}
          error={errors.name?.message}
          required
          placeholder="e.g. Daikin"
        />
        <ImageUploadField
          label="Brand Logo"
          hint="SVG or PNG with transparent background recommended. Displayed on the brand strip and brand pages."
          aspectRatio="3 / 2"
          value={logoUrl}
          onChange={setLogoUrl}
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('is_active')}
            className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span className="text-sm text-slate-700">
            Active{' '}
            <span className="text-slate-400">(visible to customers on website)</span>
          </span>
        </label>
      </div>

      {/* ── Optional: Description + Hero Image ── */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowOptional(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span>
            Description &amp; Hero Image{' '}
            <span className="text-slate-400 font-normal">(optional)</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showOptional ? 'rotate-180' : ''}`} />
        </button>
        {showOptional && (
          <div className="px-6 pb-6 border-t border-slate-50 space-y-5 pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Short description of the brand shown on its page. Leave blank to omit."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>
            <ImageUploadField
              label="Hero Image"
              hint="Wide banner image for the brand detail page. Leave blank to show logo only."
              aspectRatio="16 / 5"
              value={heroUrl}
              onChange={setHeroUrl}
            />
          </div>
        )}
      </div>

      {/* ── Advanced Settings ── */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span>Advanced Settings</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
        {showAdvanced && (
          <div className="px-6 pb-6 border-t border-slate-50 space-y-5 pt-5">

            <div className="space-y-1">
              <Input
                label="Slug"
                {...slugRegProps}
                error={errors.slug?.message}
                required
                placeholder="auto-generated-from-name"
              />
              <p className="text-[11px] text-slate-400">
                Auto-generated from brand name. Used in the URL:{' '}
                <span className="font-mono">/brands/<em>slug</em></span>
              </p>
            </div>

            <div className="space-y-1">
              <Input
                label="Display Order"
                type="number"
                min={0}
                {...register('display_order')}
                placeholder="0"
              />
              <p className="text-[11px] text-slate-400">
                Lower numbers appear first in brand listings. Leave blank to append to the end.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Logo Display Mode</label>
              <select
                {...register('logo_display_mode')}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="invert">Invert (white on dark background)</option>
                <option value="grayscale">Grayscale → colour on hover</option>
                <option value="normal">Normal (show logo as-is)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Controls how the logo appears in the homepage brand strip (dark background). Use <strong>Invert</strong> for logos with dark fills.
              </p>
            </div>

            <div className="space-y-1">
              <Input
                label="SEO Title Override"
                {...register('seo_title')}
                placeholder={
                  nameValue
                    ? `${nameValue} Products Malta | THE AIRCONDITION SHOP`
                    : 'Auto-generated from brand name'
                }
              />
              <p className="text-[11px] text-slate-400">Leave blank to auto-generate from brand name.</p>
            </div>

            <div className="space-y-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Meta Description Override</label>
                <textarea
                  {...register('seo_desc')}
                  rows={2}
                  placeholder={
                    nameValue
                      ? `Explore ${nameValue} products available from THE AIRCONDITION SHOP Malta.`
                      : 'Auto-generated from brand name'
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">Leave blank to auto-generate from brand name.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="brand" loading={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Brand'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
