/**
 * Builds sample HTML for every email template key.
 * Used by the admin email preview page.
 */
import { tradeEmailTemplate, p, pSmall, infoBlock, noticeBox } from './templates'

const SAMPLE_NAME    = 'John Smith'
const SAMPLE_COMPANY = 'Malta HVAC Ltd'
const SAMPLE_EMAIL   = 'john@maltahvac.com'
const SAMPLE_CODE    = '847291'
const SITE           = 'https://theairconditionshop.com'

export const TEMPLATE_SUBJECTS: Record<string, string> = {
  verify_email:     "Verify your email address — THE AIRCONDITION SHOP",
  trade_received:   "We've received your Trade Account application — THE AIRCONDITION SHOP",
  trade_approved:   "Welcome! Your Trade Account has been approved — THE AIRCONDITION SHOP",
  trade_rejected:   "Update regarding your Trade Account application — THE AIRCONDITION SHOP",
  trade_suspended:  "Your Trade Account has been suspended — THE AIRCONDITION SHOP",
  password_reset:   "Reset your password — THE AIRCONDITION SHOP",
  password_changed: "Your password has been changed — THE AIRCONDITION SHOP",
}

const PREVIEWS: Record<string, () => string> = {
  verify_email: () => tradeEmailTemplate({
    preheader: `Your verification code is ${SAMPLE_CODE}. It expires in 10 minutes.`,
    status: 'info',
    headline: 'Verify your email address.',
    bodyHtml:
      p('You are one step away from submitting your Trade Account application. Please enter the code below to verify your email address.') +
      `<div style="text-align:center;margin:28px 0 32px;">
         <div style="display:inline-block;background:#F8FAFC;border:2px solid #E5E7EB;border-radius:16px;padding:24px 48px;">
           <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#9CA3AF;text-transform:uppercase;">Verification Code</p>
           <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:42px;font-weight:700;letter-spacing:0.18em;color:#0D1117;">${SAMPLE_CODE}</p>
         </div>
       </div>` +
      pSmall('This code expires in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.'),
  }),

  trade_received: () => tradeEmailTemplate({
    preheader: 'Your application is under review. We will be in touch within 2 business days.',
    status: 'received',
    headline: 'Thank you for applying.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p(`We have received your Trade Account application for <strong>${SAMPLE_COMPANY}</strong>. Our team will review your details and verify your business information.`) +
      infoBlock([
        { label: 'Company',  value: SAMPLE_COMPANY },
        { label: 'Status',   value: 'Under Review' },
        { label: 'Timeline', value: 'We aim to respond within 2 business days' },
      ]) +
      p('You will receive another email as soon as your application has been reviewed. In the meantime, feel free to browse our full product catalogue.'),
    footNote: 'If you have any questions, reply to this email or call us on +356 7966 1889.',
    ctaText: 'Visit Our Website',
    ctaUrl:  SITE,
  }),

  trade_approved: () => tradeEmailTemplate({
    preheader: 'Your Trade Account is now active. Sign in to access trade pricing and place orders.',
    status: 'approved',
    headline: "You're ready to shop with trade pricing.",
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p(`Great news — your Trade Account for <strong>${SAMPLE_COMPANY}</strong> has been approved. You now have full access to exclusive trade pricing, priority stock, and dedicated support.`) +
      noticeBox('Your account is active. Sign in to start browsing trade prices and placing orders today.', 'green') +
      p('If you have any questions or need help getting started, our team is always happy to help.'),
    footNote: 'Your login email is the same address this email was delivered to.',
    ctaText: 'Sign In to Your Trade Account',
    ctaUrl:  `${SITE}/trade/dashboard`,
  }),

  trade_rejected: () => tradeEmailTemplate({
    preheader: 'We have reviewed your application and have an update for you.',
    status: 'rejected',
    headline: 'Your application could not be approved at this time.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p(`Thank you for applying for a Trade Account on behalf of <strong>${SAMPLE_COMPANY}</strong>. After carefully reviewing your application, we are unable to approve a trade account at this time.`) +
      noticeBox('<strong>Reason provided by our team:</strong><br>Unable to verify business registration details. Please reapply with updated documentation.', 'red') +
      p('If you believe there has been an error, or if your circumstances change in the future, we encourage you to get in touch.'),
    footNote: 'You are welcome to reapply in the future. Our team is here to help.',
    ctaText: 'Contact Support',
    ctaUrl:  `${SITE}/contact`,
  }),

  trade_suspended: () => tradeEmailTemplate({
    preheader: 'Your trade account access has been temporarily suspended. Please contact us.',
    status: 'suspended',
    headline: 'Your Trade Account has been temporarily suspended.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p(`We are writing to let you know that your Trade Account for <strong>${SAMPLE_COMPANY}</strong> has been temporarily suspended.`) +
      noticeBox('<strong>Reason:</strong><br>Outstanding account balance. Please contact our accounts team to resolve.', 'amber') +
      p('If you believe this is an error or would like to discuss your account, please contact our support team.'),
    footNote: 'We hope to restore your full account access promptly.',
    ctaText: 'Contact Support',
    ctaUrl:  `${SITE}/contact`,
  }),

  password_reset: () => tradeEmailTemplate({
    preheader: `Your password reset code is ${SAMPLE_CODE}. It expires in 10 minutes.`,
    status: 'info',
    headline: 'Reset your password.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p('We received a request to reset the password for your account. Enter the code below to continue.') +
      `<div style="text-align:center;margin:28px 0 32px;">
         <div style="display:inline-block;background:#F8FAFC;border:2px solid #E5E7EB;border-radius:16px;padding:24px 48px;">
           <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#9CA3AF;text-transform:uppercase;">Reset Code</p>
           <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:42px;font-weight:700;letter-spacing:0.18em;color:#0D1117;">${SAMPLE_CODE}</p>
         </div>
       </div>` +
      pSmall('This code expires in <strong>10 minutes</strong>. For security, do not share this code with anyone.'),
    footNote: 'If this was not you, please contact us immediately at support@theairconditionshop.com.',
  }),

  password_changed: () => tradeEmailTemplate({
    preheader: 'Your account password was successfully updated.',
    status: 'approved',
    headline: 'Your password has been changed.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p('This is a confirmation that the password for your THE AIRCONDITION SHOP account has been successfully changed.') +
      noticeBox('If you made this change, no further action is required. If you did <strong>not</strong> make this change, please contact our support team immediately — your account may be at risk.', 'amber'),
    footNote: 'For your security, we never store your password in plain text.',
    ctaText: 'Contact Support',
    ctaUrl:  `${SITE}/contact`,
  }),
}

export function buildEmailPreview(key: string): string | null {
  return PREVIEWS[key]?.() ?? null
}
