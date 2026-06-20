import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const featuredOnly = searchParams.get('featured') === 'true';

  const supabase = await createClient();

  let query = supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('start_date', { ascending: true });

  if (featuredOnly) {
    query = query.eq('featured', true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }

  return NextResponse.json({ campaigns: data });
}
