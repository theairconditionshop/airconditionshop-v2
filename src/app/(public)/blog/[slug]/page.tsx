import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { getBlogPostBySlug } from '@/lib/data/queries'
import { sanitizeHtml } from '@/lib/sanitize'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Breadcrumb from '@/components/shared/breadcrumb'

export const revalidate = 600

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.seo_title || post.title,
    description: post.seo_desc || post.excerpt || undefined,
    openGraph: { images: post.cover_url ? [post.cover_url] : [] },
    alternates: { canonical: `https://theairconditionshop.com/blog/${slug}` },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />

          {post.cover_url && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 bg-slate-100">
              <Image src={post.cover_url} alt={post.title} fill className="object-cover" priority />
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.published_at), 'dd MMMM yyyy')}
              </span>
            )}
            {post.author?.full_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author.full_name}
              </span>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-6">{post.title}</h1>

          {post.excerpt && (
            <p className="text-lg text-slate-500 leading-relaxed mb-8 border-l-2 border-sky-200 pl-4">{post.excerpt}</p>
          )}

          {post.content && (
            <div
              className="prose prose-slate prose-sm lg:prose-base max-w-none
                prose-headings:font-bold prose-headings:text-slate-900
                prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}
