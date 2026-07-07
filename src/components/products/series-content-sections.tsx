import { Check, FileText, Download, ShieldCheck, Wrench, Package, Award, Plus } from 'lucide-react'
import { Reveal } from '@/components/motion/primitives'
import type { ProductSeries } from '@/types/database'

/** Renders the optional series content sections — each only when it has content. */
export default function SeriesContentSections({ series }: { series: ProductSeries }) {
  const faqs        = series.faqs ?? []
  const included    = series.whats_included ?? []
  const certs       = series.certifications ?? []
  const accessories = series.optional_accessories ?? []
  const documents   = (series.documents ?? []).slice().sort((a, b) => a.display_order - b.display_order)

  const hasAnything =
    included.length || certs.length || accessories.length || documents.length ||
    faqs.length || series.installation_info || series.warranty_info

  if (!hasAnything) return null

  return (
    <div className="mt-14 space-y-10">
      {/* What's included */}
      {included.length > 0 && (
        <Section icon={Package} title="What's included">
          <ul className="grid sm:grid-cols-2 gap-2">
            {included.map(i => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />{i}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Installation information */}
      {series.installation_info && (
        <Section icon={Wrench} title="Installation information">
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{series.installation_info}</p>
        </Section>
      )}

      {/* Optional accessories */}
      {accessories.length > 0 && (
        <Section icon={Plus} title="Optional accessories">
          <ul className="space-y-2">
            {accessories.map(a => (
              <li key={a.name} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span><span className="font-medium text-slate-800">{a.name}</span>{a.note ? ` — ${a.note}` : ''}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <Section icon={Award} title="Certifications & standards">
          <div className="flex flex-wrap gap-2">
            {certs.map(c => (
              <span key={c} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1.5" style={{ borderRadius: 2 }}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />{c}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Warranty */}
      {(series.warranty_info || series.warranty_years) && (
        <Section icon={ShieldCheck} title="Warranty">
          <p className="text-sm text-slate-600 leading-relaxed">
            {series.warranty_years ? `${series.warranty_years}-year warranty. ` : ''}{series.warranty_info ?? ''}
          </p>
        </Section>
      )}

      {/* Downloads / documents */}
      {documents.length > 0 && (
        <Section icon={Download} title="Downloads & documents">
          <ul className="divide-y divide-slate-100 border border-slate-200 overflow-hidden" style={{ borderRadius: 2 }}>
            {documents.map(d => (
              <li key={d.id}>
                <a href={d.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors duration-200">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 flex-1">{d.title}</span>
                  {d.file_type && <span className="text-[10px] uppercase font-semibold text-slate-400">{d.file_type}</span>}
                  <Download className="w-4 h-4 text-blue-500 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <Section icon={FileText} title="Frequently asked questions">
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group border border-slate-200 hover:border-slate-900 px-4 py-3 transition-colors duration-300" style={{ borderRadius: 2 }}>
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-slate-800 list-none">
                  {f.q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform duration-300">+</span>
                </summary>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({
              '@type': 'Question', name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }) }} />
        </Section>
      )}
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Reveal mode="up">
      <section>
        <h2 className="flex items-center gap-2 font-display text-xl text-slate-900 mb-4 tracking-[-0.01em]">
          <Icon className="w-4 h-4 text-slate-400" />{title}
        </h2>
        {children}
      </section>
    </Reveal>
  )
}
