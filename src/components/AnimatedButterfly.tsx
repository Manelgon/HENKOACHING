type Props = {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function AnimatedButterfly({ size = 72, className = '', style }: Props) {
  const s = size
  const stroke = '#1c1c1c'
  const sw = 1.8
  return (
    <div className={`butterfly-wrap pointer-events-none absolute ${className}`} style={style}>
      <svg width={s} height={s * 0.82} viewBox="0 0 80 66" fill="none">
        <g className="wing-left">
          <ellipse cx="26" cy="22" rx="22" ry="16" fill="#addbd2" fillOpacity="0.75" stroke={stroke} strokeWidth={sw} />
          <ellipse cx="22" cy="42" rx="16" ry="11" fill="#eddc88" fillOpacity="0.75" stroke={stroke} strokeWidth={sw} />
        </g>
        <g className="wing-right">
          <ellipse cx="54" cy="22" rx="22" ry="16" fill="#d69494" fillOpacity="0.7" stroke={stroke} strokeWidth={sw} />
          <ellipse cx="58" cy="42" rx="16" ry="11" fill="#958cba" fillOpacity="0.7" stroke={stroke} strokeWidth={sw} />
        </g>
        <ellipse cx="40" cy="34" rx="3.5" ry="14" fill={stroke} />
        <circle cx="40" cy="19" r="4" fill={stroke} />
        <path d="M39 16 Q32 6 26 3" stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <path d="M41 16 Q48 6 54 3" stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <circle cx="26" cy="3" r="2.5" fill={stroke} />
        <circle cx="54" cy="3" r="2.5" fill={stroke} />
      </svg>
    </div>
  )
}
