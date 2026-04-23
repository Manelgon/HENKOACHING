const TURQUOISE = '#1f8f9b'
const GREENBLUE = '#addbd2'
const YELLOW = '#eddc88'
const PURPLE = '#958cba'
const CORAL = '#d69494'

const svgStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
}

export function AvanceSVG() {
  return (
    <svg viewBox="0 0 220 200" fill="none" preserveAspectRatio="xMidYMid meet" style={svgStyle}>
      <path d="M30 140 Q50 80 60 120 Q70 160 90 100 Q110 40 120 90 Q130 130 150 70 Q165 30 180 60"
        stroke={TURQUOISE} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M160 150 L175 80 L190 150" stroke={CORAL} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M175 80 L160 105 M175 80 L190 105" stroke={CORAL} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="80" cy="160" rx="28" ry="14" fill={YELLOW} opacity="0.5" />
      <ellipse cx="148" cy="162" rx="20" ry="12" fill={GREENBLUE} opacity="0.45" />
      <circle cx="50" cy="90" r="11" fill={PURPLE} opacity="0.3" />
    </svg>
  )
}

export function RolesSVG() {
  return (
    <svg viewBox="0 0 220 200" fill="none" preserveAspectRatio="xMidYMid meet" style={svgStyle}>
      <circle cx="110" cy="100" r="22" fill="none" stroke={TURQUOISE} strokeWidth="2" strokeDasharray="5 4" opacity="0.7" />
      <circle cx="48" cy="55" r="14" fill={CORAL} opacity="0.55" />
      <circle cx="175" cy="50" r="12" fill={GREENBLUE} opacity="0.6" />
      <circle cx="45" cy="150" r="16" fill={PURPLE} opacity="0.4" />
      <circle cx="178" cy="148" r="13" fill={YELLOW} opacity="0.6" />
      <line x1="48" y1="65" x2="93" y2="90" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="175" y1="60" x2="130" y2="88" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="55" y1="142" x2="92" y2="115" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="168" y1="140" x2="130" y2="115" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
  )
}

export function PospuestosSVG() {
  return (
    <svg viewBox="0 0 220 200" fill="none" preserveAspectRatio="xMidYMid meet" style={svgStyle}>
      <path d="M160 100 A55 55 0 1 0 110 155" stroke={TURQUOISE} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M110 155 L95 138 M110 155 L128 143" stroke={TURQUOISE} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="95" y="62" width="14" height="36" rx="5" fill={CORAL} opacity="0.7" />
      <rect x="116" y="62" width="14" height="36" rx="5" fill={CORAL} opacity="0.7" />
      <ellipse cx="55" cy="150" rx="26" ry="14" fill={YELLOW} opacity="0.4" />
      <circle cx="170" cy="155" r="14" fill={GREENBLUE} opacity="0.4" />
    </svg>
  )
}

export function ReactivoSVG() {
  return (
    <svg viewBox="0 0 220 200" fill="none" preserveAspectRatio="xMidYMid meet" style={svgStyle}>
      <ellipse cx="110" cy="105" rx="68" ry="52" stroke={TURQUOISE} strokeWidth="2.5"
        strokeDasharray="6 5" fill="none" opacity="0.6" />
      <path d="M122 42 L96 102 L118 102 L88 168" stroke={CORAL} strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="48" cy="80" r="9" fill={YELLOW} opacity="0.7" />
      <circle cx="170" cy="72" r="7" fill={GREENBLUE} opacity="0.7" />
      <circle cx="165" cy="142" r="11" fill={PURPLE} opacity="0.4" />
      <circle cx="44" cy="138" r="8" fill={CORAL} opacity="0.35" />
    </svg>
  )
}
