import type { Metadata } from 'next'
import { getAllHomepageSections, getBrands, getCategories, getProducts, getTestimonials, getFaqs } from '@/lib/data/queries'
import { getRole } from '@/lib/auth/session'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Hero from '@/components/sections/hero'
import BrandShowcase from '@/components/sections/brand-showcase'
import ProductCategories from '@/components/sections/product-categories'
import FeaturedProducts from '@/components/sections/featured-products'
import WhyChooseUs from '@/components/sections/why-choose-us'
import ServicesSection from '@/components/sections/services-section'
import TestimonialsSection from '@/components/sections/testimonials-section'
import FaqSection from '@/components/sections/faq-section'
import CtaSection from '@/components/sections/cta-section'
import { LocalBusinessJsonLd } from '@/components/shared/json-ld'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'THE AIRCONDITION SHOP | Premium HVAC & Refrigeration Malta',
  description: 'Malta\'s premier HVAC and refrigeration specialists. Authorised dealers for Daikin, Mitsubishi Electric, Panasonic and more. Expert installation across Malta.',
}

export default async function HomePage() {
  const [sections, brands, categories, featuredProducts, testimonials, faqs, userRole] = await Promise.all([
    getAllHomepageSections(),
    getBrands(),
    getCategories(null),
    getProducts({ featured: true, limit: 8 }),
    getTestimonials(),
    getFaqs(),
    getRole(),
  ])

  return (
    <>
      <LocalBusinessJsonLd />
      <Navbar transparent />
      <main>
        <Hero data={sections.hero || {}} />
        <BrandShowcase brands={brands} />
        <ProductCategories categories={categories} />
        <FeaturedProducts products={featuredProducts} userRole={userRole} />
        <WhyChooseUs data={sections.why_choose_us || {}} />
        <ServicesSection data={sections.services || {}} />
        <TestimonialsSection testimonials={testimonials} />
        <FaqSection faqs={faqs} />
        <CtaSection data={sections.cta || {}} />
      </main>
      <Footer />
    </>
  )
}
