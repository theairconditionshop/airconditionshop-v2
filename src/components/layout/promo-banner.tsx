import { X } from 'lucide-react'

interface PromoBannerData {
  text?:         string
  cta_label?:    string
  cta_href?:     string
  bg_color?:     string
  is_active?:    boolean
}

export default function PromoBanner({ data }: { data: PromoBannerData }) {
  if (!data.is_active || !data.text?.trim()) return null

  const bgColor = data.bg_color || '#2563EB'

  return (
    <div
      className="relative z-50 w-full py-2.5 px-4"
      style={{ backgroundColor: bgColor }}
      role="banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium text-white leading-snug">
          {data.text}
          {data.cta_href && data.cta_label && (
            <>
              {' '}
              <a
                href={data.cta_href}
                className="underline underline-offset-2 font-semibold hover:no-underline transition-all whitespace-nowrap"
              >
                {data.cta_label} →
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
