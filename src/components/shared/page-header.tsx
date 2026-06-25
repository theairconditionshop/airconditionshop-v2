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
        <p className="text-[11px] font-semibold text-sky-600 uppercase tracking-[0.22em] mb-3">{eyebrow}</p>
      )}
      <h1 className="font-display text-3xl lg:text-4xl xl:text-5xl text-slate-900 leading-tight">{title}</h1>
      {description && (
        <p className={`mt-4 text-slate-500 leading-relaxed max-w-2xl${center ? ' mx-auto' : ''}`}>{description}</p>
      )}
    </div>
  )
}
