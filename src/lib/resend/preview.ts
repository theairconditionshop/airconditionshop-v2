/**
 * Builds sample HTML for every email template key.
 * Used by the admin email preview page.
 */
import { tradeEmailTemplate, otpEmailTemplate, p, pSmall, infoBlock, noticeBox } from './templates'

const SAMPLE_NAME    = 'John Smith'
const SAMPLE_COMPANY = 'Malta HVAC Ltd'
const SAMPLE_EMAIL   = 'john@maltahvac.com'
const SAMPLE_CODE    = '847291'
const SITE           = 'https://theairconditionshop.com'

export const TEMPLATE_SUBJECTS: Record<string, string> = {
  verify_email:       "Verify your email address — THE AIRCONDITION SHOP",
  admin_otp:          "Your login verification code — THE AIRCONDITION SHOP",
  trade_received:     "We've received your Trade Account application — THE AIRCONDITION SHOP",
  trade_approved:     "Welcome! Your Trade Account has been approved — THE AIRCONDITION SHOP",
  trade_rejected:     "Update regarding your Trade Account application — THE AIRCONDITION SHOP",
  trade_reactivated:  "Your Trade Account has been reactivated — THE AIRCONDITION SHOP",
  trade_suspended:    "Your Trade Account has been suspended — THE AIRCONDITION SHOP",
  contact_enquiry:    "We received your message — THE AIRCONDITION SHOP",
  quote_request:      "Your quote request — THE AIRCONDITION SHOP",
  quote_sent:         "Your quote is ready — THE AIRCONDITION SHOP",
  service_request:    "Service request received — THE AIRCONDITION SHOP",
  service_booked:     "Service appointment confirmed — THE AIRCONDITION SHOP",
  password_reset:     "Reset your password — THE AIRCONDITION SHOP",
  password_changed:   "Your password has been changed — THE AIRCONDITION SHOP",
}

const PREVIEWS: Record<string, () => string> = {
  admin_otp: () => otpEmailTemplate({
    preheader:  `Your login verification code is ${SAMPLE_CODE}. It expires in 10 minutes.`,
    codeLabel:  'Login Code',
    code:       SAMPLE_CODE,
    greeting:   `Hi ${SAMPLE_NAME.split(' ')[0]},`,
    context:    'Use the code below to complete your sign-in. Do not share this code with anyone.',
    notice:     'This code expires in 10 minutes. If you did not attempt to sign in, your account may be at risk — contact us immediately.',
  }),

  verify_email: () => otpEmailTemplate({
    preheader:  `Your verification code is ${SAMPLE_CODE}. It expires in 10 minutes.`,
    codeLabel:  'Verification Code',
    code:       SAMPLE_CODE,
    greeting:   'Hello,',
    context:    'Enter the code below to verify your email address and complete your Trade Account application.',
    notice:     'This code expires in 10 minutes. If you did not request this, you can safely ignore this email.',
  }),

  trade_received: () => tradeEmailTemplate({
    preheader: 'Your application is under review. We will be in touch within 2 business days.',
    status: 'received',
    headline: 'Thank you for applying.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p(`We have received your Trade Account application for <strong>${SAMPLE_COMPANY}</strong>. Our team will review your details and verify your business information.`) +
      infoBlock([
        { label: 'Company',               value: SAMPLE_COMPANY },
        { label: 'Identification Type',   value: 'Maltese ID Card' },
        { label: 'Identification Number', value: '1234567A' },
        { label: 'Status',                value: 'Under Review' },
        { label: 'Timeline',              value: 'We aim to respond within 2 business days' },
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

  trade_reactivated: () => tradeEmailTemplate({
    preheader: 'Good news — your trade account access has been fully restored.',
    status: 'reactivated',
    headline: 'Your Trade Account is active again.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p(`We are pleased to let you know that your Trade Account for <strong>${SAMPLE_COMPANY}</strong> has been reviewed and your full access has been restored.`) +
      noticeBox('Your account is active. Trade pricing, priority stock, and your full order history are all available.', 'green') +
      p('If you have any questions or need help getting back up and running, our team is always happy to help.'),
    footNote: 'Your login email is the same address this email was delivered to.',
    ctaText: 'Sign In to Your Trade Account',
    ctaUrl:  `${SITE}/trade/dashboard`,
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

  contact_enquiry: () => tradeEmailTemplate({
    preheader: "We've received your message and will be in touch shortly.",
    status: 'info',
    headline: "We've received your message.",
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p("Thank you for contacting THE AIRCONDITION SHOP. We've received your message and will get back to you as soon as possible — usually within a few hours during business hours.") +
      infoBlock([
        { label: 'Name',    value: SAMPLE_NAME },
        { label: 'Subject', value: 'General enquiry' },
      ]) +
      p('In the meantime, feel free to browse our product range or call us if your enquiry is urgent.'),
    footNote: 'You can also reach us directly at support@theairconditionshop.com.',
    ctaText: 'Visit Our Website',
    ctaUrl:  SITE,
  }),

  quote_request: () => tradeEmailTemplate({
    preheader: "We've received your quote request and will send a detailed quote within 2 business days.",
    status: 'received',
    headline: 'Quote request received.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p("Thank you for your quote request. We've received all the details and our team will prepare a detailed, itemised quote tailored to your requirements.") +
      infoBlock([
        { label: 'Name',     value: SAMPLE_NAME },
        { label: 'Status',   value: 'Under Review' },
        { label: 'Timeline', value: 'We aim to respond within 2 business days' },
      ]),
    footNote: 'Quote requests are reviewed Monday–Saturday during business hours.',
    ctaText: 'Visit Our Website',
    ctaUrl:  SITE,
  }),

  quote_sent: () => tradeEmailTemplate({
    preheader: 'Your quote Q-2025-001 for €1,200.00 is ready. Valid until 30 Jul 2025.',
    status: 'info',
    headline: 'Your quote is ready.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p('We have prepared a detailed quote based on your requirements. Please review the summary below.') +
      infoBlock([
        { label: 'Quote Number', value: 'Q-2025-001' },
        { label: 'Total',        value: '€1,200.00' },
        { label: 'Valid Until',  value: '30 Jul 2025' },
      ]) +
      p('To accept this quote or discuss any changes, please reply to this email or call our team directly.'),
    footNote: 'Prices may be subject to change after the valid-until date.',
    ctaText: 'Contact Us',
    ctaUrl:  `${SITE}/contact`,
  }),

  service_request: () => tradeEmailTemplate({
    preheader: 'Service request SR-2025-001 received. We\'ll contact you within 2 business hours.',
    status: 'received',
    headline: 'Service request received.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p("Thank you for contacting THE AIRCONDITION SHOP. We've received your service request and our team will be in touch within <strong>2 business hours</strong> to confirm your appointment.") +
      infoBlock([
        { label: 'Reference',      value: 'SR-2025-001' },
        { label: 'Service type',   value: 'Air Conditioning Installation' },
        { label: 'Address',        value: '123 Example Street, Sliema' },
        { label: 'Preferred date', value: '15 Jul 2025' },
      ]) +
      p('If your request is urgent, please call us directly and we will prioritise your job.'),
    footNote: 'Please keep your reference number for your records.',
    ctaText: 'Contact Us',
    ctaUrl:  `${SITE}/contact`,
  }),

  service_booked: () => tradeEmailTemplate({
    preheader: 'Your service appointment is confirmed for 15 Jul 2025 at 09:00.',
    status: 'approved',
    headline: 'Your service appointment is confirmed.',
    bodyHtml:
      p(`Hi ${SAMPLE_NAME.split(' ')[0]},`) +
      p("Great news — your service appointment has been confirmed. Here are the details for your upcoming visit.") +
      infoBlock([
        { label: 'Job Reference', value: 'JOB-2025-001' },
        { label: 'Date',          value: '15 Jul 2025' },
        { label: 'Time',          value: '09:00 – 11:00' },
        { label: 'Technician',    value: 'Mario Borg' },
      ]) +
      p('If you need to reschedule or have any questions about your appointment, please contact us as soon as possible.'),
    footNote: 'Our technician will arrive within the scheduled time window.',
    ctaText: 'Contact Us',
    ctaUrl:  `${SITE}/contact`,
  }),

  password_reset: () => otpEmailTemplate({
    preheader:  `Your password reset code is ${SAMPLE_CODE}. It expires in 10 minutes.`,
    codeLabel:  'Reset Code',
    code:       SAMPLE_CODE,
    greeting:   `Hi ${SAMPLE_NAME.split(' ')[0]},`,
    context:    'We received a request to reset the password for your account. Enter the code below to continue.',
    notice:     'This code expires in 10 minutes. If you did not request this, ignore this email — your password will not be changed.',
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
