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
        <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">{eyebrow}</p>
      )}
      <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">{title}</h1>
      {description && (
        <p className="mt-3 text-slate-500 leading-relaxed max-w-2xl">{description}</p>
      )}
    </div>
  )
}
