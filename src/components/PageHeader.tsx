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
    <section className="bg-white border-b border-gray-100 px-6 md:px-12 pt-14 pb-10">
      <div className="max-w-7xl mx-auto">
        <p className="font-raleway font-bold tracking-[0.18em] uppercase text-[11px] mb-4 text-henko-turquoise">
          {overline}
        </p>
        <h1 className={`font-roxborough text-3xl md:text-4xl leading-tight text-gray-900 ${subtitle ? 'mb-5' : ''}`}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg leading-relaxed text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
