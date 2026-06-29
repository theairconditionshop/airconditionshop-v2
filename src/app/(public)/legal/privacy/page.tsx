import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for THE AIRCONDITION SHOP — how we collect, use, and protect your data.',
  alternates: { canonical: 'https://www.theairconditionshop.com/legal/privacy' },
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-white pt-20 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="py-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
            <p className="text-sm text-slate-500">Last updated: June 2026</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Who We Are</h2>
              <p className="leading-relaxed">
                THE AIRCONDITION SHOP is the trading name of <strong>AS GROUP</strong> (VAT: MT3103-8724),
                a Malta-registered HVAC and refrigeration retailer and installer, operating at
                220 Vjal L-Indipendenza, Mosta MST 9022, Malta.
                We are the data controller for personal information collected through this website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>Contact details (name, email, phone number) when you submit an enquiry or quote request</li>
                <li>Company information for trade account applications</li>
                <li>Usage data collected automatically via cookies and analytics</li>
                <li>Communication records when you contact us by email or phone</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>To respond to enquiries and provide quotations</li>
                <li>To process trade account applications</li>
                <li>To fulfil orders and coordinate installations</li>
                <li>To send service-related communications</li>
                <li>To improve our website and services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Legal Basis</h2>
              <p className="leading-relaxed">We process your personal data on the basis of: your consent, performance of a contract, compliance with a legal obligation, or our legitimate interests in running and improving our business — in accordance with the General Data Protection Regulation (GDPR).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Data Retention</h2>
              <p className="leading-relaxed">We retain personal data only as long as necessary for the purposes described in this policy, or as required by law. Enquiry data is typically retained for up to 3 years. You may request deletion at any time.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Your Rights</h2>
              <p className="leading-relaxed mb-2">Under GDPR you have the right to:</p>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request erasure of your data</li>
                <li>Object to processing or request restriction</li>
                <li>Data portability</li>
                <li>Lodge a complaint with the Information and Data Protection Commissioner (Malta)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Cookies</h2>
              <p className="leading-relaxed">We use essential cookies required for the website to function and analytics cookies to understand how visitors use our site. You may disable non-essential cookies in your browser settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Contact Us</h2>
              <p className="leading-relaxed">For any data protection queries or to exercise your rights, contact us at:<br />
                <strong>Email:</strong> support@theairconditionshop.com<br />
                <strong>Phone:</strong> +356 7966 1889<br />
                <strong>Address:</strong> 220 Vjal L-Indipendenza, Mosta MST 9022, Malta
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
