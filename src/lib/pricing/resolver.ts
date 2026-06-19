import type { Product, UserRole } from '@/types/database'

export interface PriceResult {
  price: number | null
  label: string
  isTrade: boolean
  discountPct?: number
}

export function resolvePrice(product: Product, role: UserRole | null): PriceResult {
  const isTradeUser = role === 'trade' || role === 'admin' || role === 'super_admin'

  if (isTradeUser) {
    if (product.trade_price_mode === 'fixed' && product.trade_price != null) {
      return {
        price: product.trade_price,
        label: 'Trade Price',
        isTrade: true,
      }
    }

    if (
      product.trade_price_mode === 'discount' &&
      product.trade_discount_pct != null &&
      product.retail_price != null
    ) {
      const discounted = product.retail_price * (1 - product.trade_discount_pct / 100)
      return {
        price: Math.round(discounted * 100) / 100,
        label: `Trade Price`,
        isTrade: true,
        discountPct: product.trade_discount_pct,
      }
    }
  }

  return {
    price: product.retail_price,
    label: 'Price',
    isTrade: false,
  }
}

export function formatPrice(price: number | null, currency = 'EUR'): string {
  if (price == null) return 'Contact for price'
  return new Intl.NumberFormat('en-MT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price)
}
