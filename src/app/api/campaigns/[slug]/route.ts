import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .in('status', ['active', 'ended'])
    .single();

  if (error || !campaign) {
    return NextResponse.json(
      { error: 'Campaign not found' },
      { status: 404 }
    );
  }

  // Fire-and-forget: record a view event via admin client (bypasses RLS)
  const adminClient = createAdminClient();
  adminClient
    .from('campaign_analytics')
    .insert({
      campaign_id: campaign.id,
      event_type: 'view',
      occurred_at: new Date().toISOString(),
    })
    .then(({ error: analyticsError }) => {
      if (analyticsError) {
        console.error('[campaign analytics] insert failed:', analyticsError.message);
      }
    });

  return NextResponse.json({ campaign });
}
