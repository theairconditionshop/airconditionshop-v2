import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { getBlogPosts } from '@/lib/data/queries'
import { format } from 'date-fns'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import PageHeader from '@/components/shared/page-header'
import { Stagger, StaggerItem } from '@/components/motion/primitives'

export const revalidate = 600
export const metadata: Metadata = {
  title: 'Blog — HVAC Tips & Guides',
  description: 'Expert advice on air conditioning, refrigeration, maintenance and buying guides from THE AIRCONDITION SHOP.',
  alternates: { canonical: 'https://www.theairconditionshop.com/blog' },
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <PageHeader eyebrow="Knowledge Base" title="HVAC Tips & Guides" description="Expert advice on air conditioning, refrigeration and climate control." />
          <Stagger className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" gap={0.05}>
            {posts.map(post => (
              <StaggerItem key={post.id}>
                <Link href={`/blog/${post.slug}`}
                  className="group block h-full bg-white border border-slate-200 overflow-hidden hover:border-slate-900 transition-colors duration-300" style={{ borderRadius: 2 }}>
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
                    <h2 className="font-semibold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors duration-300">{post.title}</h2>
                    {post.excerpt && <p className="mt-2 text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>}
                    <p className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all duration-300">
                      Read more <ArrowRight className="w-3.5 h-3.5" />
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
          {!posts.length && (
            <div className="mt-16 text-center">
              <p className="text-slate-500 font-medium mb-2">Articles coming soon</p>
              <p className="text-slate-400 text-sm max-w-md mx-auto">We&apos;re working on practical guides for Malta homeowners — covering AC selection, energy savings, and maintenance. Follow us on Facebook for updates.</p>
              <a href="https://facebook.com/theairconditionshop" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Follow us on Facebook →</a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
