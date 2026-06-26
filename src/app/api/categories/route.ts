import { NextResponse } from 'next/server'
import { getCategoriesWithCount } from '@/lib/data/queries'

export const revalidate = 300

export async function GET() {
  const categories = await getCategoriesWithCount()
  // getCategoriesWithCount already filters to product_count > 0, sorted by count desc
  return NextResponse.json(categories.slice(0, 6))
}
