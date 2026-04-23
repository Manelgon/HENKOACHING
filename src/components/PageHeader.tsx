type Props = {
  overline: string
  title: React.ReactNode
  subtitle?: string
  bgClass?: string
  dark?: boolean
}

export default function PageHeader({
  overline,
  title,
  subtitle,
  bgClass = 'bg-henko-turquoise',
  dark = true,
}: Props) {
  const overlineColor = dark ? 'text-white/60' : 'text-henko-turquoise'
  const titleColor = dark ? 'text-white' : 'text-gray-900'
  const subtitleColor = dark ? 'text-white/75' : 'text-gray-600'
  const blobFill = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
  const blobFill2 = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'

  return (
    <section className={`relative overflow-hidden px-6 md:px-12 pt-16 pb-20 rounded-b-[3rem] ${bgClass}`}>
      <div
        className="absolute pointer-events-none"
        style={{
          width: 320, height: 416, top: -80, right: -60,
          background: blobFill,
          borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 200, height: 260, bottom: -40, left: 40,
          background: blobFill2,
          borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
        }}
      />
      <div className="relative z-10 max-w-3xl">
        <p className={`font-raleway font-bold tracking-[0.18em] uppercase text-[11px] mb-4 ${overlineColor}`}>
          {overline}
        </p>
        <h1 className={`font-roxborough text-4xl md:text-5xl leading-tight ${titleColor} ${subtitle ? 'mb-5' : ''}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`text-lg leading-relaxed max-w-2xl ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
