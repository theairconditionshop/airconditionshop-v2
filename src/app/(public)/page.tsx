import type { Metadata } from 'next'
import { getCachedHomepageData } from '@/lib/data/homepage-cache'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Hero from '@/components/sections/hero'
import BrandMarquee from '@/components/sections/brand-marquee'
import ProductCategories from '@/components/sections/product-categories'
import FeaturedProducts from '@/components/sections/featured-products'
import WhyChooseUs from '@/components/sections/why-choose-us'
import TradeCta from '@/components/sections/trade-cta'
import ServicesSection from '@/components/sections/services-section'
import TestimonialsSection from '@/components/sections/testimonials-section'
import FaqSection from '@/components/sections/faq-section'
import CtaSection from '@/components/sections/cta-section'
import BtuPromo from '@/components/sections/btu-promo'
import { LocalBusinessJsonLd } from '@/components/shared/json-ld'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'THE AIRCONDITION SHOP | Premium HVAC & Refrigeration Malta',
  description: 'Premium HVAC, refrigeration, ventilation and installation materials supplier in Malta. Expert installation and service across Malta.',
  alternates: { canonical: 'https://www.theairconditionshop.com' },
}

export default async function HomePage() {
  const { sections, brands, categories, products, testimonials, faqs } = await getCachedHomepageData()

  return (
    <>
      <LocalBusinessJsonLd />
      <Navbar transparent />
      <main>
        <Hero data={sections.hero || {}} />
        <BtuPromo data={sections.btu_promo as Record<string, string> || {}} />
        <BrandMarquee brands={brands} duration={32} />
        <ProductCategories categories={categories} />
        <FeaturedProducts products={products} userRole={null} />
        <WhyChooseUs data={sections.why_choose_us || {}} />
        <TradeCta data={sections.trade_cta as Record<string, string> || {}} />
        <ServicesSection data={sections.services || {}} />
        <TestimonialsSection testimonials={testimonials} />
        <FaqSection faqs={faqs} />
        <CtaSection data={sections.cta || {}} />
      </main>
      <Footer />
    </>
  )
}
