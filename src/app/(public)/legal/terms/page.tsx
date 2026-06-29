import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and Conditions for THE AIRCONDITION SHOP — your rights and obligations when using our website and services.',
  alternates: { canonical: 'https://www.theairconditionshop.com/legal/terms' },
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-white pt-20 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="py-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Legal</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms &amp; Conditions</h1>
            <p className="text-sm text-slate-500">Last updated: June 2026</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
              <p className="leading-relaxed">
                These Terms and Conditions govern your use of the THE AIRCONDITION SHOP website and our supply of goods and services.
                THE AIRCONDITION SHOP is the trading name of <strong>AS GROUP</strong> (VAT: MT3103-8724),
                registered in Malta and operating from 220 Vjal L-Indipendenza, Mosta MST 9022, Malta.
                By using this website or placing an order, you agree to be bound by these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Products and Pricing</h2>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>All prices displayed are in Euros (€) and inclusive of Malta VAT unless stated otherwise</li>
                <li>Prices are subject to change without notice</li>
                <li>Trade prices are available only to approved trade account holders</li>
                <li>Product availability is subject to stock and supplier lead times</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Orders and Quotations</h2>
              <p className="leading-relaxed">Quote requests submitted through our website are not binding orders. A binding contract is formed only when we confirm your order in writing. We reserve the right to decline any order or quotation request.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Installation Services</h2>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>All installations are carried out by our certified engineers</li>
                <li>The customer is responsible for ensuring safe site access and adequate electrical supply</li>
                <li>Variation in site conditions may affect the final installation cost</li>
                <li>Warranty on installation workmanship is 12 months from the date of completion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Warranties</h2>
              <p className="leading-relaxed">Products sold by THE AIRCONDITION SHOP carry the manufacturer&apos;s standard warranty. Warranty claims must be submitted through us; we will liaise with the manufacturer on your behalf. Warranties do not cover damage caused by misuse, improper installation by third parties, or failure to service the equipment as recommended.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Limitation of Liability</h2>
              <p className="leading-relaxed">To the fullest extent permitted by law, THE AIRCONDITION SHOP shall not be liable for any indirect, incidental, or consequential losses arising from the use of our products or services. Our total liability shall not exceed the value of the goods or services provided.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Intellectual Property</h2>
              <p className="leading-relaxed">All content on this website — including text, images, logos, and design — is the property of THE AIRCONDITION SHOP or its licensors and may not be reproduced without prior written consent.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Governing Law</h2>
              <p className="leading-relaxed">These terms are governed by the laws of Malta. Any disputes shall be subject to the exclusive jurisdiction of the Maltese courts.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Contact</h2>
              <p className="leading-relaxed">For questions about these terms:<br />
                <strong>Email:</strong> support@theairconditionshop.com<br />
                <strong>Phone:</strong> +356 7966 1889
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
