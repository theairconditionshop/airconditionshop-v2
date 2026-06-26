/**
 * Single premium email template used for every transactional email.
 * Stripe/Linear/Apple quality — table-based for Gmail, Outlook, Apple Mail.
 * All CSS is inline. No external fonts or images required.
 */

// ─── Brand constants ─────────────────────────────────────────────────────────

const BRAND   = 'THE AIRCONDITION SHOP'
const SITE    = 'https://theairconditionshop.com'
const SUPPORT = 'support@theairconditionshop.com'
const PHONE   = '+356 7966 1889'
const ADDRESS = 'Malta'

// Primary blue — adjust here to change all emails
const BLUE = '#0F6FFF'

// ─── Status badge config ──────────────────────────────────────────────────────

export type EmailStatus = 'received' | 'approved' | 'rejected' | 'suspended' | 'update' | 'info'

const STATUS_CONFIG: Record<EmailStatus, { label: string; bg: string; fg: string; dot: string }> = {
  received:  { label: 'Application Received', bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B' },
  approved:  { label: 'Approved',             bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  rejected:  { label: 'Application Update',   bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444' },
  suspended: { label: 'Account Suspended',    bg: '#FEF3C7', fg: '#78350F', dot: '#F59E0B' },
  update:    { label: 'Account Update',       bg: '#E0E7FF', fg: '#3730A3', dot: '#6366F1' },
  info:      { label: 'Information',          bg: '#F0F9FF', fg: '#0C4A6E', dot: '#0EA5E9' },
}

// ─── Template options ─────────────────────────────────────────────────────────

export interface TradeEmailOptions {
  /** Short preview text — shown in inbox before email is opened */
  preheader:   string
  /** Status badge type — drives colour scheme */
  status:      EmailStatus
  /** Large headline below the badge, e.g. "Thank you for applying." */
  headline:    string
  /** Main body — use the helper functions below to build paragraphs, blocks */
  bodyHtml:    string
  /** Optional small italic note beneath the body, above the CTA */
  footNote?:   string
  /** CTA button label */
  ctaText?:    string
  /** CTA button href */
  ctaUrl?:     string
}

// ─── Main template ────────────────────────────────────────────────────────────

export function tradeEmailTemplate({
  preheader,
  status,
  headline,
  bodyHtml,
  footNote,
  ctaText,
  ctaUrl,
}: TradeEmailOptions): string {

  const badge  = STATUS_CONFIG[status]
  const F      = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`

  // ── CTA button ──────────────────────────────────────────────────────────────
  const ctaBlock = ctaText && ctaUrl ? `
        <!-- CTA -->
        <tr>
          <td align="center" style="padding:8px 48px 40px;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${ctaUrl}"
              style="height:52px;v-text-anchor:middle;width:260px;" arcsize="19%"
              fillcolor="${BLUE}" stroke="f">
              <w:anchorlock/>
              <center style="color:#ffffff;font-family:${F};font-size:15px;font-weight:700;">
                ${ctaText}
              </center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="${ctaUrl}"
               target="_blank"
               style="background-color:${BLUE};border-radius:10px;color:#ffffff;display:inline-block;font-family:${F};font-size:15px;font-weight:700;letter-spacing:-0.01em;line-height:1;padding:16px 40px;text-align:center;text-decoration:none;-webkit-text-size-adjust:none;">
              ${ctaText}
            </a>
            <!--<![endif]-->
          </td>
        </tr>` : ''

  // ── Footnote ────────────────────────────────────────────────────────────────
  const footNoteBlock = footNote ? `
        <tr>
          <td style="padding:0 48px 32px;">
            <p style="margin:0;font-family:${F};font-size:13px;color:#9CA3AF;line-height:1.6;font-style:italic;">
              ${footNote}
            </p>
          </td>
        </tr>` : ''

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
  <title>${headline}</title>
  <!--[if mso]>
  <noscript><xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml></noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width:600px) {
      .email-card   { border-radius:0 !important; }
      .email-pad    { padding-left:24px !important; padding-right:24px !important; }
      .email-cta td { padding-left:24px !important; padding-right:24px !important; }
      .email-cta a  { display:block !important; text-align:center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F2F4F8;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;">
    ${preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#F2F4F8;padding:48px 16px;">
    <tr>
      <td align="center">

        <!-- Email card -->
        <table role="presentation" class="email-card" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;width:100%;background:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">

          <!-- ── HEADER ── -->
          <tr>
            <td class="email-pad" style="padding:36px 48px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Wordmark -->
                    <p style="margin:0;font-family:${F};font-size:11px;font-weight:700;letter-spacing:0.14em;color:${BLUE};text-transform:uppercase;">
                      ${BRAND}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── STATUS BADGE + HEADLINE ── -->
          <tr>
            <td class="email-pad" style="padding:20px 48px 0;">

              <!-- Status badge -->
              <p style="margin:0 0 18px;">
                <span style="display:inline-block;background-color:${badge.bg};color:${badge.fg};font-family:${F};font-size:12px;font-weight:600;letter-spacing:0.02em;padding:5px 12px;border-radius:100px;">
                  <span style="color:${badge.dot};">●</span>&nbsp; ${badge.label}
                </span>
              </p>

              <!-- Headline -->
              <h1 style="margin:0;font-family:${F};font-size:28px;font-weight:700;color:#0D1117;line-height:1.25;letter-spacing:-0.02em;">
                ${headline}
              </h1>

            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td class="email-pad" style="padding:28px 48px 0;">
              <div style="height:1px;background-color:#E5E7EB;line-height:1px;font-size:1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td class="email-pad" style="padding:32px 48px 0;font-family:${F};font-size:16px;color:#374151;line-height:1.75;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- ── FOOTNOTE ── -->
          ${footNoteBlock}

          <!-- ── CTA BUTTON ── -->
          <tr class="email-cta">
            <td>&nbsp;</td>
          </tr>
          ${ctaBlock || `
          <tr>
            <td style="padding-bottom:40px;">&nbsp;</td>
          </tr>`}

          <!-- ── DIVIDER ── -->
          <tr>
            <td class="email-pad" style="padding:0 48px;">
              <div style="height:1px;background-color:#E5E7EB;line-height:1px;font-size:1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td class="email-pad" style="padding:28px 48px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-family:${F};font-size:12px;font-weight:700;color:#111827;letter-spacing:0.08em;text-transform:uppercase;">
                      ${BRAND}
                    </p>
                    <p style="margin:0 0 3px;font-family:${F};font-size:12px;color:#9CA3AF;line-height:1.6;">
                      <a href="${SITE}" target="_blank" style="color:#6B7280;text-decoration:none;">${SITE.replace('https://', '')}</a>
                      &nbsp;&middot;&nbsp;
                      <a href="mailto:${SUPPORT}" style="color:#6B7280;text-decoration:none;">${SUPPORT}</a>
                    </p>
                    <p style="margin:0;font-family:${F};font-size:12px;color:#9CA3AF;line-height:1.6;">
                      <a href="tel:${PHONE.replace(/\s/g,'')}" style="color:#6B7280;text-decoration:none;">${PHONE}</a>
                      &nbsp;&middot;&nbsp;
                      <span style="color:#9CA3AF;">${ADDRESS}</span>
                    </p>
                    <p style="margin:8px 0 0;font-family:${F};font-size:11px;color:#D1D5DB;">
                      You are receiving this email because of your trade account activity with ${BRAND}.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Email card -->

      </td>
    </tr>
  </table>

  <!--[if mso | IE]></td></tr></table><![endif]-->

</body>
</html>`
}

// ─── Content helpers ──────────────────────────────────────────────────────────

const F = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`

/** Standard paragraph */
export function p(text: string) {
  return `<p style="margin:0 0 20px;font-family:${F};font-size:16px;color:#374151;line-height:1.75;">${text}</p>`
}

/** Smaller muted paragraph (for footnotes, caveats) */
export function pSmall(text: string) {
  return `<p style="margin:0 0 16px;font-family:${F};font-size:14px;color:#6B7280;line-height:1.7;">${text}</p>`
}

/** Labelled data block — used to display key/value pairs */
export function infoBlock(items: Array<{ label: string; value: string }>) {
  const rows = items.map(({ label, value }) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #F3F4F6;vertical-align:top;">
        <p style="margin:0 0 2px;font-family:${F};font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;">${label}</p>
        <p style="margin:0;font-family:${F};font-size:14px;font-weight:500;color:#111827;">${value}</p>
      </td>
    </tr>`).join('')

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="margin:4px 0 24px;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
    ${rows}
  </table>`
}

/** Coloured notice/alert box */
export function noticeBox(text: string, colour: 'blue' | 'green' | 'amber' | 'red' = 'blue') {
  const map = {
    blue:  { bg: '#EFF6FF', border: '#BFDBFE', fg: '#1E40AF' },
    green: { bg: '#F0FDF4', border: '#BBF7D0', fg: '#14532D' },
    amber: { bg: '#FFFBEB', border: '#FDE68A', fg: '#78350F' },
    red:   { bg: '#FEF2F2', border: '#FECACA', fg: '#991B1B' },
  }
  const c = map[colour]
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="margin:4px 0 24px;">
    <tr>
      <td style="background-color:${c.bg};border:1px solid ${c.border};border-radius:10px;padding:16px 18px;">
        <p style="margin:0;font-family:${F};font-size:14px;color:${c.fg};line-height:1.65;">${text}</p>
      </td>
    </tr>
  </table>`
}

/** Horizontal rule between sections within the body */
export function divider() {
  return `<div style="height:1px;background-color:#F3F4F6;margin:24px 0;">&nbsp;</div>`
}
