import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { tradeEmailTemplate, p, infoBlock, noticeBox } from './templates'

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

  const { data, error } = await getResend().emails.send({ from: FROM, to, subject, html })

  if (error) {
    console.error('[resend] emails.send failed — key:', key, 'to:', to, 'error:', JSON.stringify(error))
    throw new Error(`Resend API error: ${error.message ?? JSON.stringify(error)}`)
  }

  console.log('[resend] Email sent — key:', key, 'messageId:', data?.id)
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

export async function sendOtpEmail({ email, name, code }: { email: string; name: string; code: string }) {
  await sendEmail('otp_code', email, { code, name }, {
    subject: 'Your login verification code — THE AIRCONDITION SHOP',
    html: tradeEmailTemplate({
      preheader: `Your verification code is ${code}`,
      heading: 'Verification Code',
      bodyHtml:
        p(`Hi ${name},`) +
        p('Use the code below to complete your sign-in. It expires in <strong>10 minutes</strong>.') +
        `<div style="text-align:center;margin:24px 0 28px;">
           <span style="display:inline-block;font-size:36px;font-weight:700;letter-spacing:10px;color:#0f172a;font-family:monospace;">${code}</span>
         </div>` +
        p('If you did not request this, you can safely ignore this email.'),
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
  await Promise.all([
    sendEmail('trade_application_user', email, vars, {
      subject: 'Trade Account Application Received — THE AIRCONDITION SHOP',
      html: tradeEmailTemplate({
        preheader: 'We received your trade account application and will review it within 2 business days.',
        heading: 'Application Received',
        subheading: 'Thank you for applying to our Trade Programme',
        bodyHtml:
          p(`Hi ${name},`) +
          p(`We've received your trade account application for <strong>${companyName}</strong> and it's now under review.`) +
          infoBlock([
            { label: 'Status',   value: 'Under Review' },
            { label: 'Timeline', value: 'We aim to review all applications within 2 business days' },
          ]) +
          p('Our team will verify your business details and contact you with a decision. You will receive a confirmation email once your account is approved.') +
          p('In the meantime, feel free to browse our full product catalogue or contact us if you have any questions.'),
        ctaText: 'Browse Products',
        ctaUrl:  `${SITE_URL}/products`,
      }),
    }),
    sendEmail('trade_application_admin', ADMIN_EMAIL, vars, {
      subject: `New trade application — ${companyName}`,
      html: tradeEmailTemplate({
        preheader: `${name} from ${companyName} has submitted a trade account application.`,
        heading: 'New Trade Application',
        bodyHtml:
          p(`A new trade account application has been submitted.`) +
          infoBlock([
            { label: 'Applicant',    value: name },
            { label: 'Email',        value: email },
            { label: 'Company',      value: companyName },
          ]),
        ctaText: 'Review Application',
        ctaUrl:  `${SITE_URL}/admin/trade`,
      }),
    }),
  ])
}

// ─── Trade: Approved ─────────────────────────────────────────────────────────

export async function sendTradeApprovedEmail({ name, email, companyName }: { name: string; email: string; companyName?: string }) {
  await sendEmail('trade_approved', email, { name, email, company_name: companyName || '' }, {
    subject: 'Your Trade Account has been Approved — THE AIRCONDITION SHOP',
    html: tradeEmailTemplate({
      preheader: 'Congratulations — your trade account is now active.',
      heading: 'Trade Account Approved',
      subheading: 'Welcome to the Trade Programme',
      bodyHtml:
        p(`Hi ${name},`) +
        p(`Great news — your trade account${companyName ? ` for <strong>${companyName}</strong>` : ''} has been approved.`) +
        noticeBox('Your account is now active. You have full access to trade pricing, exclusive stock and priority support.', 'blue') +
        p('Log in to your account to start browsing trade prices and placing orders.') +
        p('If you have any questions or need help getting started, our team is here to help.'),
      ctaText: 'Access Trade Dashboard',
      ctaUrl:  `${SITE_URL}/trade/dashboard`,
    }),
  })
}

// ─── Trade: Rejected ─────────────────────────────────────────────────────────

export async function sendTradeRejectedEmail({
  name, email, companyName, reason,
}: { name: string; email: string; companyName?: string; reason?: string }) {
  await sendEmail('trade_rejected', email, { name, email, company_name: companyName || '', reason: reason || '' }, {
    subject: 'Trade Account Application Update — THE AIRCONDITION SHOP',
    html: tradeEmailTemplate({
      preheader: 'An update on your trade account application.',
      heading: 'Application Update',
      bodyHtml:
        p(`Hi ${name},`) +
        p(`Thank you for your interest in our Trade Programme${companyName ? ` and for applying on behalf of <strong>${companyName}</strong>` : ''}.`) +
        p('After reviewing your application, we are unable to approve a trade account at this time.') +
        (reason
          ? noticeBox(`<strong>Reason:</strong> ${reason}`, 'amber')
          : '') +
        p('We understand this may be disappointing. If your circumstances change or you believe there has been an error, please don\'t hesitate to contact us — we\'re happy to discuss your application.') +
        p('You are welcome to reapply in the future, and we encourage you to reach out to our team directly if you have any questions.'),
      ctaText: 'Contact Us',
      ctaUrl:  `${SITE_URL}/contact`,
    }),
  })
}

// ─── Trade: Suspended ────────────────────────────────────────────────────────

export async function sendTradeSuspendedEmail({
  name, email, companyName, reason,
}: { name: string; email: string; companyName?: string; reason?: string }) {
  await sendEmail('trade_suspended', email, { name, email, company_name: companyName || '', reason: reason || '' }, {
    subject: 'Your Trade Account has been Suspended — THE AIRCONDITION SHOP',
    html: tradeEmailTemplate({
      preheader: 'Your trade account access has been temporarily suspended.',
      heading: 'Account Suspended',
      bodyHtml:
        p(`Hi ${name},`) +
        p(`Your trade account${companyName ? ` for <strong>${companyName}</strong>` : ''} has been temporarily suspended.`) +
        (reason
          ? noticeBox(`<strong>Reason:</strong> ${reason}`, 'amber')
          : noticeBox('Access to trade pricing and your trade dashboard has been temporarily disabled.', 'amber')) +
        p('If you believe this is an error or would like to discuss your account, please contact our support team directly. We\'re committed to resolving any issues promptly.') +
        p('We hope to restore your full account access as quickly as possible.'),
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
