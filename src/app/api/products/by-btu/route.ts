import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const min = parseInt(searchParams.get('min') || '0')
  const max = parseInt(searchParams.get('max') || '999999')
  const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 8)

  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, brand:brands(name, slug), category:categories(name, slug), images:product_images(*)')
    .eq('is_active', true)
    .not('cooling_btu', 'is', null)
    .gte('cooling_btu', min)
    .lte('cooling_btu', max)
    .order('display_order')
    .limit(limit)

  return NextResponse.json(data || [])
}
