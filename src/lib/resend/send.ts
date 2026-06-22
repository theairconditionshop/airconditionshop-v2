import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const FROM = 'THE AIRCONDITION SHOP <support@theairconditionshop.com>'

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
  const usingFallback = !template
  const subject = template ? interpolate(template.subject, vars) : fallback.subject
  const html = template ? interpolate(template.html_body, vars) : fallback.html

  console.log('[resend] Sending email — key:', key, 'to:', to, 'template:', usingFallback ? 'fallback' : 'db')

  const { data, error } = await getResend().emails.send({ from: FROM, to, subject, html })

  if (error) {
    console.error('[resend] emails.send failed — key:', key, 'to:', to, 'error:', JSON.stringify(error))
    throw new Error(`Resend API error: ${error.message ?? JSON.stringify(error)}`)
  }

  console.log('[resend] Email sent successfully — key:', key, 'messageId:', data?.id)
}

// ── Specific senders ────────────────────────────────────────

export async function sendOtpEmail({ email, name, code }: { email: string; name: string; code: string }) {
  await sendEmail(
    'otp_code',
    email,
    { code, name },
    {
      subject: 'Your login verification code — THE AIRCONDITION SHOP',
      html: `<p>Your verification code is:</p><h1 style="font-size:48px;letter-spacing:8px;font-weight:bold;">${code}</h1><p>Expires in 10 minutes.</p>`,
    }
  )
}

export async function sendContactEnquiryEmails({
  name, email, phone, company, message,
}: { name: string; email: string; phone?: string; company?: string; message: string }) {
  const vars = { name, email, phone: phone || '', company: company || '', message }
  await Promise.all([
    sendEmail('contact_enquiry_user', email, vars, {
      subject: 'We received your message — THE AIRCONDITION SHOP',
      html: `<p>Dear ${name},</p><p>Thank you for contacting us. We will be in touch shortly.</p>`,
    }),
    sendEmail('contact_enquiry_admin', process.env.RESEND_ADMIN_EMAIL || 'support@theairconditionshop.com', vars, {
      subject: `New contact enquiry from ${name}`,
      html: `<p>From: ${name} (${email})</p><p>${message}</p>`,
    }),
  ])
}

export async function sendQuoteRequestEmails({
  name, email, company, message,
}: { name: string; email: string; company?: string; message: string }) {
  const vars = { name, email, company: company || '', message }
  await Promise.all([
    sendEmail('quote_request_user', email, vars, {
      subject: 'Your quote request — THE AIRCONDITION SHOP',
      html: `<p>Dear ${name},</p><p>Thank you for your quote request. We will send you a detailed quote within 2 business days.</p>`,
    }),
    sendEmail('quote_request_admin', process.env.RESEND_ADMIN_EMAIL || 'support@theairconditionshop.com', vars, {
      subject: `New quote request from ${name}`,
      html: `<p>New quote request from ${name} (${email})</p>`,
    }),
  ])
}

export async function sendTradeApplicationEmails({
  name, email, companyName,
}: { name: string; email: string; companyName: string }) {
  const vars = { name, email, company_name: companyName }
  await Promise.all([
    sendEmail('trade_application_user', email, vars, {
      subject: 'Trade application received — THE AIRCONDITION SHOP',
      html: `<p>Dear ${name},</p><p>We received your trade application and will review it within 2 business days.</p>`,
    }),
    sendEmail('trade_application_admin', process.env.RESEND_ADMIN_EMAIL || 'support@theairconditionshop.com', vars, {
      subject: `New trade application from ${companyName}`,
      html: `<p>Trade application from ${name} at ${companyName} (${email})</p>`,
    }),
  ])
}

export async function sendTradeApprovedEmail({ name, email }: { name: string; email: string }) {
  await sendEmail('trade_approved', email, { name, email }, {
    subject: 'Your trade account has been approved',
    html: `<p>Dear ${name},</p><p>Your trade account has been approved. You can now view trade prices by logging in.</p>`,
  })
}

export async function sendTradeRejectedEmail({ name, email, reason }: { name: string; email: string; reason?: string }) {
  await sendEmail('trade_rejected', email, { name, reason: reason || '' }, {
    subject: 'Regarding your trade application',
    html: `<p>Dear ${name},</p><p>We are unable to approve your application at this time. Please contact us for more information.</p>`,
  })
}

export async function sendPasswordResetEmail({ name, email, resetUrl }: { name: string; email: string; resetUrl: string }) {
  await sendEmail('password_reset', email, { name, reset_url: resetUrl }, {
    subject: 'Reset your password',
    html: `<p>Dear ${name},</p><p><a href="${resetUrl}">Click here</a> to reset your password. Link expires in 1 hour.</p>`,
  })
}

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

export async function sendServiceRequestEmails({
  name, email, phone, address, service_type, description, preferred_date, reference,
}: {
  name: string; email: string; phone: string; address: string
  service_type: string; description: string; preferred_date: string | null; reference: string
}) {
  const vars = {
    name, email, phone, address,
    service_type, description,
    preferred_date: preferred_date || 'Flexible',
    reference,
  }
  await Promise.all([
    // Customer confirmation
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
        <p>THE AIRCONDITION SHOP</p>
      `,
    }),
    // Admin notification
    sendEmail(
      'service_request_admin',
      process.env.RESEND_ADMIN_EMAIL || 'support@theairconditionshop.com',
      vars,
      {
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
      }
    ),
  ])
}

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
