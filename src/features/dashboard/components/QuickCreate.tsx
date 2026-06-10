'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCalendario } from '@/features/calendario/hooks/useCalendario'
import EventoModal from '@/features/calendario/components/EventoModal'
import NewClienteModal from '@/features/clientes/components/NewClienteModal'
import NuevaFacturaModal, { type FacturaRectificableOption } from '@/features/facturas/components/NuevaFacturaModal'
import NuevaOfertaDrawer, { type Catalogo, type EmpresaOption } from '@/features/empleo/components/NuevaOfertaDrawer'
import { getCalendars, type CalendarMeta } from '@/actions/google-calendar'
import type { ClienteOption } from '@/app/(main)/dashboard/facturas/page'

type Modal = 'oferta' | 'cliente' | 'factura' | null

type Props = {
  clientes: ClienteOption[]
  facturasRectificables: FacturaRectificableOption[]
  serieDefault: string
  sectores: Catalogo[]
  modalidades: Catalogo[]
  jornadas: Catalogo[]
  empresas: EmpresaOption[]
}

// Accesos rápidos del panel: cada botón abre su formulario de creación
// (los mismos drawers/modales de cada sección) sin salir del inicio.
export default function QuickCreate({ clientes, facturasRectificables, serieDefault, sectores, modalidades, jornadas, empresas }: Props) {
  const router = useRouter()
  const cal = useCalendario([])
  const [calendars, setCalendars] = useState<CalendarMeta[]>([])
  const [modal, setModal] = useState<Modal>(null)

  useEffect(() => {
    getCalendars().then(setCalendars).catch(() => {})
  }, [])

  const openCalendario = (tab?: 'tarea') => {
    const now = new Date()
    const start = now.toISOString().slice(0, 16)
    const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
    cal.openCreate(start, end, false, tab)
  }

  return (
    <>
      <QuickButton
        onClick={() => setModal('oferta')}
        icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        label="Nueva oferta"
      />
      <QuickButton
        onClick={() => setModal('cliente')}
        icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        label="Nuevo cliente"
      />
      <QuickButton
        onClick={() => setModal('factura')}
        icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        label="Nueva factura"
      />
      <QuickButton
        onClick={() => openCalendario()}
        icon="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M12 12.75v3m1.5-1.5h-3"
        label="Nueva cita"
      />
      <QuickButton
        onClick={() => openCalendario('tarea')}
        icon="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        label="Nueva tarea"
      />

      {modal === 'oferta' && (
        <NuevaOfertaDrawer
          sectores={sectores}
          modalidades={modalidades}
          jornadas={jornadas}
          empresas={empresas}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'cliente' && (
        <NewClienteModal
          onClose={() => setModal(null)}
          onCreated={() => { setModal(null); router.refresh() }}
        />
      )}

      {modal === 'factura' && (
        <NuevaFacturaModal
          clientes={clientes}
          facturasRectificables={facturasRectificables}
          serieDefault={serieDefault}
          onClose={() => setModal(null)}
          onCreated={() => { setModal(null); router.refresh() }}
        />
      )}

      <EventoModal
        modal={cal.modal}
        onClose={cal.closeModal}
        onCreate={cal.handleCreate}
        onUpdate={cal.handleUpdate}
        onDelete={cal.handleDelete}
        calendars={calendars}
      />

      {cal.error && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 shadow-lg">
          <p className="font-raleway text-sm text-red-500">{cal.error}</p>
        </div>
      )}
    </>
  )
}

function QuickButton({ onClick, icon, label }: { onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-2.5 hover:shadow-md hover:border-henko-greenblue hover:bg-henko-greenblue/5 transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-henko-turquoise/10 flex items-center justify-center group-hover:bg-henko-turquoise/20 transition-colors">
        <svg className="w-5 h-5 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <span className="font-raleway text-xs font-semibold text-gray-700 group-hover:text-henko-turquoise transition-colors text-center">{label}</span>
    </button>
  )
}
