'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { Brand } from '@/types/database'

// White wordmarks on slate-950 dark background.
// Parent wrapper applies opacity-50 → opacity-95 on hover.
function BrandWordmark({ slug, name }: { slug: string; name: string }) {
  const s = slug.toLowerCase()
  const base: React.CSSProperties = { color: '#ffffff', fontFamily: 'Arial, sans-serif' }
  if (s.includes('daikin'))     return <span style={{ ...base, fontWeight: 900, fontSize: 17, letterSpacing: '0.14em', fontFamily: 'Arial Black, Arial, sans-serif' }}>DAIKIN</span>
  if (s.includes('mitsubishi')) return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Arial, sans-serif' }}>
      <span style={{ color: '#ffffff', fontSize: 11, letterSpacing: '-1px' }}>◆◆◆</span>
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: '#ffffff', lineHeight: 1.2, textTransform: 'uppercase' }}>Mitsubishi<br />Electric</span>
    </span>
  )
  if (s.includes('panasonic'))  return <span style={{ ...base, fontWeight: 700, fontSize: 15, letterSpacing: '0.04em' }}>Panasonic</span>
  if (s.includes('toshiba'))    return <span style={{ ...base, fontWeight: 800, fontSize: 16, letterSpacing: '0.12em', fontFamily: 'Arial Black, Arial, sans-serif' }}>TOSHIBA</span>
  if (s.includes('fujitsu'))    return <span style={{ ...base, fontWeight: 700, fontSize: 16, letterSpacing: '0.06em' }}>Fujitsu</span>
  if (s.includes('gree'))       return <span style={{ ...base, fontWeight: 900, fontSize: 18, letterSpacing: '0.18em', fontFamily: 'Arial Black, Arial, sans-serif' }}>GREE</span>
  return <span style={{ ...base, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{name}</span>
}

export default function BrandShowcase({ brands }: { brands: Brand[] }) {
  if (!brands.length) return null

  return (
    <section className="py-5 lg:py-7 bg-slate-950 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.28em]">
            Products From Leading Manufacturers
          </p>
        </motion.div>

        {/* Brand row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="group relative flex items-center justify-center h-16 px-7 sm:px-9 rounded-xl border border-white/[0.07] hover:border-white/[0.22] bg-white/[0.01] hover:bg-white/[0.05] transition-all duration-300 ease-out cursor-pointer overflow-hidden"
              >
                {/* Shimmer on hover */}
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-in-out" />

                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={110}
                    height={44}
                    className="object-contain max-h-9 w-auto grayscale group-hover:grayscale-0 opacity-30 group-hover:opacity-95 transition-all duration-[350ms]"
                  />
                ) : (
                  <div className="opacity-50 group-hover:opacity-95 transition-opacity duration-300">
                    <BrandWordmark slug={brand.slug} name={brand.name} />
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Certification strip */}
        <motion.div
          className="mt-6 pt-5 border-t border-white/[0.05] flex flex-wrap justify-center gap-x-8 gap-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {['All installations by certified engineers', 'Malta VAT registered', 'F-Gas certified'].map(text => (
            <span key={text} className="inline-flex items-center gap-1.5 text-xs text-slate-600 tracking-wide">
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
