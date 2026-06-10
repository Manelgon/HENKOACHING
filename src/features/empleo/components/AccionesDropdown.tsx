'use client'

import { useRouter } from 'next/navigation'
import AccionesMenu, { type AccionItem } from '@/shared/components/AccionesMenu'

type Props = {
  onAgendar: () => void
  onDescargarCv?: () => void   // undefined si el candidato no tiene CV
  trayectoriaUrl: string       // /api/dashboard/candidatos/{id}/pdf
  tieneTrayectoria: boolean     // bloquea "Descargar trayectoria" si está vacía
  perfilUrl: string            // /dashboard/candidatos/{id}
}

export default function AccionesDropdown({ onAgendar, onDescargarCv, trayectoriaUrl, tieneTrayectoria, perfilUrl }: Props) {
  const router = useRouter()

  const items: AccionItem[] = [
    {
      label: 'Agendar cita',
      onClick: onAgendar,
      iconPath: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    },
    onDescargarCv
      ? { label: 'Descargar CV', onClick: onDescargarCv, iconPath: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3' }
      : { label: 'Sin CV', disabled: true, disabledHint: 'El candidato no adjuntó CV', iconPath: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3' },
    tieneTrayectoria
      ? { label: 'Descargar trayectoria', onClick: () => window.open(trayectoriaUrl, '_blank', 'noopener'), iconPath: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' }
      : { label: 'Trayectoria', disabled: true, disabledHint: 'El candidato aún no ha rellenado su trayectoria', iconPath: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    {
      label: 'Ver perfil completo',
      onClick: () => router.push(perfilUrl),
      iconPath: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0v.75H4.5v-.75z',
      divider: true,
    },
  ]

  return <AccionesMenu items={items} />
}
