'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

const schema = z.object({
  name:               z.string().min(2),
  slug:               z.string().min(2),
  description:        z.string().optional(),
  country_of_origin:  z.string().optional(),
  logo_url:           z.string().optional(),
  display_order:      z.coerce.number().optional(),
  is_active:          z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function BrandForm({ brand }: { brand?: Record<string, unknown> }) {
  const router = useRouter()
  const isEdit = !!brand
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string>((brand?.logo_url as string) || '')
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: isEdit ? {
      name:              brand.name as string,
      slug:              brand.slug as string,
      description:       brand.description as string,
      country_of_origin: brand.country_of_origin as string,
      logo_url:          brand.logo_url as string,
      display_order:     brand.display_order as number,
      is_active:         (brand.is_active as boolean) ?? true,
    } : { is_active: true },
  })

  const logoUrl = watch('logo_url')

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', file)

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      const uploaded = data.results?.[0]
      if (!uploaded?.url) throw new Error('Upload failed')
      const url = uploaded.url
      setValue('logo_url', url)
      setLogoPreview(url)
      toast.success('Logo uploaded')
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeLogo() {
    setValue('logo_url', '')
    setLogoPreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function onSubmit(data: FormData) {
    const url    = isEdit ? `/api/admin/brands/${brand!.id}` : '/api/admin/brands'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success(isEdit ? 'Brand updated' : 'Brand created')
      router.push('/admin/brands')
      router.refresh()
    } else {
      toast.error('Save failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Brand name" {...register('name')} error={errors.name?.message} required />
        <Input label="Slug" {...register('slug')} error={errors.slug?.message} required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Country of origin" {...register('country_of_origin')} placeholder="Japan" />
        <Input label="Display order" type="number" {...register('display_order')} />
      </div>

      {/* Logo upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Brand Logo</label>
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div className="flex-none w-24 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative">
            {logoPreview ? (
              <>
                <Image src={logoPreview} alt="Logo preview" fill className="object-contain p-2" />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Remove logo"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <ImageIcon aria-hidden="true" className="w-6 h-6 text-slate-300" />
            )}
          </div>

          {/* Upload button */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-file-input"
            />
            <label htmlFor="logo-file-input">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 cursor-pointer"
                loading={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload aria-hidden="true" className="w-4 h-4" />
                {uploading ? 'Uploading…' : 'Upload Logo'}
              </Button>
            </label>
            <p className="mt-1.5 text-xs text-slate-400">PNG, SVG or WebP recommended. Max 5MB.</p>
            {/* Hidden input to hold URL value */}
            <input type="hidden" {...register('logo_url')} />
            {logoUrl && !logoPreview && (
              <p className="mt-1 text-xs text-slate-500 truncate">{logoUrl}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea {...register('description')} rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" {...register('is_active')}
          className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
        <span className="text-sm text-slate-700">Active</span>
      </label>
      <div className="flex gap-3">
        <Button type="submit" variant="brand" loading={isSubmitting}>
          {isEdit ? 'Save' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
