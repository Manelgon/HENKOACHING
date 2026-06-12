type SectionHeadingProps = {
  /** Etiqueta pequeña en mayúsculas sobre el titular */
  overline?: string
  /** Titular serif; string o líneas para el reveal enmascarado */
  title: string | string[]
  /** Párrafo introductorio opcional bajo el titular */
  lead?: string
  align?: 'left' | 'center'
  /** Nivel del heading para jerarquía semántica */
  as?: 'h1' | 'h2' | 'h3'
  /** Acento cromático del overline (disciplina: 1 por sección) */
  accent?: 'turquoise' | 'purple' | 'coral' | 'orange'
  className?: string
}

const accentText: Record<NonNullable<SectionHeadingProps['accent']>, string> = {
  turquoise: 'text-henko-turquoise',
  purple: 'text-henko-purple',
  coral: 'text-henko-coral',
  orange: 'text-henko-orange',
}

export default function SectionHeading({
  overline,
  title,
  lead,
  align = 'left',
  as: Tag = 'h2',
  accent = 'turquoise',
  className = '',
}: SectionHeadingProps) {
  const lines = Array.isArray(title) ? title : [title]
  const alignClasses = align === 'center' ? 'text-center mx-auto' : 'text-left'

  return (
    <div className={`max-w-3xl ${alignClasses} ${className}`}>
      {overline && (
        <p
          data-animate="fade"
          className={`font-raleway font-semibold uppercase text-overline ${accentText[accent]} mb-4 flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}
        >
          <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
          {overline}
        </p>
      )}
      <Tag
        data-animate="reveal"
        className={`font-roxborough text-henko-ink ${Tag === 'h1' ? 'text-display-2xl font-black' : 'text-display-lg font-bold'}`}
      >
        {lines.map((line) => (
          <span key={line} className="reveal-line">
            <span className="reveal-inner">{line}</span>
          </span>
        ))}
      </Tag>
      {lead && (
        <p data-animate data-delay="200" className="mt-6 text-lg text-henko-ink-soft leading-relaxed">
          {lead}
        </p>
      )}
    </div>
  )
}
