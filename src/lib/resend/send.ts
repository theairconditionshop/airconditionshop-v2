/**
 * All transactional email sending.
 *
 * Every function calls sendWithRetry() directly with premium HTML from
 * tradeEmailTemplate(). The DB-based email_templates table is no longer
 * consulted — all DB rows have been deleted so this file is the single
 * source of truth for every email that leaves the system.
 */

import { Resend } from 'resend'
import { tradeEmailTemplate, p, pSmall, infoBlock, noticeBox } from './templates'

const FROM        = 'THE AIRCONDITION SHOP <support@theairconditionshop.com>'
const REPLY_TO    = 'support@theairconditionshop.com'
const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || 'support@theairconditionshop.com'
const SITE_URL    = 'https://theairconditionshop.com'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY environment variable is not set')
  return new Resend(key)
}

// Strip HTML tags to derive a plain-text version (RFC 2822 / SpamAssassin).
// Removes the preheader display:none block and invisible Unicode padding
// characters (&#847; / U+034F Combining Grapheme Joiner) so they don't
// appear as garbage in plain-text clients.
function htmlToText(html: string): string {
  return html
    .replace(/<div[^>]*display\s*:\s*none[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/&middot;/g, '·')
    .replace(/[͏​‌‍﻿]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const MAX_RETRIES   = 2
const RETRY_BASE_MS = 600

type ResendSendParams = Parameters<ReturnType<typeof getResend>['emails']['send']>[0]

async function sendWithRetry(params: ResendSendParams, context: string): Promise<void> {
  let lastErr: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const { data, error } = await getResend().emails.send(params)

    if (!error) {
      console.log(`[resend] ${context} sent — to: ${params.to} messageId: ${data?.id}`)
      return
    }

    const msg = error.message ?? JSON.stringify(error)
    lastErr   = new Error(`Resend API error: ${msg}`)

    const isValidationError =
      msg.includes('validation_error') ||
      msg.includes('invalid_to')       ||
      msg.includes('invalid_from')     ||
      msg.includes('not verified')     ||
      msg.includes('blocked')

    if (isValidationError || attempt > MAX_RETRIES) {
      console.error(`[resend] ${context} failed (no retry) — to: ${params.to} error: ${msg}`)
      break
    }

    const delay = RETRY_BASE_MS * attempt
    console.warn(`[resend] ${context} attempt ${attempt} failed — retrying in ${delay}ms: ${msg}`)
    await new Promise(r => setTimeout(r, delay))
  }

  throw lastErr!
}

// Shared helper — builds params and calls sendWithRetry.
// Every send includes: from, replyTo, subject, html, text.
async function send(
  context: string,
  to: string,
  subject: string,
  html: string,
  textOverride?: string,
): Promise<void> {
  await sendWithRetry(
    {
      from:     FROM,
      replyTo:  REPLY_TO,
      to,
      subject,
      html,
      text: textOverride ?? htmlToText(html),
    },
    context,
  )
}

// ─── Trade: Email verification OTP ───────────────────────────────────────────

export async function sendTradeVerificationEmail({ email, code }: { email: string; code: string }) {
  const F = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`
  const html = tradeEmailTemplate({
    preheader: `Your verification code is ${code}. It expires in 10 minutes.`,
    status: 'info',
    headline: 'Verify your email address.',
    bodyHtml:
      p('You are one step away from submitting your Trade Account application. Please enter the code below to verify your email address.') +
      `<div style="text-align:center;margin:28px 0 32px;">
         <div style="display:inline-block;background:#F8FAFC;border:2px solid #E5E7EB;border-radius:16px;padding:24px 48px;">
           <p style="margin:0 0 4px;font-family:${F};font-size:11px;font-weight:600;letter-spacing:0.12em;color:#9CA3AF;text-transform:uppercase;">Verification Code</p>
           <p style="margin:0;font-family:${F};font-size:42px;font-weight:700;letter-spacing:0.18em;color:#0D1117;">${code}</p>
         </div>
       </div>` +
      pSmall('This code expires in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.'),
    ctaText: undefined,
    ctaUrl:  undefined,
  })
  await send(
    'trade-verify-otp',
    email,
    'Verify your email address — THE AIRCONDITION SHOP',
    html,
    `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\nIf you did not request this, you can safely ignore this email.`,
  )
}

// ─── Admin OTP (2FA login) ────────────────────────────────────────────────────

export async function sendOtpEmail({ email, name, code }: { email: string; name: string; code: string }) {
  const F = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`
  const firstName = name?.split(' ')[0] || 'there'
  const html = tradeEmailTemplate({
    preheader: `Your login verification code is ${code}. It expires in 10 minutes.`,
    status: 'info',
    headline: 'Your verification code.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p('Use the code below to complete your sign-in. It expires in <strong>10 minutes</strong>. Do not share this code with anyone.') +
      `<div style="text-align:center;margin:28px 0 32px;">
         <div style="display:inline-block;background:#F8FAFC;border:2px solid #E5E7EB;border-radius:16px;padding:24px 48px;">
           <p style="margin:0 0 4px;font-family:${F};font-size:11px;font-weight:600;letter-spacing:0.12em;color:#9CA3AF;text-transform:uppercase;">Login Code</p>
           <p style="margin:0;font-family:${F};font-size:42px;font-weight:700;letter-spacing:0.18em;color:#0D1117;">${code}</p>
         </div>
       </div>` +
      pSmall('If you did not attempt to sign in, your account may be at risk — please contact us immediately.'),
    ctaText: undefined,
    ctaUrl:  undefined,
  })
  await send(
    'admin-otp',
    email,
    'Your login verification code — THE AIRCONDITION SHOP',
    html,
    `Hi ${firstName},\n\nYour login verification code is: ${code}\n\nThis code expires in 10 minutes. Do not share it with anyone.\nIf you did not attempt to sign in, contact us immediately at support@theairconditionshop.com.`,
  )
}

// ─── Password reset OTP ───────────────────────────────────────────────────────

export async function sendPasswordResetOtpEmail({ email, name, code }: { email: string; name: string; code: string }) {
  const F = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`
  const firstName = name?.split(' ')[0] || 'there'
  const html = tradeEmailTemplate({
    preheader: `Your password reset code is ${code}. It expires in 10 minutes.`,
    status: 'info',
    headline: 'Reset your password.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p('We received a request to reset the password for your account. Enter the code below to continue. If you did not make this request, you can safely ignore this email — your password will not be changed.') +
      `<div style="text-align:center;margin:28px 0 32px;">
         <div style="display:inline-block;background:#F8FAFC;border:2px solid #E5E7EB;border-radius:16px;padding:24px 48px;">
           <p style="margin:0 0 4px;font-family:${F};font-size:11px;font-weight:600;letter-spacing:0.12em;color:#9CA3AF;text-transform:uppercase;">Reset Code</p>
           <p style="margin:0;font-family:${F};font-size:42px;font-weight:700;letter-spacing:0.18em;color:#0D1117;">${code}</p>
         </div>
       </div>` +
      pSmall('This code expires in <strong>10 minutes</strong>. For security, do not share this code with anyone.'),
    footNote: 'If this was not you, please contact us immediately at support@theairconditionshop.com.',
    ctaText: undefined,
    ctaUrl:  undefined,
  })
  await send(
    'password-reset-otp',
    email,
    'Reset your password — THE AIRCONDITION SHOP',
    html,
    `Hi ${firstName},\n\nYour password reset code is: ${code}\n\nThis code expires in 10 minutes.\nIf you did not request this, ignore this email — your password will not be changed.\n\nIf this was not you, contact us at support@theairconditionshop.com.`,
  )
}

// ─── Password changed confirmation ───────────────────────────────────────────

export async function sendPasswordChangedEmail({ email, name }: { email: string; name: string }) {
  const firstName = name?.split(' ')[0] || 'there'
  const html = tradeEmailTemplate({
    preheader: 'Your account password was successfully updated.',
    status: 'approved',
    headline: 'Your password has been changed.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p('This is a confirmation that the password for your THE AIRCONDITION SHOP account has been successfully changed.') +
      noticeBox('If you made this change, no further action is required. If you did <strong>not</strong> make this change, please contact our support team immediately — your account may be at risk.', 'amber'),
    footNote: 'For your security, we never store your password in plain text.',
    ctaText: 'Contact Support',
    ctaUrl:  `${SITE_URL}/contact`,
  })
  await send(
    'password-changed-confirmation',
    email,
    'Your password has been changed — THE AIRCONDITION SHOP',
    html,
    `Hi ${firstName},\n\nYour THE AIRCONDITION SHOP account password has been successfully changed.\n\nIf you did NOT make this change, contact us immediately:\nEmail: support@theairconditionshop.com\nPhone: +356 7966 1889`,
  )
}

// ─── Contact enquiry ──────────────────────────────────────────────────────────

export async function sendContactEnquiryEmails({
  name, email, phone, company, message,
}: { name: string; email: string; phone?: string; company?: string; message: string }) {
  const firstName = name.split(' ')[0]

  const userInfoItems: Array<{ label: string; value: string }> = [
    { label: 'Name',    value: name },
    { label: 'Subject', value: 'General enquiry' },
  ]
  if (company) userInfoItems.push({ label: 'Company', value: company })

  const userHtml = tradeEmailTemplate({
    preheader: "We've received your message and will be in touch shortly.",
    status: 'info',
    headline: "We've received your message.",
    bodyHtml:
      p(`Hi ${firstName},`) +
      p("Thank you for contacting THE AIRCONDITION SHOP. We've received your message and will get back to you as soon as possible — usually within a few hours during business hours.") +
      infoBlock(userInfoItems) +
      p('In the meantime, feel free to browse our product range or call us if your enquiry is urgent.'),
    footNote: 'You can also reach us directly at support@theairconditionshop.com.',
    ctaText: 'Visit Our Website',
    ctaUrl:  SITE_URL,
  })

  const adminInfoItems: Array<{ label: string; value: string }> = [
    { label: 'Name',    value: name },
    { label: 'Email',   value: email },
  ]
  if (phone)   adminInfoItems.push({ label: 'Phone',   value: phone })
  if (company) adminInfoItems.push({ label: 'Company', value: company })
  adminInfoItems.push({ label: 'Message', value: message })

  const adminHtml = tradeEmailTemplate({
    preheader: `New contact enquiry from ${name}${company ? ` at ${company}` : ''}.`,
    status: 'info',
    headline: 'New contact enquiry.',
    bodyHtml:
      p('A new contact form submission has been received and is waiting for a response.') +
      infoBlock(adminInfoItems),
    ctaText: 'View All Enquiries',
    ctaUrl:  `${SITE_URL}/admin/enquiries`,
  })

  await Promise.all([
    send(
      'contact-enquiry-user',
      email,
      "We received your message — THE AIRCONDITION SHOP",
      userHtml,
      `Hi ${firstName},\n\nThank you for contacting THE AIRCONDITION SHOP. We've received your message and will be in touch shortly.\n\nFor urgent enquiries call us on +356 7966 1889.`,
    ),
    send(
      'contact-enquiry-admin',
      ADMIN_EMAIL,
      `New contact enquiry from ${name}`,
      adminHtml,
      `New contact enquiry from ${name} (${email})\n\n${message}`,
    ),
  ])
}

// ─── Quote request ────────────────────────────────────────────────────────────

export async function sendQuoteRequestEmails({
  name, email, company, message,
}: { name: string; email: string; company?: string; message: string }) {
  const firstName = name.split(' ')[0]

  const userHtml = tradeEmailTemplate({
    preheader: "We've received your quote request and will send a detailed quote within 2 business days.",
    status: 'received',
    headline: 'Quote request received.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p("Thank you for your quote request. We've received all the details and our team will prepare a detailed, itemised quote tailored to your requirements.") +
      infoBlock([
        { label: 'Name',     value: name },
        { label: 'Status',   value: 'Under Review' },
        { label: 'Timeline', value: 'We aim to respond within 2 business days' },
      ]) +
      p('If you have any additional requirements or questions in the meantime, simply reply to this email or call us.'),
    footNote: 'Quote requests are reviewed Monday–Saturday during business hours.',
    ctaText: 'Visit Our Website',
    ctaUrl:  SITE_URL,
  })

  const adminInfoItems: Array<{ label: string; value: string }> = [
    { label: 'Name',    value: name },
    { label: 'Email',   value: email },
  ]
  if (company) adminInfoItems.push({ label: 'Company', value: company })
  adminInfoItems.push({ label: 'Details', value: message })

  const adminHtml = tradeEmailTemplate({
    preheader: `New quote request from ${name}${company ? ` at ${company}` : ''}.`,
    status: 'received',
    headline: 'New quote request.',
    bodyHtml:
      p('A new quote request has been submitted and is waiting for a response.') +
      infoBlock(adminInfoItems),
    ctaText: 'View All Quotes',
    ctaUrl:  `${SITE_URL}/admin/quotes`,
  })

  await Promise.all([
    send(
      'quote-request-user',
      email,
      'Your quote request — THE AIRCONDITION SHOP',
      userHtml,
      `Hi ${firstName},\n\nThank you for your quote request. We'll prepare a detailed quote within 2 business days.\n\nFor urgent enquiries call us on +356 7966 1889.`,
    ),
    send(
      'quote-request-admin',
      ADMIN_EMAIL,
      `New quote request from ${name}`,
      adminHtml,
      `New quote request from ${name} (${email})\n\n${message}`,
    ),
  ])
}

// ─── Trade: Application submitted ────────────────────────────────────────────

export async function sendTradeApplicationEmails({
  name, email, companyName,
}: { name: string; email: string; companyName: string }) {
  const firstName = name.split(' ')[0]

  const userHtml = tradeEmailTemplate({
    preheader: 'Your application is under review. We will be in touch within 2 business days.',
    status: 'received',
    headline: 'Thank you for applying.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p(`We have received your Trade Account application for <strong>${companyName}</strong>. Our team will review your details and verify your business information.`) +
      infoBlock([
        { label: 'Company',  value: companyName },
        { label: 'Status',   value: 'Under Review' },
        { label: 'Timeline', value: 'We aim to respond within 2 business days' },
      ]) +
      p('You will receive another email as soon as your application has been reviewed. In the meantime, feel free to browse our full product catalogue.'),
    footNote: 'If you have any questions, reply to this email or call us on +356 7966 1889.',
    ctaText: 'Visit Our Website',
    ctaUrl:  SITE_URL,
  })

  const adminHtml = tradeEmailTemplate({
    preheader: `${name} from ${companyName} has submitted a trade account application.`,
    status: 'received',
    headline: 'New trade application received.',
    bodyHtml:
      p('A new trade account application has been submitted and is waiting for review.') +
      infoBlock([
        { label: 'Applicant', value: name },
        { label: 'Email',     value: email },
        { label: 'Company',   value: companyName },
      ]),
    ctaText: 'Review Application',
    ctaUrl:  `${SITE_URL}/admin/trade`,
  })

  await Promise.all([
    send(
      'trade-application-user',
      email,
      "We've received your Trade Account application — THE AIRCONDITION SHOP",
      userHtml,
      `Hi ${firstName},\n\nWe have received your Trade Account application for ${companyName}.\nWe aim to respond within 2 business days.\n\nIf you have questions, call us on +356 7966 1889.`,
    ),
    send(
      'trade-application-admin',
      ADMIN_EMAIL,
      `New trade application — ${companyName}`,
      adminHtml,
      `New trade application from ${name} (${email}) for ${companyName}.\n\nReview at: ${SITE_URL}/admin/trade`,
    ),
  ])
}

// ─── Trade: Approved ──────────────────────────────────────────────────────────

export async function sendTradeApprovedEmail({ name, email, companyName }: { name: string; email: string; companyName?: string }) {
  const firstName = name.split(' ')[0]
  const html = tradeEmailTemplate({
    preheader: 'Your Trade Account is now active. Sign in to access trade pricing and place orders.',
    status: 'approved',
    headline: "You're ready to shop with trade pricing.",
    bodyHtml:
      p(`Hi ${firstName},`) +
      p(`Great news — your Trade Account${companyName ? ` for <strong>${companyName}</strong>` : ''} has been approved. You now have full access to exclusive trade pricing, priority stock, and dedicated support.`) +
      noticeBox('Your account is active. Sign in to start browsing trade prices and placing orders today.', 'green') +
      p('If you have any questions or need help getting started, our team is always happy to help. You can reach us by phone, email, or simply reply to this message.'),
    footNote: 'Your login email is the same address this email was delivered to.',
    ctaText: 'Sign In to Your Trade Account',
    ctaUrl:  `${SITE_URL}/trade/dashboard`,
  })
  await send(
    'trade-approved',
    email,
    'Welcome! Your Trade Account has been approved — THE AIRCONDITION SHOP',
    html,
    `Hi ${firstName},\n\nYour Trade Account${companyName ? ` for ${companyName}` : ''} has been approved.\n\nSign in at: ${SITE_URL}/trade/dashboard\n\nFor support: support@theairconditionshop.com or +356 7966 1889.`,
  )
}

// ─── Trade: Rejected ──────────────────────────────────────────────────────────

export async function sendTradeRejectedEmail({
  name, email, companyName, reason,
}: { name: string; email: string; companyName?: string; reason?: string }) {
  const firstName = name.split(' ')[0]
  const html = tradeEmailTemplate({
    preheader: 'We have reviewed your application and have an update for you.',
    status: 'rejected',
    headline: 'Your application could not be approved at this time.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p(`Thank you for applying for a Trade Account${companyName ? ` on behalf of <strong>${companyName}</strong>` : ''}. After carefully reviewing your application, we are unable to approve a trade account at this time.`) +
      (reason ? noticeBox(`<strong>Reason provided by our team:</strong><br>${reason}`, 'red') : '') +
      p('We understand this is not the outcome you were hoping for. If you believe there has been an error, or if your circumstances change in the future, we encourage you to get in touch — we are always happy to discuss your application directly.'),
    footNote: 'You are welcome to reapply in the future. Our team is here to help.',
    ctaText: 'Contact Support',
    ctaUrl:  `${SITE_URL}/contact`,
  })
  await send(
    'trade-rejected',
    email,
    'Update regarding your Trade Account application — THE AIRCONDITION SHOP',
    html,
    `Hi ${firstName},\n\nWe've reviewed your Trade Account application${companyName ? ` for ${companyName}` : ''} and unfortunately are unable to approve it at this time.\n\n${reason ? `Reason: ${reason}\n\n` : ''}Please contact us if you have questions: support@theairconditionshop.com or +356 7966 1889.`,
  )
}

// ─── Trade: Reactivated (suspended → approved) ────────────────────────────────

export async function sendTradeReactivatedEmail({
  name, email, companyName,
}: { name: string; email: string; companyName?: string }) {
  const firstName = name.split(' ')[0]
  const html = tradeEmailTemplate({
    preheader: 'Good news — your trade account access has been fully restored.',
    status: 'reactivated',
    headline: 'Your Trade Account is active again.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p(`We are pleased to let you know that your Trade Account${companyName ? ` for <strong>${companyName}</strong>` : ''} has been reviewed and your full access has been restored. You can now sign in and resume trading at your exclusive rates.`) +
      noticeBox('Your account is active. Trade pricing, priority stock, and your full order history are all available.', 'green') +
      p('If you have any questions or need help getting back up and running, our team is always happy to help.'),
    footNote: 'Your login email is the same address this email was delivered to.',
    ctaText: 'Sign In to Your Trade Account',
    ctaUrl:  `${SITE_URL}/trade/dashboard`,
  })
  await send(
    'trade-reactivated',
    email,
    'Your Trade Account has been reactivated — THE AIRCONDITION SHOP',
    html,
    `Hi ${firstName},\n\nYour Trade Account${companyName ? ` for ${companyName}` : ''} has been reactivated.\n\nSign in at: ${SITE_URL}/trade/dashboard`,
  )
}

// ─── Trade: Suspended ─────────────────────────────────────────────────────────

export async function sendTradeSuspendedEmail({
  name, email, companyName, reason,
}: { name: string; email: string; companyName?: string; reason?: string }) {
  const firstName = name.split(' ')[0]
  const html = tradeEmailTemplate({
    preheader: 'Your trade account access has been temporarily suspended. Please contact us.',
    status: 'suspended',
    headline: 'Your Trade Account has been temporarily suspended.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p(`We are writing to let you know that your Trade Account${companyName ? ` for <strong>${companyName}</strong>` : ''} has been temporarily suspended. During this time, access to trade pricing and your trade dashboard has been disabled.`) +
      (reason
        ? noticeBox(`<strong>Reason:</strong><br>${reason}`, 'amber')
        : noticeBox('Access to trade pricing and your trade dashboard has been temporarily disabled pending review.', 'amber')) +
      p('If you believe this is an error or would like to discuss your account, please contact our support team. We are committed to resolving any issues as quickly as possible.'),
    footNote: 'We hope to restore your full account access promptly.',
    ctaText: 'Contact Support',
    ctaUrl:  `${SITE_URL}/contact`,
  })
  await send(
    'trade-suspended',
    email,
    'Your Trade Account has been suspended — THE AIRCONDITION SHOP',
    html,
    `Hi ${firstName},\n\nYour Trade Account${companyName ? ` for ${companyName}` : ''} has been temporarily suspended.\n\n${reason ? `Reason: ${reason}\n\n` : ''}Contact us to resolve: support@theairconditionshop.com or +356 7966 1889.`,
  )
}

// ─── Quote sent ───────────────────────────────────────────────────────────────

export async function sendQuoteEmail({
  name, email, quoteNumber, total, validUntil, notes,
}: { name: string; email: string; quoteNumber: string; total: string; validUntil: string; notes?: string }) {
  const firstName = name.split(' ')[0]
  const quoteItems: Array<{ label: string; value: string }> = [
    { label: 'Quote Number', value: quoteNumber },
    { label: 'Total',        value: total },
    { label: 'Valid Until',  value: validUntil },
  ]
  if (notes) quoteItems.push({ label: 'Notes', value: notes })

  const html = tradeEmailTemplate({
    preheader: `Your quote ${quoteNumber} for ${total} is ready. Valid until ${validUntil}.`,
    status: 'info',
    headline: 'Your quote is ready.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p('We have prepared a detailed quote based on your requirements. Please review the summary below.') +
      infoBlock(quoteItems) +
      p('To accept this quote or discuss any changes, please reply to this email or call our team directly.'),
    footNote: `This quote is valid until ${validUntil}. Prices may be subject to change after this date.`,
    ctaText: 'Contact Us',
    ctaUrl:  `${SITE_URL}/contact`,
  })
  await send(
    'quote-sent',
    email,
    `Your quote ${quoteNumber} from THE AIRCONDITION SHOP`,
    html,
    `Hi ${firstName},\n\nYour quote ${quoteNumber} for ${total} is ready.\nValid until: ${validUntil}${notes ? `\nNotes: ${notes}` : ''}\n\nTo accept or discuss: support@theairconditionshop.com or +356 7966 1889.`,
  )
}

// ─── Service request ──────────────────────────────────────────────────────────

export async function sendServiceRequestEmails({
  name, email, phone, address, service_type, description, preferred_date, reference,
}: {
  name: string; email: string; phone: string; address: string
  service_type: string; description: string; preferred_date: string | null; reference: string
}) {
  const firstName = name.split(' ')[0]
  const dateDisplay = preferred_date || 'Flexible'

  const userHtml = tradeEmailTemplate({
    preheader: `Service request ${reference} received. We'll contact you within 2 business hours.`,
    status: 'received',
    headline: 'Service request received.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p("Thank you for contacting THE AIRCONDITION SHOP. We've received your service request and our team will be in touch within <strong>2 business hours</strong> to confirm your appointment.") +
      infoBlock([
        { label: 'Reference',      value: reference },
        { label: 'Service type',   value: service_type },
        { label: 'Address',        value: address },
        { label: 'Preferred date', value: dateDisplay },
      ]) +
      p('If your request is urgent, please call us directly and we will prioritise your job.'),
    footNote: 'Please keep your reference number for your records.',
    ctaText: 'Call Us Now',
    ctaUrl:  'tel:+35679661889',
  })

  const adminHtml = tradeEmailTemplate({
    preheader: `New service request ${reference} — ${service_type} from ${name}.`,
    status: 'received',
    headline: `New service request — ${reference}`,
    bodyHtml:
      p('A new service request has been submitted and requires scheduling.') +
      infoBlock([
        { label: 'Reference',      value: reference },
        { label: 'Name',           value: name },
        { label: 'Email',          value: email },
        { label: 'Phone',          value: phone },
        { label: 'Address',        value: address },
        { label: 'Service type',   value: service_type },
        { label: 'Preferred date', value: dateDisplay },
        { label: 'Description',    value: description },
      ]),
    ctaText: 'View All Service Requests',
    ctaUrl:  `${SITE_URL}/admin/services`,
  })

  await Promise.all([
    send(
      'service-request-user',
      email,
      `Service request received — ${reference}`,
      userHtml,
      `Hi ${firstName},\n\nWe've received your service request (${reference}) for ${service_type} at ${address}.\nPreferred date: ${dateDisplay}\n\nWe'll contact you within 2 business hours.\nFor urgent matters call: +356 7966 1889`,
    ),
    send(
      'service-request-admin',
      ADMIN_EMAIL,
      `New service request ${reference} — ${service_type} from ${name}`,
      adminHtml,
      `New service request ${reference}\nName: ${name} | Email: ${email} | Phone: ${phone}\nService: ${service_type} at ${address}\nPreferred date: ${dateDisplay}\nDescription: ${description}`,
    ),
  ])
}

// ─── Service booked ───────────────────────────────────────────────────────────

export async function sendServiceBookedEmail({
  customerName, email, jobNumber, scheduledDate, scheduledTime, technicianName,
}: { customerName: string; email: string; jobNumber: string; scheduledDate: string; scheduledTime: string; technicianName: string }) {
  const firstName = customerName.split(' ')[0]
  const html = tradeEmailTemplate({
    preheader: `Your service appointment is confirmed for ${scheduledDate} at ${scheduledTime}.`,
    status: 'approved',
    headline: 'Your service appointment is confirmed.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p("Great news — your service appointment has been confirmed. Here are the details for your upcoming visit.") +
      infoBlock([
        { label: 'Job Reference', value: jobNumber },
        { label: 'Date',          value: scheduledDate },
        { label: 'Time',          value: scheduledTime },
        { label: 'Technician',    value: technicianName },
      ]) +
      p('If you need to reschedule or have any questions about your appointment, please contact us as soon as possible.'),
    footNote: 'Our technician will arrive within the scheduled time window.',
    ctaText: 'Contact Us',
    ctaUrl:  `${SITE_URL}/contact`,
  })
  await send(
    'service-booked-user',
    email,
    `Service appointment confirmed — ${jobNumber}`,
    html,
    `Hi ${firstName},\n\nYour service appointment is confirmed.\nJob: ${jobNumber} | Date: ${scheduledDate} | Time: ${scheduledTime} | Technician: ${technicianName}\n\nTo reschedule: support@theairconditionshop.com or +356 7966 1889.`,
  )
}
