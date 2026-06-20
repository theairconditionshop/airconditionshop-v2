import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/data/queries'

export const revalidate = 300

export async function GET() {
  const categories = await getCategories(null)
  return NextResponse.json(categories)
}
