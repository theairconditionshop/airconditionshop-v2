import { NextResponse } from 'next/server'
import { getBrands } from '@/lib/data/queries'

export const revalidate = 300

export async function GET() {
  const brands = await getBrands()
  return NextResponse.json(brands)
}
