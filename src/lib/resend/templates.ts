/**
 * Reusable premium email template for all trade account emails.
 * Apple-like minimal style, inline CSS for maximum email client compatibility.
 */

const BRAND_COLOR = '#2563eb'  // blue-600
const BRAND_NAME  = 'THE AIRCONDITION SHOP'
const WEBSITE_URL = 'https://theairconditionshop.com'
const PHONE       = '+356 7966 1889'
const SUPPORT_EMAIL = 'support@theairconditionshop.com'

export interface TradeEmailOptions {
  preheader:   string        // short preview text (hidden in body)
  heading:     string        // e.g. "Your application was received"
  subheading?: string        // smaller text beneath heading
  bodyHtml:    string        // inner content — paragraphs, lists, info blocks
  ctaText?:    string        // e.g. "Log In to Your Account"
  ctaUrl?:     string        // e.g. "https://theairconditionshop.com/login"
}

export function tradeEmailTemplate({
  preheader,
  heading,
  subheading,
  bodyHtml,
  ctaText,
  ctaUrl,
}: TradeEmailOptions): string {
  const cta = ctaText && ctaUrl ? `
    <tr>
      <td align="center" style="padding:8px 0 32px;">
        <a href="${ctaUrl}"
           style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.01em;text-decoration:none;padding:14px 32px;border-radius:10px;">
          ${ctaText}
        </a>
      </td>
    </tr>` : ''

  const sub = subheading ? `
    <p style="margin:4px 0 0;font-size:15px;color:#64748b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      ${subheading}
    </p>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${heading}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Preheader (hidden preview text) -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${preheader}
  </span>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:48px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

          <!-- Header stripe -->
          <tr>
            <td style="background:${BRAND_COLOR};padding:28px 40px;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;color:rgba(255,255,255,0.75);text-transform:uppercase;">
                ${BRAND_NAME}
              </p>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding:40px 40px 0;">
              <h1 style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;color:#0f172a;line-height:1.3;">
                ${heading}
              </h1>
              ${sub}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 40px 0;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;color:#334155;line-height:1.7;">
                    ${bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          ${cta}

          <!-- Footer divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;color:#0f172a;letter-spacing:0.05em;text-transform:uppercase;">
                      ${BRAND_NAME}
                    </p>
                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#94a3b8;line-height:1.6;">
                      <a href="${WEBSITE_URL}" style="color:#94a3b8;text-decoration:none;">${WEBSITE_URL.replace('https://', '')}</a>
                      &nbsp;·&nbsp;
                      <a href="tel:${PHONE.replace(/\s/g, '')}" style="color:#94a3b8;text-decoration:none;">${PHONE}</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:${SUPPORT_EMAIL}" style="color:#94a3b8;text-decoration:none;">${SUPPORT_EMAIL}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`
}

/** Render a simple paragraph */
export function p(text: string) {
  return `<p style="margin:0 0 16px;">${text}</p>`
}

/** Render a labelled info block (e.g. Company: Acme Ltd) */
export function infoBlock(items: Array<{ label: string; value: string }>) {
  const rows = items.map(({ label, value }) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
        <span style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.07em;">${label}</span>
        <br>
        <span style="font-size:14px;font-weight:500;color:#0f172a;">${value}</span>
      </td>
    </tr>`).join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="margin:0 0 20px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      ${rows}
    </table>`
}

/** Render a warning/notice box */
export function noticeBox(text: string, colour: 'blue' | 'amber' | 'red' = 'blue') {
  const bg   = colour === 'red' ? '#fef2f2' : colour === 'amber' ? '#fffbeb' : '#eff6ff'
  const border = colour === 'red' ? '#fecaca' : colour === 'amber' ? '#fde68a' : '#bfdbfe'
  const fg   = colour === 'red' ? '#b91c1c' : colour === 'amber' ? '#92400e' : '#1e40af'
  return `
    <div style="background:${bg};border:1px solid ${border};border-radius:8px;padding:14px 16px;margin:0 0 20px;">
      <p style="margin:0;font-size:14px;color:${fg};line-height:1.6;">${text}</p>
    </div>`
}
