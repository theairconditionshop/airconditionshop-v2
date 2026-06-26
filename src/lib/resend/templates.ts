/**
 * Single premium email template used for every transactional email.
 * Stripe/Linear/Apple quality — table-based for Gmail, Outlook, Apple Mail.
 * All CSS is inline. Dark mode supported via media query (Apple Mail, iOS,
 * Outlook desktop, Thunderbird). Gmail ignores dark media queries and
 * renders the light version, which is fully readable.
 */

// ─── Brand constants ─────────────────────────────────────────────────────────

const BRAND   = 'THE AIRCONDITION SHOP'
const SITE    = 'https://theairconditionshop.com'
const SUPPORT = 'support@theairconditionshop.com'
const PHONE   = '+356 7966 1889'
const ADDRESS = 'Malta, European Union'
const LOGO    = `${SITE}/shop-logo.jpg`
const YEAR    = new Date().getFullYear()

// Primary blue — adjust here to change all emails
const BLUE = '#0F6FFF'

// ─── Status badge config ──────────────────────────────────────────────────────

export type EmailStatus = 'received' | 'approved' | 'rejected' | 'suspended' | 'reactivated' | 'update' | 'info'

const STATUS_CONFIG: Record<EmailStatus, { label: string; bg: string; fg: string; dot: string }> = {
  received:    { label: 'Application Received', bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B' },
  approved:    { label: 'Approved',             bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  rejected:    { label: 'Application Update',   bg: '#FEE2E2', fg: '#991B1B', dot: '#EF4444' },
  suspended:   { label: 'Account Suspended',    bg: '#FEF3C7', fg: '#78350F', dot: '#F59E0B' },
  reactivated: { label: 'Account Reactivated',  bg: '#D1FAE5', fg: '#065F46', dot: '#10B981' },
  update:      { label: 'Account Update',       bg: '#E0E7FF', fg: '#3730A3', dot: '#6366F1' },
  info:        { label: 'Information',          bg: '#F0F9FF', fg: '#0C4A6E', dot: '#0EA5E9' },
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

  // ── CTA button — VML fallback for Outlook, standard anchor for all others ──
  const ctaBlock = ctaText && ctaUrl ? `
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
        </tr>` : `<tr><td style="padding-bottom:40px;">&nbsp;</td></tr>`

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
    /* Responsive */
    @media only screen and (max-width:600px) {
      .email-card  { border-radius:0 !important; }
      .email-pad   { padding-left:24px !important; padding-right:24px !important; }
      .email-cta td { padding-left:24px !important; padding-right:24px !important; }
      .email-cta a  { display:block !important; text-align:center !important; }
    }

    /* Dark mode — supported by Apple Mail, iOS Mail, Outlook desktop, Thunderbird.
       Gmail webmail/mobile does not support prefers-color-scheme and renders light. */
    @media (prefers-color-scheme: dark) {
      .email-outer { background-color:#111827 !important; }
      .email-card  { background-color:#1F2937 !important; border-color:#374151 !important; }
      .email-header-bg { background-color:#1F2937 !important; }
      .email-divider { background-color:#374151 !important; }
      .email-body-cell { background-color:#1F2937 !important; }
      .email-footer-cell { background-color:#1F2937 !important; }
      h1.email-headline { color:#F9FAFB !important; }
      p.email-body-text { color:#D1D5DB !important; }
      .email-help-cell { background-color:#111827 !important; border-color:#374151 !important; }
      .email-help-text { color:#9CA3AF !important; }
      .email-footer-text { color:#6B7280 !important; }
      .email-footer-link { color:#9CA3AF !important; }
      .email-copyright { color:#4B5563 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F2F4F8;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;"><![endif]-->

  <!-- Preheader — hidden from display, shown in inbox preview -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;opacity:0;color:transparent;height:0;width:0;font-size:1px;">
    ${preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" class="email-outer" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#F2F4F8;padding:48px 16px;">
    <tr>
      <td align="center">

        <!-- Email card -->
        <table role="presentation" class="email-card" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;width:100%;background:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">

          <!-- ── HEADER: LOGO + BRAND ── -->
          <tr>
            <td class="email-pad email-header-bg" style="padding:32px 48px 0;background:#FFFFFF;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:10px;">
                          <img src="${LOGO}" width="36" height="36" alt="${BRAND} logo"
                               style="display:block;border:0;outline:0;border-radius:8px;-ms-interpolation-mode:bicubic;object-fit:cover;">
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-family:${F};font-size:11px;font-weight:700;letter-spacing:0.14em;color:${BLUE};text-transform:uppercase;">
                            ${BRAND}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── STATUS BADGE + HEADLINE ── -->
          <tr>
            <td class="email-pad" style="padding:20px 48px 0;">
              <p style="margin:0 0 18px;">
                <span style="display:inline-block;background-color:${badge.bg};color:${badge.fg};font-family:${F};font-size:12px;font-weight:600;letter-spacing:0.02em;padding:5px 12px;border-radius:100px;">
                  <span style="color:${badge.dot};">●</span>&nbsp; ${badge.label}
                </span>
              </p>
              <h1 class="email-headline" style="margin:0;font-family:${F};font-size:28px;font-weight:700;color:#0D1117;line-height:1.25;letter-spacing:-0.02em;">
                ${headline}
              </h1>
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td class="email-pad" style="padding:28px 48px 0;">
              <div class="email-divider" style="height:1px;background-color:#E5E7EB;line-height:1px;font-size:1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td class="email-pad email-body-cell" style="padding:32px 48px 0;font-family:${F};font-size:16px;color:#374151;line-height:1.75;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- ── FOOTNOTE ── -->
          ${footNoteBlock}

          <!-- ── CTA BUTTON ── -->
          <tr class="email-cta">
            ${ctaBlock.replace('<tr>', '').replace('</tr>', '')}
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td class="email-pad" style="padding:0 48px;">
              <div class="email-divider" style="height:1px;background-color:#E5E7EB;line-height:1px;font-size:1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- ── NEED HELP? ── -->
          <tr>
            <td class="email-pad" style="padding:24px 48px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="email-help-cell" style="background-color:#F9FAFB;border:1px solid #F3F4F6;border-radius:10px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-family:${F};font-size:13px;font-weight:600;color:#374151;">Need help?</p>
                    <p class="email-help-text" style="margin:0;font-family:${F};font-size:13px;color:#6B7280;line-height:1.6;">
                      Reply to this email, call us on
                      <a href="tel:${PHONE.replace(/\s/g,'')}" style="color:${BLUE};text-decoration:none;">${PHONE}</a>,
                      or visit
                      <a href="${SITE}/contact" target="_blank" style="color:${BLUE};text-decoration:none;">${SITE.replace('https://', '')}/contact</a>
                      — we typically respond within a few hours.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td class="email-pad email-footer-cell" style="padding:24px 48px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-family:${F};font-size:12px;font-weight:700;color:#111827;letter-spacing:0.08em;text-transform:uppercase;">
                      ${BRAND}
                    </p>
                    <p style="margin:0 0 3px;font-family:${F};font-size:12px;color:#9CA3AF;line-height:1.6;">
                      <a class="email-footer-link" href="${SITE}" target="_blank" style="color:#6B7280;text-decoration:none;">${SITE.replace('https://', '')}</a>
                      &nbsp;&middot;&nbsp;
                      <a class="email-footer-link" href="mailto:${SUPPORT}" style="color:#6B7280;text-decoration:none;">${SUPPORT}</a>
                    </p>
                    <p style="margin:0 0 3px;font-family:${F};font-size:12px;color:#9CA3AF;line-height:1.6;">
                      <a class="email-footer-link" href="tel:${PHONE.replace(/\s/g,'')}" style="color:#6B7280;text-decoration:none;">${PHONE}</a>
                      &nbsp;&middot;&nbsp;
                      <span class="email-footer-text" style="color:#9CA3AF;">${ADDRESS}</span>
                    </p>
                    <p class="email-copyright" style="margin:10px 0 0;font-family:${F};font-size:11px;color:#D1D5DB;">
                      &copy; ${YEAR} ${BRAND}. All rights reserved.
                    </p>
                    <p style="margin:6px 0 0;font-family:${F};font-size:11px;color:#D1D5DB;">
                      You are receiving this email because of your account activity with ${BRAND}.
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
