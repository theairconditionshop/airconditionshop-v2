'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ImageUploadField from '@/components/admin/image-upload-field'

const schema = z.object({
  name:          z.string().min(2),
  slug:          z.string().min(2),
  description:   z.string().optional(),
  display_order: z.coerce.number().optional(),
  is_active:     z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function CategoryForm({ category }: { category?: Record<string, unknown> }) {
  const router = useRouter()
  const isEdit = !!category
  const [imageUrl, setImageUrl] = useState<string | null>(
    (category?.image_url as string) || null
  )

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: isEdit ? {
      name:          category.name as string,
      slug:          category.slug as string,
      description:   category.description as string,
      display_order: category.display_order as number,
      is_active:     (category.is_active as boolean) ?? true,
    } : { is_active: true },
  })

  async function onSubmit(data: FormData) {
    const url    = isEdit ? `/api/admin/categories/${category!.id}` : '/api/admin/categories'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, image_url: imageUrl ?? '' }),
    })
    if (res.ok) {
      toast.success(isEdit ? 'Category updated' : 'Category created')
      router.push('/admin/categories')
      router.refresh()
    } else {
      toast.error('Save failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Name" {...register('name')} error={errors.name?.message} required />
        <Input label="Slug" {...register('slug')} error={errors.slug?.message} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea {...register('description')} rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
      </div>
      <Input label="Display order" type="number" {...register('display_order')} />

      <ImageUploadField
        label="Category Image"
        hint="Displayed on the homepage category grid and category pages. Recommended: 800×600px."
        aspectRatio="4 / 3"
        value={imageUrl}
        onChange={setImageUrl}
      />

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
