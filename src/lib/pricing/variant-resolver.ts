import type { ProductVariant, ProductSeries, UserRole } from '@/types/database'
import type { PriceResult } from './resolver'

/**
 * Series-level price gating. A series is trade-only when its
 * price_visibility is 'trade_only' and the user is not trade/admin.
 */
export function shouldHideSeriesPrice(series: Pick<ProductSeries, 'price_visibility'>, role: UserRole | null): boolean {
  const isTradeUser = role === 'trade' || role === 'admin' || role === 'super_admin'
  if (isTradeUser) return false
  return series.price_visibility === 'trade_only'
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Variant pricing.
 *
 * For AC variants the price-list distinguishes:
 *   retail_price   = the actual SELLING price (what the customer pays)
 *   original_price = the higher "asking"/RRP price (shown struck-through)
 *   sale_price     = an optional promotional price below retail
 *
 * This differs from the flat-product resolver (where original_price is the
 * sell price), so variant pricing is resolved explicitly here.
 */
export function resolveVariantPrice(variant: ProductVariant, role: UserRole | null): PriceResult {
  const isTradeUser = role === 'trade' || role === 'admin' || role === 'super_admin'
  const sell = variant.retail_price ?? variant.original_price
  const asking = variant.original_price

  if (isTradeUser) {
    if (variant.trade_price_mode === 'fixed' && variant.trade_price != null) {
      return { price: variant.trade_price, label: 'Trade Price', isTrade: true, originalPrice: null, savingsAmount: null, saleDiscountPct: null }
    }
    if (variant.trade_price_mode === 'discount' && variant.trade_discount_pct != null && sell != null) {
      return { price: round2(sell * (1 - variant.trade_discount_pct / 100)), label: 'Trade Price', isTrade: true, discountPct: variant.trade_discount_pct, originalPrice: null, savingsAmount: null, saleDiscountPct: null }
    }
    if (sell != null) {
      return { price: sell, label: 'Trade Price', isTrade: true, originalPrice: null, savingsAmount: null, saleDiscountPct: null }
    }
  }

  // Promotional sale below the selling price
  if (variant.sale_price != null && sell != null && variant.sale_price < sell) {
    const savings = round2(sell - variant.sale_price)
    const pct = sell > 0 ? Math.round((savings / sell) * 100) : null
    return { price: variant.sale_price, label: 'Sale Price', isTrade: false, originalPrice: sell, savingsAmount: savings, saleDiscountPct: pct }
  }

  // Normal display: selling price, with the higher asking/RRP struck through
  const showAsking = asking != null && sell != null && asking > sell
  return {
    price: sell,
    label: 'Price',
    isTrade: false,
    originalPrice: showAsking ? asking : null,
    savingsAmount: showAsking ? round2(asking - sell) : null,
    saleDiscountPct: null,
  }
}

/**
 * Given a selected colour + BTU, find the matching variant.
 * Falls back to colour-agnostic variants (colour_id === null) which is how
 * single-SKU-per-BTU series (e.g. GREE Fairy) share one price across colours.
 */
export function findVariant(
  variants: ProductVariant[],
  btu: number | null,
  colourId: string | null,
): ProductVariant | null {
  if (btu == null) return null
  // Prefer an exact colour match, then a colour-agnostic variant.
  const exact = variants.find(v => v.btu === btu && v.colour_id === colourId)
  if (exact) return exact
  const shared = variants.find(v => v.btu === btu && v.colour_id == null)
  return shared ?? null
}
