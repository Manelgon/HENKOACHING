type Props = { msg?: string | null }

export function FormError({ msg }: Props) {
  if (!msg) return null
  return (
    <div className="flex items-center gap-1.5 mt-1.5 mb-0.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} className="flex-shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-xs font-semibold text-red-600 font-raleway">{msg}</p>
    </div>
  )
}

export function FormErrorBanner({ msg }: Props) {
  if (!msg) return null
  return (
    <div className="flex items-start gap-2.5 mb-5 bg-red-50 border-[1.5px] border-red-200 rounded-2xl px-4 py-3.5">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2.5} className="flex-shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-[13px] text-red-600 font-raleway leading-snug">{msg}</p>
    </div>
  )
}
