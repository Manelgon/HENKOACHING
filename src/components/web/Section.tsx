type SectionProps = {
  children: React.ReactNode
  /** Superficie de fondo de la sección */
  surface?: 'paper' | 'paper-deep' | 'card' | 'ink'
  /** Hairline superior para separar secciones sin cambiar de fondo */
  hairline?: boolean
  id?: string
  className?: string
}

const surfaceClasses: Record<NonNullable<SectionProps['surface']>, string> = {
  paper: 'bg-henko-paper text-henko-ink',
  'paper-deep': 'bg-henko-paper-deep text-henko-ink',
  card: 'bg-henko-card text-henko-ink',
  ink: 'bg-henko-ink text-henko-paper',
}

export default function Section({
  children,
  surface = 'paper',
  hairline = false,
  id,
  className = '',
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${surfaceClasses[surface]} ${hairline ? 'hairline-t' : ''} py-20 md:py-28 ${className}`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">{children}</div>
    </section>
  )
}
