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
import { Reveal } from '@/components/motion/primitives'

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
    alternates: { canonical: `https://www.theairconditionshop.com/blog/${slug}` },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />

          {post.cover_url && (
            <Reveal mode="scale">
              <div className="relative aspect-video overflow-hidden mb-8 bg-slate-100 border border-slate-200">
                <Image src={post.cover_url} alt={post.title} fill className="object-cover" priority />
              </div>
            </Reveal>
          )}

          <Reveal mode="fade" className="flex items-center gap-4 text-sm text-slate-400 mb-6">
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
          </Reveal>

          <Reveal mode="blur" delay={0.05}>
            <h1 className="font-display text-3xl lg:text-4xl tracking-[-0.02em] text-slate-900 leading-tight mb-6">{post.title}</h1>
          </Reveal>

          {post.excerpt && (
            <Reveal mode="up" delay={0.1}>
              <p className="text-lg text-slate-500 leading-relaxed mb-8 border-l-2 border-blue-500 pl-4">{post.excerpt}</p>
            </Reveal>
          )}

          {post.content && (
            <Reveal mode="fade" delay={0.15}>
              <div
                className="prose prose-slate prose-sm lg:prose-base max-w-none
                  prose-headings:font-display prose-headings:tracking-[-0.02em] prose-headings:text-slate-900
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-img:border prose-img:border-slate-200"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
              />
            </Reveal>
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}
