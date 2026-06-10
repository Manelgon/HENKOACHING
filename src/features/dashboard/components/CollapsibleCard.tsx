'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'

type Props = {
  title: string
  count?: number
  href: string
  linkLabel?: string
  icon: string
  iconBg: string
  iconColor: string
  children: ReactNode
}

export default function CollapsibleCard({ title, count = 0, href, linkLabel = 'Ver todas →', icon, iconBg, iconColor, children }: Props) {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 h-fit">
      <div className={`flex items-center justify-between ${open ? 'mb-4' : ''}`}>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2.5 group"
          aria-expanded={open}
        >
          <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
            <svg className={`w-4 h-4 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
          <h2 className="font-roxborough text-lg text-gray-900">{title}</h2>
          {count > 0 && (
            <span className={`text-[10px] font-bold ${iconColor} ${iconBg} px-2 py-0.5 rounded-full`}>{count}</span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        <Link href={href} className="text-xs font-raleway text-henko-turquoise hover:underline">{linkLabel}</Link>
      </div>
      {open && children}
    </div>
  )
}
