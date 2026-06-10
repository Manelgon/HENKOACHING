'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import { cambiarEstadoCliente, eliminarCliente, restaurarCliente } from '@/actions/clientes'
import ClienteFicha, { type Cliente } from './ClienteFicha'
import ClienteNotas from './ClienteNotas'
import ClienteArchivos from './ClienteArchivos'
import ClienteFacturas from './ClienteFacturas'
import ClienteOfertas from './ClienteOfertas'
import {
  ESTADOS_CLIENTE, getEstadoClienteMeta, getServicioLabel, getTarifaLabel, formatImporte,
} from './estados'
import { getOrigenLabel } from '@/features/leads/components/estados'
import AccionesMenu, { type AccionItem } from '@/shared/components/AccionesMenu'
import AgendarCitaModal from '@/shared/components/AgendarCitaModal'
import CitasHistorial from '@/shared/components/CitasHistorial'
import { useUrlState } from '@/shared/hooks/useUrlState'
import type { EstadoCliente } from '@/lib/supabase/database.types'
import { TIPOS_CITA, TIPOS_TAREA } from '@/shared/lib/tipos-cita'

type Nota = { id: string; contenido: string; created_at: string | null; autor_email: string | null }
type Archivo = { id: string; nombre_archivo: string; storage_path: string; tipo: string; tamano_bytes: number | null; created_at: string | null }
type Factura = { id: string; numero: string | null; fecha_emision: string | null; total: number | null; estado: string }
type OfertaRow = {
  id: string; titulo: string; estado: string; fecha_publicacion: string | null
  solicitudes: { id: string; estado: string; created_at: string | null; candidato_profiles: { profiles: { nombre: string | null; apellidos: string | null; email: string } | null } | null }[]
}

type Tab = 'facturas' | 'empleo' | 'citas' | 'archivos' | 'notas'

type Props = {
  cliente: Cliente
  notas: Nota[]
  archivos: Archivo[]
  facturas: Factura[]
  ofertas: OfertaRow[]
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'facturas', label: 'Facturas' },
  { id: 'empleo',   label: 'Empleo' },
  { id: 'citas',    label: 'Citas' },
  { id: 'archivos', label: 'Archivos' },
  { id: 'notas',    label: 'Notas' },
]

export default function ClienteDetalleLayout({ cliente, notas, archivos, facturas, ofertas }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()
  const [tab, setTab] = useUrlState<Tab>('tab', 'facturas', TABS.map(t => t.id))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [agendarOpen, setAgendarOpen] = useState(false)
  const [estadoOpen, setEstadoOpen] = useState(false)
  const [estadoPos, setEstadoPos] = useState({ top: 0, left: 0 })
  const estadoBtnRef = useRef<HTMLButtonElement>(null)
  const estadoMenuRef = useRef<HTMLDivElement>(null)

  const estadoMeta = getEstadoClienteMeta(cliente.estado)
  const inicial = (cliente.nombre?.[0] ?? '?').toUpperCase()

  // Cerrar dropdown estado al click fuera
  useEffect(() => {
    if (!estadoOpen) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (!estadoBtnRef.current?.contains(t) && !estadoMenuRef.current?.contains(t)) setEstadoOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [estadoOpen])

  // Bloquear scroll cuando drawer abierto
  useEffect(() => {
    if (!drawerOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey) }
  }, [drawerOpen])

  function handleEstadoOpen() {
    if (estadoBtnRef.current) {
      const r = estadoBtnRef.current.getBoundingClientRect()
      setEstadoPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX })
    }
    setEstadoOpen(v => !v)
  }

  async function handleEstado(nuevo: EstadoCliente) {
    setEstadoOpen(false)
    if (!!cliente.deleted_at) return
    await runAction('Cambiando estado', () => cambiarEstadoCliente(cliente.id, nuevo), { silentSuccess: true })
    router.refresh()
  }

  async function handleEliminar() {
    const ok = await confirm({
      title: 'Eliminar cliente',
      description: '¿Eliminar este cliente? Podrás restaurarlo desde su ficha.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    const result = await runAction('Eliminando cliente', () => eliminarCliente(cliente.id), { successMessage: 'Cliente eliminado' })
    if (result.ok) router.push('/dashboard/clientes')
  }

  async function handleRestaurar() {
    const ok = await confirm({
      title: 'Restaurar cliente',
      description: '¿Restaurar este cliente? Volverá a aparecer en la lista.',
      confirmLabel: 'Restaurar',
      variant: 'default',
    })
    if (!ok) return
    const result = await runAction('Restaurando cliente', () => restaurarCliente(cliente.id), { successMessage: 'Cliente restaurado' })
    if (result.ok) router.refresh()
  }

  const eliminado = !!cliente.deleted_at

  return (
    <div>
      {/* ── BANNER ELIMINADO ────────────────────────────────────────────── */}
      {eliminado && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-4">
          <div className="flex items-center gap-2 font-raleway text-sm text-amber-700">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Este cliente está eliminado y no aparece en la lista.
          </div>
          <button
            type="button"
            onClick={handleRestaurar}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold font-raleway hover:bg-amber-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Restaurar
          </button>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-henko-turquoise/20 flex items-center justify-center text-henko-turquoise font-roxborough text-2xl flex-shrink-0">
            {inicial}
          </div>

          <div className="flex-1 min-w-0">
            {/* Nombre + tipo + estado */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-roxborough text-2xl text-gray-900">{cliente.nombre}</h2>
              <span className="font-raleway text-[11px] px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                {cliente.tipo === 'empresa' ? 'Empresa' : 'Particular'}
              </span>
              {/* Estado con dropdown */}
              <button
                ref={estadoBtnRef}
                type="button"
                onClick={handleEstadoOpen}
                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-bold cursor-pointer hover:opacity-80 transition-opacity ${estadoMeta.bg} ${estadoMeta.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${estadoMeta.dot}`} />
                {estadoMeta.label}
                <svg className="w-2.5 h-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Contacto */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {cliente.email && (
                <a href={`mailto:${cliente.email}`} className="font-raleway text-sm text-gray-500 hover:text-henko-turquoise flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {cliente.email}
                </a>
              )}
              {cliente.telefono && (
                <a href={`tel:${cliente.telefono}`} className="font-raleway text-sm text-gray-500 hover:text-henko-turquoise flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {cliente.telefono}
                </a>
              )}
              {cliente.origen && (
                <span className="font-raleway text-sm text-gray-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                  {getOrigenLabel(cliente.origen)}
                </span>
              )}
            </div>

            {/* Stats: servicio · tarifa · fecha */}
            <div className="flex flex-wrap gap-2 mt-3">
              {cliente.servicio_contratado && (
                <span className="font-raleway text-xs bg-henko-turquoise/10 text-henko-turquoise px-2.5 py-1 rounded-full font-semibold">
                  {getServicioLabel(cliente.servicio_contratado)}
                </span>
              )}
              {cliente.importe != null && (
                <span className="font-raleway text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  {formatImporte(cliente.importe, cliente.tarifa)} ({getTarifaLabel(cliente.tarifa)})
                </span>
              )}
              {cliente.fecha_conversion && (
                <span className="font-raleway text-xs text-gray-400">
                  Cliente desde {new Date(cliente.fecha_conversion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex-shrink-0">
            <AccionesMenu
              items={[
                { label: 'Agendar cita', onClick: () => setAgendarOpen(true), iconPath: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
                { label: 'Editar cliente', onClick: () => setDrawerOpen(true), iconPath: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z' },
                { label: 'Eliminar cliente', onClick: handleEliminar, danger: true, divider: true, iconPath: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── DROPDOWN ESTADO (fixed) ──────────────────────────────────────── */}
      {estadoOpen && (
        <div
          ref={estadoMenuRef}
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[140px]"
          style={{ top: estadoPos.top, left: estadoPos.left }}
        >
          {ESTADOS_CLIENTE.map(e => (
            <button
              key={e.value}
              type="button"
              onClick={() => handleEstado(e.value)}
              className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 transition-colors ${e.value === cliente.estado ? 'opacity-40 cursor-default' : 'hover:bg-gray-50'}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${e.dot}`} />
              {e.label}
            </button>
          ))}
        </div>
      )}

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 font-raleway font-semibold text-sm transition-colors relative whitespace-nowrap ${
              tab === t.id ? 'text-henko-turquoise' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-henko-turquoise rounded-full" />}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
      {tab === 'facturas' && <ClienteFacturas facturas={facturas} clienteId={cliente.id} />}
      {tab === 'empleo'   && <ClienteOfertas ofertas={ofertas} />}
      {tab === 'citas'    && (
        <CitasHistorial
          recurso={{ tipo: 'cliente', id: cliente.id, nombre: cliente.nombre, email: cliente.email, contexto: cliente.servicio_contratado ? getServicioLabel(cliente.servicio_contratado) : undefined }}
          tiposCita={TIPOS_CITA.cliente}
          tiposTarea={TIPOS_TAREA.cliente}
        />
      )}
      {tab === 'archivos' && <ClienteArchivos clienteId={cliente.id} archivos={archivos} />}
      {tab === 'notas'    && <ClienteNotas clienteId={cliente.id} notas={notas} />}

      {/* ── DRAWER EDICIÓN ──────────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}>
          <div className="relative h-full w-full max-w-2xl bg-white flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-8 py-5 border-b border-black/5 sticky top-0 bg-white z-10">
              <h2 className="font-roxborough text-2xl text-gray-900">Editar cliente</h2>
              <button type="button" onClick={() => setDrawerOpen(false)} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <ClienteFicha cliente={cliente} />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AGENDAR CITA ──────────────────────────────────────────── */}
      {agendarOpen && (
        <AgendarCitaModal
          recurso={{ tipo: 'cliente', id: cliente.id, nombre: cliente.nombre, email: cliente.email, contexto: cliente.servicio_contratado ? getServicioLabel(cliente.servicio_contratado) : undefined }}
          tiposCita={TIPOS_CITA.cliente}
          tiposTarea={TIPOS_TAREA.cliente}
          onClose={() => setAgendarOpen(false)}
          onDone={() => setAgendarOpen(false)}
        />
      )}
    </div>
  )
}
