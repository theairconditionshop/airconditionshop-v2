import { Reveal } from '@/components/motion/primitives'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  center?: boolean
}

export default function PageHeader({ eyebrow, title, description, center = false }: PageHeaderProps) {
  return (
    <div className={center ? 'text-center' : ''}>
      {eyebrow && (
        <Reveal mode="up">
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.28em] mb-4">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal mode="blur" delay={0.05}>
        <h1 className="font-display text-4xl lg:text-5xl tracking-[-0.02em] text-slate-900 leading-[1.05]">{title}</h1>
      </Reveal>
      {description && (
        <Reveal mode="up" delay={0.1}>
          <p className={`mt-5 text-slate-500 leading-relaxed max-w-2xl text-lg${center ? ' mx-auto' : ''}`}>{description}</p>
        </Reveal>
      )}
    </div>
  )
}
