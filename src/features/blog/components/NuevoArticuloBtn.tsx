'use client'

import Link from 'next/link'

export default function NuevoArticuloBtn() {
  return (
    <Link
      href="/dashboard/blog/nuevo"
      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors whitespace-nowrap"
    >
      + Nuevo artículo
    </Link>
  )
}
