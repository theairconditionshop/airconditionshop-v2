import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { tradeEmailTemplate, p, pSmall, infoBlock, noticeBox } from './templates'

const FROM        = 'THE AIRCONDITION SHOP <support@theairconditionshop.com>'
const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || 'support@theairconditionshop.com'
const SITE_URL    = 'https://theairconditionshop.com'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY environment variable is not set')
  return new Resend(key)
}

async function getTemplate(key: string) {
  const db = createAdminClient()
  const { data } = await db
    .from('email_templates')
    .select('subject, html_body')
    .eq('key', key)
    .single()
  return data
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '')
}

// Strip HTML tags to derive a plain-text fallback that passes spam filters
// that penalise HTML-only messages (RFC 2822 / SpamAssassin).
// Also removes the preheader `display:none` block and its invisible padding
// characters (&#847; / U+034F Combining Grapheme Joiner) so they don't
// appear as garbage in plain-text clients.
function htmlToText(html: string): string {
  return html
    // Drop entire preheader div (display:none hidden text + invisible padding chars)
    .replace(/<div[^>]*display\s*:\s*none[^>]*>[\s\S]*?<\/div>/gi, '')
    // Drop style blocks
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Strip remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/&middot;/g, '·')
    // Remove invisible Unicode control characters (preheader padding)
    .replace(/[͏​‌‍﻿]/g, '')
    // Collapse whitespace
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// Retry wrapper — retries up to MAX_RETRIES times on transient failures.
// Does NOT retry on validation errors (bad address, domain not found etc.)
// so we don't waste time on permanently undeliverable addresses.
const MAX_RETRIES = 2
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

    const msg    = error.message ?? JSON.stringify(error)
    lastErr      = new Error(`Resend API error: ${msg}`)

    // Non-retryable: address validation, domain not found, blocked address.
    // These will not succeed on retry so bail immediately.
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

    const delay = RETRY_BASE_MS * attempt // 600ms, 1200ms
    console.warn(`[resend] ${context} attempt ${attempt} failed — retrying in ${delay}ms: ${msg}`)
    await new Promise(r => setTimeout(r, delay))
  }

  throw lastErr!
}

async function sendEmail(
  key: string,
  to: string,
  vars: Record<string, string>,
  fallback: { subject: string; html: string }
) {
  const template = await getTemplate(key)
  const subject  = template ? interpolate(template.subject, vars)   : fallback.subject
  const html     = template ? interpolate(template.html_body, vars) : fallback.html

  console.log('[resend] Sending email — key:', key, 'to:', to, 'template:', template ? 'db' : 'fallback')

  await sendWithRetry(
    { from: FROM, to, subject, html, text: htmlToText(html) },
    `key:${key}`,
  )
}

// ─── Trade: Email verification OTP ───────────────────────────────────────────

export async function sendTradeVerificationEmail({ email, code }: { email: string; code: string }) {
  const subject = 'Verify your email address — THE AIRCONDITION SHOP'
  const html = tradeEmailTemplate({
    preheader: `Your verification code is ${code}. It expires in 10 minutes.`,
    status: 'info',
    headline: 'Verify your email address.',
    bodyHtml:
      p('You are one step away from submitting your Trade Account application. Please enter the code below to verify your email address.') +
      `<div style="text-align:center;margin:28px 0 32px;">
         <div style="display:inline-block;background:#F8FAFC;border:2px solid #E5E7EB;border-radius:16px;padding:24px 48px;">
           <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#9CA3AF;text-transform:uppercase;">Verification Code</p>
           <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:42px;font-weight:700;letter-spacing:0.18em;color:#0D1117;">${code}</p>
         </div>
       </div>` +
      pSmall('This code expires in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.'),
    ctaText: undefined,
    ctaUrl:  undefined,
  })

  await sendWithRetry(
    { from: FROM, to: email, subject, html, text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, you can safely ignore this email.` },
    'trade-verify-otp',
  )
}

// ─── Password reset OTP ───────────────────────────────────────────────────────

export async function sendPasswordResetOtpEmail({ email, name, code }: { email: string; name: string; code: string }) {
  const firstName = name?.split(' ')[0] || 'there'
  const subject = 'Reset your password — THE AIRCONDITION SHOP'
  const html = tradeEmailTemplate({
    preheader: `Your password reset code is ${code}. It expires in 10 minutes.`,
    status: 'info',
    headline: 'Reset your password.',
    bodyHtml:
      p(`Hi ${firstName},`) +
      p('We received a request to reset the password for your account. Enter the code below to continue. If you did not make this request, you can safely ignore this email — your password will not be changed.') +
      `<div style="text-align:center;margin:28px 0 32px;">
         <div style="display:inline-block;background:#F8FAFC;border:2px solid #E5E7EB;border-radius:16px;padding:24px 48px;">
           <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#9CA3AF;text-transform:uppercase;">Reset Code</p>
           <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:42px;font-weight:700;letter-spacing:0.18em;color:#0D1117;">${code}</p>
         </div>
       </div>` +
      pSmall('This code expires in <strong>10 minutes</strong>. For security, do not share this code with anyone.'),
    footNote: 'If this was not you, please contact us immediately at support@theairconditionshop.com.',
    ctaText: undefined,
    ctaUrl:  undefined,
  })
  await sendWithRetry(
    { from: FROM, to: email, subject, html, text: `Hi ${firstName},\n\nYour password reset code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, ignore this email — your password will not be changed.\n\nIf this was not you, contact us at support@theairconditionshop.com.` },
    'password-reset-otp',
  )
}

// ─── Password changed confirmation ───────────────────────────────────────────

export async function sendPasswordChangedEmail({ email, name }: { email: string; name: string }) {
  const firstName = name?.split(' ')[0] || 'there'
  const subject = 'Your password has been changed — THE AIRCONDITION SHOP'
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

  await sendWithRetry(
    { from: FROM, to: email, subject, html, text: `Hi ${firstName},\n\nYour THE AIRCONDITION SHOP account password has been successfully changed.\n\nIf you did NOT make this change, contact us immediately at support@theairconditionshop.com or call +356 7966 1889.` },
    'password-changed-confirmation',
  )
}

// ─── Admin OTP (2FA) ──────────────────────────────────────────────────────────

export async function sendOtpEmail({ email, name, code }: { email: string; name: string; code: string }) {
  await sendEmail('otp_code', email, { code, name }, {
    subject: 'Your login verification code — THE AIRCONDITION SHOP',
    html: tradeEmailTemplate({
      preheader: `Your verification code is ${code}`,
      status: 'info',
      headline: 'Your verification code',
      bodyHtml:
        p(`Hi ${name},`) +
        p('Use the code below to complete your sign-in. It expires in <strong>10 minutes</strong>.') +
        `<div style="text-align:center;margin:24px 0 28px;">
           <span style="display:inline-block;font-size:36px;font-weight:700;letter-spacing:10px;color:#0D1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${code}</span>
         </div>` +
        p('If you did not request this code, you can safely ignore this email.'),
    }),
  })
}

// ─── Contact enquiry ──────────────────────────────────────────────────────────

export async function sendContactEnquiryEmails({
  name, email, phone, company, message,
}: { name: string; email: string; phone?: string; company?: string; message: string }) {
  const vars = { name, email, phone: phone || '', company: company || '', message }
  await Promise.all([
    sendEmail('contact_enquiry_user', email, vars, {
      subject: 'We received your message — THE AIRCONDITION SHOP',
      html: `<p>Dear ${name},</p><p>Thank you for contacting us. We will be in touch shortly.</p>`,
    }),
    sendEmail('contact_enquiry_admin', ADMIN_EMAIL, vars, {
      subject: `New contact enquiry from ${name}`,
      html: `<p>From: ${name} (${email})</p><p>${message}</p>`,
    }),
  ])
}

// ─── Quote request ────────────────────────────────────────────────────────────

export async function sendQuoteRequestEmails({
  name, email, company, message,
}: { name: string; email: string; company?: string; message: string }) {
  const vars = { name, email, company: company || '', message }
  await Promise.all([
    sendEmail('quote_request_user', email, vars, {
      subject: 'Your quote request — THE AIRCONDITION SHOP',
      html: `<p>Dear ${name},</p><p>Thank you for your quote request. We will send you a detailed quote within 2 business days.</p>`,
    }),
    sendEmail('quote_request_admin', ADMIN_EMAIL, vars, {
      subject: `New quote request from ${name}`,
      html: `<p>New quote request from ${name} (${email})</p>`,
    }),
  ])
}

// ─── Trade: Application submitted ────────────────────────────────────────────

export async function sendTradeApplicationEmails({
  name, email, companyName,
}: { name: string; email: string; companyName: string }) {
  const vars = { name, email, company_name: companyName }
  const firstName = name.split(' ')[0]
  await Promise.all([
    sendEmail('trade_application_user', email, vars, {
      subject: "We've received your Trade Account application — THE AIRCONDITION SHOP",
      html: tradeEmailTemplate({
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
        ctaUrl:  `${SITE_URL}`,
      }),
    }),
    sendEmail('trade_application_admin', ADMIN_EMAIL, vars, {
      subject: `New trade application — ${companyName}`,
      html: tradeEmailTemplate({
        preheader: `${name} from ${companyName} has submitted a trade account application.`,
        status: 'received',
        headline: 'New trade application received.',
        bodyHtml:
          p(`A new trade account application has been submitted and is waiting for review.`) +
          infoBlock([
            { label: 'Applicant', value: name },
            { label: 'Email',     value: email },
            { label: 'Company',   value: companyName },
          ]),
        ctaText: 'Review Application',
        ctaUrl:  `${SITE_URL}/admin/trade`,
      }),
    }),
  ])
}

// ─── Trade: Approved ─────────────────────────────────────────────────────────

export async function sendTradeApprovedEmail({ name, email, companyName }: { name: string; email: string; companyName?: string }) {
  const firstName = name.split(' ')[0]
  await sendEmail('trade_approved', email, { name, email, company_name: companyName || '' }, {
    subject: 'Welcome! Your Trade Account has been approved — THE AIRCONDITION SHOP',
    html: tradeEmailTemplate({
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
    }),
  })
}

// ─── Trade: Rejected ─────────────────────────────────────────────────────────

export async function sendTradeRejectedEmail({
  name, email, companyName, reason,
}: { name: string; email: string; companyName?: string; reason?: string }) {
  const firstName = name.split(' ')[0]
  await sendEmail('trade_rejected', email, { name, email, company_name: companyName || '', reason: reason || '' }, {
    subject: 'Update regarding your Trade Account application — THE AIRCONDITION SHOP',
    html: tradeEmailTemplate({
      preheader: 'We have reviewed your application and have an update for you.',
      status: 'rejected',
      headline: 'Your application could not be approved at this time.',
      bodyHtml:
        p(`Hi ${firstName},`) +
        p(`Thank you for applying for a Trade Account${companyName ? ` on behalf of <strong>${companyName}</strong>` : ''}. After carefully reviewing your application, we are unable to approve a trade account at this time.`) +
        (reason
          ? noticeBox(`<strong>Reason provided by our team:</strong><br>${reason}`, 'red')
          : '') +
        p('We understand this is not the outcome you were hoping for. If you believe there has been an error, or if your circumstances change in the future, we encourage you to get in touch — we are always happy to discuss your application directly.'),
      footNote: 'You are welcome to reapply in the future. Our team is here to help.',
      ctaText: 'Contact Support',
      ctaUrl:  `${SITE_URL}/contact`,
    }),
  })
}

// ─── Trade: Reactivated (suspended → approved again) ─────────────────────────

export async function sendTradeReactivatedEmail({
  name, email, companyName,
}: { name: string; email: string; companyName?: string }) {
  const firstName = name.split(' ')[0]
  await sendEmail('trade_reactivated', email, { name, email, company_name: companyName || '' }, {
    subject: 'Your Trade Account has been reactivated — THE AIRCONDITION SHOP',
    html: tradeEmailTemplate({
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
    }),
  })
}

// ─── Trade: Suspended ────────────────────────────────────────────────────────

export async function sendTradeSuspendedEmail({
  name, email, companyName, reason,
}: { name: string; email: string; companyName?: string; reason?: string }) {
  const firstName = name.split(' ')[0]
  await sendEmail('trade_suspended', email, { name, email, company_name: companyName || '', reason: reason || '' }, {
    subject: 'Your Trade Account has been suspended — THE AIRCONDITION SHOP',
    html: tradeEmailTemplate({
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
    }),
  })
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail({ name, email, resetUrl }: { name: string; email: string; resetUrl: string }) {
  await sendEmail('password_reset', email, { name, reset_url: resetUrl }, {
    subject: 'Reset your password — THE AIRCONDITION SHOP',
    html: `<p>Dear ${name},</p><p><a href="${resetUrl}">Click here</a> to reset your password. Link expires in 1 hour.</p>`,
  })
}

// ─── Quote sent ───────────────────────────────────────────────────────────────

export async function sendQuoteEmail({
  name, email, quoteNumber, total, validUntil, notes,
}: { name: string; email: string; quoteNumber: string; total: string; validUntil: string; notes?: string }) {
  await sendEmail('quote_sent', email, {
    name, quote_number: quoteNumber, total, valid_until: validUntil, notes: notes || '',
  }, {
    subject: `Your quote ${quoteNumber} from THE AIRCONDITION SHOP`,
    html: `<p>Dear ${name},</p><p>Your quote <strong>${quoteNumber}</strong> for <strong>${total}</strong> is ready. Valid until ${validUntil}.</p>`,
  })
}

// ─── Service request ──────────────────────────────────────────────────────────

export async function sendServiceRequestEmails({
  name, email, phone, address, service_type, description, preferred_date, reference,
}: {
  name: string; email: string; phone: string; address: string
  service_type: string; description: string; preferred_date: string | null; reference: string
}) {
  const vars = {
    name, email, phone, address, service_type, description,
    preferred_date: preferred_date || 'Flexible', reference,
  }
  await Promise.all([
    sendEmail('service_request_user', email, vars, {
      subject: `Service request received — ${reference}`,
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for contacting THE AIRCONDITION SHOP. We have received your service request.</p>
        <p><strong>Reference: ${reference}</strong></p>
        <p><strong>Service type:</strong> ${service_type}<br>
           <strong>Address:</strong> ${address}<br>
           <strong>Preferred date:</strong> ${preferred_date || 'Flexible'}</p>
        <p>Our team will contact you within 2 business hours to confirm your appointment.</p>
        <p>If urgent, call us: <a href="tel:+35679661889">+356 7966 1889</a></p>
      `,
    }),
    sendEmail('service_request_admin', ADMIN_EMAIL, vars, {
      subject: `New service request ${reference} — ${service_type} from ${name}`,
      html: `
        <h2>New Service Request: ${reference}</h2>
        <table>
          <tr><td><strong>Name</strong></td><td>${name}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
          <tr><td><strong>Address</strong></td><td>${address}</td></tr>
          <tr><td><strong>Service type</strong></td><td>${service_type}</td></tr>
          <tr><td><strong>Preferred date</strong></td><td>${preferred_date || 'Flexible'}</td></tr>
          <tr><td><strong>Description</strong></td><td>${description}</td></tr>
        </table>
      `,
    }),
  ])
}

// ─── Service booked ───────────────────────────────────────────────────────────

export async function sendServiceBookedEmail({
  customerName, email, jobNumber, scheduledDate, scheduledTime, technicianName,
}: { customerName: string; email: string; jobNumber: string; scheduledDate: string; scheduledTime: string; technicianName: string }) {
  await sendEmail('service_booked_user', email, {
    customer_name: customerName, job_number: jobNumber,
    scheduled_date: scheduledDate, scheduled_time: scheduledTime, technician_name: technicianName,
  }, {
    subject: `Service booking confirmed — ${jobNumber}`,
    html: `<p>Dear ${customerName},</p><p>Your service booking (${jobNumber}) is confirmed for ${scheduledDate} at ${scheduledTime}.</p>`,
  })
}
