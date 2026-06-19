'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  title:       z.string().min(2),
  slug:        z.string().min(2),
  excerpt:     z.string().optional(),
  content:     z.string().min(10),
  is_published: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function BlogPostForm({ post }: { post?: Record<string, unknown> }) {
  const router = useRouter()
  const isEdit = !!post

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: isEdit ? {
      title:        post.title as string,
      slug:         post.slug as string,
      excerpt:      post.excerpt as string,
      content:      post.content as string,
      is_published: post.is_published as boolean,
    } : { is_published: false },
  })

  async function onSubmit(data: FormData) {
    const url    = isEdit ? `/api/admin/blog/${post!.id}` : '/api/admin/blog'
    const method = isEdit ? 'PUT' : 'POST'
    const payload = { ...data, published_at: data.is_published ? new Date().toISOString() : null }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      toast.success(isEdit ? 'Post updated' : 'Post created')
      router.push('/admin/blog')
      router.refresh()
    } else {
      toast.error('Save failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Title" {...register('title')} error={errors.title?.message} required />
          <Input label="Slug" {...register('slug')} error={errors.slug?.message} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Excerpt</label>
          <textarea {...register('excerpt')} rows={2}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            placeholder="Short summary shown on blog listing" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Content <span className="text-red-500">*</span></label>
          <textarea {...register('content')} rows={16}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
            placeholder="Supports HTML markup…" />
          {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register('is_published')}
            className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
          <span className="text-sm text-slate-700">Publish immediately</span>
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="brand" loading={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Post'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
