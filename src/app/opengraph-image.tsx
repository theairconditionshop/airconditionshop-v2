import { ImageResponse } from 'next/og'

export const alt = 'THE AIRCONDITION SHOP — HVAC & Refrigeration Malta'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top label */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            background: '#3b82f6',
            borderRadius: '6px',
            padding: '6px 16px',
            fontSize: '14px',
            fontWeight: '700',
            color: '#fff',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Malta&apos;s HVAC Specialists
          </div>
        </div>

        {/* Main heading */}
        <div style={{
          fontSize: '64px',
          fontWeight: '900',
          color: '#ffffff',
          lineHeight: '1.1',
          marginBottom: '24px',
          maxWidth: '800px',
        }}>
          THE AIRCONDITION SHOP
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: '26px',
          color: '#94a3b8',
          marginBottom: '48px',
          maxWidth: '700px',
          lineHeight: '1.4',
        }}>
          Premium HVAC &amp; Refrigeration — Daikin, Mitsubishi Electric, Panasonic &amp; more
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '18px', color: '#64748b' }}>Authorised Dealer</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '18px', color: '#64748b' }}>Expert Installation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '18px', color: '#64748b' }}>Malta Wide</span>
          </div>
        </div>

        {/* Website */}
        <div style={{
          position: 'absolute',
          bottom: '48px',
          right: '80px',
          fontSize: '18px',
          color: '#475569',
          fontWeight: '600',
        }}>
          theairconditionshop.com
        </div>
      </div>
    ),
    { ...size }
  )
}
