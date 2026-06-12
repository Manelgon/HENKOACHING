import Link from 'next/link'

type CTAButtonProps = {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Sobre superficie ink los colores se invierten */
  onInk?: boolean
  className?: string
}

export default function CTAButton({
  href,
  children,
  variant = 'primary',
  onInk = false,
  className = '',
}: CTAButtonProps) {
  const base =
    'group inline-flex items-center gap-2.5 font-raleway font-semibold text-sm tracking-wide transition-all duration-300 ease-out-expo'

  const variants: Record<NonNullable<CTAButtonProps['variant']>, string> = {
    primary: onInk
      ? 'bg-henko-paper text-henko-ink px-8 py-4 rounded-full hover:shadow-lift hover:-translate-y-0.5'
      : 'bg-henko-turquoise text-white px-8 py-4 rounded-full hover:bg-henko-turquoise-light hover:shadow-lift hover:-translate-y-0.5',
    secondary: onInk
      ? 'border border-henko-paper/40 text-henko-paper px-8 py-4 rounded-full hover:border-henko-paper hover:bg-henko-paper/10'
      : 'border border-henko-hairline text-henko-ink px-8 py-4 rounded-full hover:border-henko-ink hover:bg-henko-ink/5',
    ghost: onInk
      ? 'text-henko-paper underline-offset-8 hover:underline'
      : 'text-henko-turquoise underline-offset-8 hover:underline',
  }

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  )
}
