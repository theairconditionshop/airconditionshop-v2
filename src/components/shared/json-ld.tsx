import { getSiteSettings } from '@/lib/data/queries'
import { safeJsonLd } from '@/lib/sanitize'

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

// LocalBusiness JSON-LD — reads from site_settings, no hardcoded values
export async function LocalBusinessJsonLd() {
  const settings = await getSiteSettings()

  const phone        = str(settings.company_phone)
  const email        = str(settings.company_email)
  const address      = str(settings.company_address)
  const facebook     = str(settings.social_facebook)
  const instagram    = str(settings.social_instagram)
  const googleReview = str(settings.google_review_url)
  const vatNumber    = str(settings.vat_number)
  const weekday      = str(settings.company_hours_weekday)
  const saturday     = str(settings.company_hours_saturday)

  const sameAs = [facebook, instagram, googleReview].filter(Boolean)

  const opens8  = weekday.split('–')[0]?.trim()  || '08:00'
  const closes18 = weekday.split('–')[1]?.trim() || '18:00'
  const opens8s  = saturday.split('–')[0]?.trim() || '08:00'
  const closes14 = saturday.split('–')[1]?.trim() || '14:00'

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'THE AIRCONDITION SHOP',
    legalName: str(settings.legal_name) || 'AS GROUP',
    url: 'https://theairconditionshop.com',
    telephone: phone,
    email: email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '220 Vjal L-Indipendenza',
      addressLocality: 'Mosta',
      postalCode: 'MST 9022',
      addressCountry: 'MT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.9075,
      longitude: 14.4257,
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: opens8, closes: closes18 },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: opens8s, closes: closes14 },
    ],
  }

  if (vatNumber) data.taxID = vatNumber
  if (sameAs.length) data.sameAs = sameAs

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  )
}

// Product JSON-LD
interface ProductJsonLdProps {
  name: string
  description?: string
  image?: string
  price?: number
  currency?: string
  sku?: string
  brand?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  url: string
}

export function ProductJsonLd({ name, description, image, price, currency = 'EUR', sku, brand, availability = 'InStock', url }: ProductJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    url,
  }
  if (description) data.description = description
  if (image)       data.image = image
  if (sku)         data.sku = sku
  if (brand)       data.brand = { '@type': 'Brand', name: brand }
  if (price != null) {
    data.offers = {
      '@type': 'Offer',
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: `https://schema.org/${availability}`,
      seller: { '@type': 'Organization', name: 'THE AIRCONDITION SHOP' },
    }
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  )
}

// BreadcrumbList JSON-LD
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  )
}
