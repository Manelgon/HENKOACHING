type Props = {
  overline: string
  title: React.ReactNode
  subtitle?: string
  /** Kept for backwards compatibility; no longer used. The header now follows a unified clean style. */
  bgClass?: string
  /** Kept for backwards compatibility; no longer used. */
  dark?: boolean
}

export default function PageHeader({ overline, title, subtitle }: Props) {
  return (
    <section className="px-6 md:px-12 pt-16 md:pt-20 pb-12 md:pb-16">
      <div className="max-w-3xl mx-auto text-center">
        <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-5 flex items-center justify-center gap-3">
          <span className="inline-block w-9 h-px bg-current opacity-60" aria-hidden="true" />
          {overline}
          <span className="inline-block w-9 h-px bg-current opacity-60" aria-hidden="true" />
        </p>
        <h1 data-animate data-delay="100" className={`font-roxborough font-black text-display-xl text-henko-ink ${subtitle ? 'mb-6' : ''}`}>
          {title}
        </h1>
        {subtitle && (
          <p data-animate data-delay="200" className="font-raleway text-lg leading-relaxed text-henko-ink-soft max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
