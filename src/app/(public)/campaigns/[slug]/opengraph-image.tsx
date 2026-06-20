import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export const alt = 'Campaign | The AirCondition Shop'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('title, campaign_type, hero_image, prize')
    .eq('slug', params.slug)
    .single()

  const title = campaign?.title ?? 'Campaign'
  const campaignType = campaign?.campaign_type
    ? campaign.campaign_type.replace(/_/g, ' ').toUpperCase()
    : 'CAMPAIGN'
  const prize = campaign?.prize ?? null
  const heroImage = campaign?.hero_image ?? null

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: heroImage
            ? 'transparent'
            : 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        }}
      >
        {/* Background hero image */}
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Bottom gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.05) 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 64px',
            width: '100%',
            gap: '12px',
          }}
        >
          {/* Campaign type label */}
          <span
            style={{
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#38bdf8',
            }}
          >
            {campaignType}
          </span>

          {/* Campaign title */}
          <span
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              maxWidth: '900px',
            }}
          >
            {title}
          </span>

          {/* Prize */}
          {prize && (
            <span
              style={{
                fontSize: '22px',
                fontWeight: 500,
                color: '#fde68a',
                marginTop: '4px',
              }}
            >
              Prize: {prize}
            </span>
          )}

          {/* Bottom branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '20px',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: '16px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.02em',
              }}
            >
              The AirCondition Shop
            </span>
            <span
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              theairconditionshop.com
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
