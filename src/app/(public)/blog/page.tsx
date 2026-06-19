import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { getBlogPosts } from '@/lib/data/queries'
import { format } from 'date-fns'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import PageHeader from '@/components/shared/page-header'

export const revalidate = 600
export const metadata: Metadata = { title: 'Blog — HVAC Tips & Guides', description: 'Expert advice on air conditioning, refrigeration, maintenance and buying guides from THE AIRCONDITION SHOP.' }

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <PageHeader eyebrow="Knowledge Base" title="HVAC Tips & Guides" description="Expert advice on air conditioning, refrigeration and climate control." />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-sky-200 hover:shadow-lg transition-all duration-300">
                {post.cover_url && (
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <Image src={post.cover_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy') : ''}
                  </div>
                  <h2 className="font-semibold text-slate-900 leading-tight group-hover:text-sky-700 transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>}
                  <p className="mt-3 flex items-center gap-1 text-sm font-medium text-sky-600 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
          {!posts.length && (
            <p className="mt-12 text-center text-slate-400">No articles published yet. Check back soon.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
