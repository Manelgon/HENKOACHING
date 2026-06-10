'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { actualizarOferta, cambiarEstadoOferta, eliminarOferta } from '@/actions/ofertas'
import { cambiarEstadoSolicitud, getCvUrl } from '@/actions/solicitudes'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import CustomSelect from '@/shared/components/CustomSelect'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Catalogo = { id: number; nombre: string; slug: string }
type EmpresaOption = { id: string; nombre: string; ubicacion: string | null }

type OfertaView = {
  id: string
  titulo: string
  empresa: string
  empresa_oculta: boolean
  ubicacion: string
  salario_texto: string
  reporta_a: string
  contrato: string
  descripcion: string
  funciones: string[]
  requisitos: string[]
  competencias: string[]
  ofrecemos: string[]
  estado: 'borrador' | 'publicada' | 'pausada' | 'cerrada'
  fecha: string
  fecha_expiracion: string
  sector_id: number | null
  modalidad_id: number | null
  jornada_id: number | null
  sector_nombre: string
  modalidad_nombre: string
  jornada_nombre: string
}

type Solicitud = {
  id: string
  estado: EstadoSolicitud
  created_at: string | null
  mensaje: string | null
  candidato_id: string
  nombre: string
  email: string
  telefono: string | null
  cargo_actual: string | null
  cvPath: string | null
  cvNombre: string | null
}

type Draft = {
  titulo: string
  empresa: string
  empresa_oculta: boolean
  ubicacion: string
  modalidad_id: number
  jornada_id: number
  sector_id: number
  salario_texto: string
  reporta_a: string
  contrato: string
  descripcion: string
  funciones: string
  requisitos: string
  competencias: string
  ofrecemos: string
  estado: OfertaView['estado']
  fecha_expiracion: string
}

type Props = {
  oferta: OfertaView
  solicitudes: Solicitud[]
  sectores: Catalogo[]
  modalidades: Catalogo[]
  jornadas: Catalogo[]
  empresas: EmpresaOption[]
}

type Tab = 'informacion' | 'candidatos'

// ─── Constantes ──────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<OfertaView['estado'], string> = {
  publicada: 'bg-henko-greenblue text-henko-turquoise',
  borrador:  'bg-henko-yellow text-yellow-900',
  pausada:   'bg-orange-100 text-orange-700',
  cerrada:   'bg-black/5 text-gray-500',
}
const ESTADO_LABEL: Record<OfertaView['estado'], string> = {
  publicada: 'Activa', borrador: 'Borrador', pausada: 'Pausada', cerrada: 'Cerrada',
}


const labelClass = 'text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5 block'
const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm border-[1.5px] border-gray-200 bg-henko-white outline-none focus:border-henko-turquoise transition-colors'

// ─── Componente principal ─────────────────────────────────────────────────────

export default function OfertaDetalleLayout({ oferta: initialOferta, solicitudes: initialSolicitudes, sectores, modalidades, jornadas, empresas }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()

  const [oferta, setOferta] = useState(initialOferta)
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes)
  const [activeTab, setActiveTab] = useState<Tab>('informacion')
  const [isEditing, setIsEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(() => ofertaToDraft(initialOferta))

  const update = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft(d => ({ ...d, [k]: v }))

  async function handleGuardar() {
    if (!draft.titulo.trim() || !draft.empresa.trim() || !draft.descripcion.trim() || !draft.fecha_expiracion) {
      setEditError('Título, empresa, descripción y fecha límite son obligatorios')
      return
    }
    setEditError(null)
    const result = await runAction(
      'Guardando cambios',
      () => actualizarOferta(oferta.id, {
        titulo: draft.titulo,
        empresa_nombre: draft.empresa,
        empresa_oculta: draft.empresa_oculta,
        ubicacion: draft.ubicacion,
        modalidad_id: draft.modalidad_id || null,
        jornada_id: draft.jornada_id || null,
        sector_id: draft.sector_id || null,
        salario_texto: draft.salario_texto,
        reporta_a: draft.reporta_a,
        contrato: draft.contrato,
        descripcion: draft.descripcion,
        funciones: draft.funciones.split('\n').map(s => s.trim()).filter(Boolean),
        requisitos: draft.requisitos.split('\n').map(s => s.trim()).filter(Boolean),
        competencias: draft.competencias.split('\n').map(s => s.trim()).filter(Boolean),
        ofrecemos: draft.ofrecemos.split('\n').map(s => s.trim()).filter(Boolean),
        estado: draft.estado,
        fecha_expiracion: draft.fecha_expiracion || null,
      }),
      { successMessage: 'Cambios guardados' },
    )
    if (!result.ok) { setEditError(result.error ?? null); return }
    setIsEditing(false)
    router.refresh()
  }

  async function handleToggleEstado() {
    const nuevoEstado: OfertaView['estado'] = oferta.estado === 'publicada' ? 'cerrada' : 'publicada'
    const result = await runAction(
      nuevoEstado === 'publicada' ? 'Activando oferta' : 'Cerrando oferta',
      () => cambiarEstadoOferta(oferta.id, nuevoEstado),
      { successMessage: nuevoEstado === 'publicada' ? 'Oferta activada' : 'Oferta cerrada' },
    )
    if (result.ok) router.refresh()
  }

  async function handleEliminar() {
    const ok = await confirm({
      title: 'Eliminar oferta',
      description: `¿Eliminar "${oferta.titulo}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    const result = await runAction('Eliminando oferta', () => eliminarOferta(oferta.id), { successMessage: 'Oferta eliminada' })
    if (result.ok) router.push('/dashboard/ofertas')
  }

  async function handleCambiarEstadoSol(solicitudId: string, nuevoEstado: EstadoSolicitud) {
    setSolicitudes(prev => prev.map(s => s.id === solicitudId ? { ...s, estado: nuevoEstado } : s))
    await runAction(
      'Actualizando estado',
      () => cambiarEstadoSolicitud(solicitudId, nuevoEstado),
      { successMessage: 'Estado actualizado', silentSuccess: true },
    )
  }

  async function handleDescargarCv(path: string) {
    const result = await runAction('Generando enlace del CV', () => getCvUrl(path), { silentSuccess: true })
    if (result.ok && (result.data as { url?: string })?.url) window.open((result.data as { url: string }).url, '_blank')
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'informacion', label: 'Información' },
    { id: 'candidatos', label: `Candidatos (${solicitudes.length})` },
  ]

  return (
    <>
      {/* Header card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 mb-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${ESTADO_BADGE[oferta.estado]}`}>
                {ESTADO_LABEL[oferta.estado]}
              </span>
              {oferta.sector_nombre && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{oferta.sector_nombre}</span>
              )}
              {oferta.modalidad_nombre && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{oferta.modalidad_nombre}</span>
              )}
            </div>
            <h2 className="font-roxborough text-2xl text-gray-900 mb-1">{oferta.titulo}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {oferta.empresa && (
                <span className="font-raleway text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {oferta.empresa}
                  {oferta.empresa_oculta && <span className="text-[9px] font-bold tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">OCULTA</span>}
                </span>
              )}
              {oferta.ubicacion && (
                <span className="font-raleway text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {oferta.ubicacion}
                </span>
              )}
              {oferta.salario_texto && (
                <span className="font-raleway text-sm text-henko-turquoise font-semibold">{oferta.salario_texto}</span>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <a
              href={`/api/dashboard/ofertas/${oferta.id}/pdf`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold font-raleway hover:border-henko-turquoise hover:text-henko-turquoise hover:bg-henko-turquoise/5 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9Z" />
              </svg>
              PDF oferta
            </a>
            {!isEditing && (
              <button
                type="button"
                onClick={() => { setDraft(ofertaToDraft(oferta)); setIsEditing(true); setEditError(null) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-henko-turquoise text-white text-xs font-semibold font-raleway hover:bg-henko-turquoise-light transition-all"
              >
                Editar
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleEstado}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold font-raleway hover:border-gray-400 transition-all"
            >
              {oferta.estado === 'publicada' ? 'Cerrar oferta' : 'Activar oferta'}
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold font-raleway hover:bg-red-50 transition-all"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Editar inline */}
      {isEditing ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
          <p className="font-roxborough text-xl text-gray-900 mb-6">Editar oferta</p>
          <FormOferta
            draft={draft}
            update={update}
            sectores={sectores}
            modalidades={modalidades}
            jornadas={jornadas}
            empresas={empresas}
            error={editError}
          />
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setIsEditing(false); setEditError(null) }}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border-2 border-henko-turquoise text-henko-turquoise text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full bg-henko-turquoise text-white text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`font-raleway font-semibold text-sm px-4 pb-3 pt-1 transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-henko-turquoise border-henko-turquoise'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'informacion' && (
            <OfertaInformacion oferta={oferta} />
          )}

          {activeTab === 'candidatos' && (
            <OfertaCandidatos
              solicitudes={solicitudes}
              onCambiarEstado={handleCambiarEstadoSol}
              onDescargarCv={handleDescargarCv}
            />
          )}
        </>
      )}
    </>
  )
}

// ─── Tab Información ──────────────────────────────────────────────────────────

function OfertaInformacion({ oferta: o }: { oferta: OfertaView }) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
      {/* Grid datos clave */}
      <div className="grid grid-cols-2 gap-4">
        {o.jornada_nombre && <InfoField label="JORNADA" value={o.jornada_nombre} />}
        {o.reporta_a && <InfoField label="REPORTA A" value={o.reporta_a} />}
        {o.contrato && <InfoField label="TIPO CONTRATO" value={o.contrato} />}
      </div>
      {/* Fechas: publicada y límite siempre juntas en la misma fila */}
      <div className="grid grid-cols-2 gap-4">
        <InfoField label="PUBLICADA" value={o.fecha || '—'} />
        <InfoField label="FECHA LÍMITE" value={o.fecha_expiracion ? formatFechaCorta(o.fecha_expiracion) : 'Sin fecha límite'} />
      </div>

      {o.descripcion && (
        <div>
          <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">DESCRIPCIÓN</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{o.descripcion}</p>
        </div>
      )}

      {o.funciones.length > 0 && <ListaDetalle label="FUNCIONES PRINCIPALES" items={o.funciones} />}
      {o.requisitos.length > 0 && <ListaDetalle label="REQUISITOS" items={o.requisitos} />}
      {o.competencias.length > 0 && <ListaDetalle label="COMPETENCIAS CLAVE" items={o.competencias} />}
      {o.ofrecemos.length > 0 && <ListaDetalle label="SE OFRECE" items={o.ofrecemos} />}
    </div>
  )
}

// ─── Tab Candidatos ───────────────────────────────────────────────────────────

const ESTADO_META: Record<EstadoSolicitud, { label: string; badge: string }> = {
  nuevo:      { label: 'Nueva',       badge: 'bg-henko-greenblue text-henko-turquoise' },
  revisando:  { label: 'Revisando',   badge: 'bg-henko-yellow text-yellow-900' },
  entrevista: { label: 'Entrevista',  badge: 'bg-henko-purple text-white' },
  descartado: { label: 'Descartado',  badge: 'bg-black/5 text-gray-500' },
  contratado: { label: 'Contratado',  badge: 'bg-henko-turquoise text-white' },
}

function EstadoDropdownSol({ estado, onChange }: { estado: EstadoSolicitud; onChange: (v: EstadoSolicitud) => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const actual = ESTADO_META[estado]

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={e => {
          e.stopPropagation()
          if (btnRef.current) {
            const r = btnRef.current.getBoundingClientRect()
            setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX })
          }
          setOpen(v => !v)
        }}
        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold cursor-pointer hover:opacity-80 transition-opacity ${actual.badge}`}
      >
        {actual.label}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div ref={menuRef} className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[130px]" style={{ top: pos.top, left: pos.left }}>
          {(Object.entries(ESTADO_META) as [EstadoSolicitud, { label: string; badge: string }][]).map(([val, meta]) => (
            <button
              key={val}
              type="button"
              onClick={e => { e.stopPropagation(); setOpen(false); if (val !== estado) onChange(val) }}
              className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 transition-colors ${val === estado ? 'opacity-40 cursor-default' : 'hover:bg-gray-50'}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.badge.split(' ')[0]}`} />
              {meta.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

function OfertaCandidatos({
  solicitudes,
  onCambiarEstado,
  onDescargarCv,
}: {
  solicitudes: Solicitud[]
  onCambiarEstado: (id: string, estado: EstadoSolicitud) => void
  onDescargarCv: (path: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const pagination = usePagination(solicitudes, 20)
  const selected = selectedId ? solicitudes.find(s => s.id === selectedId) ?? null : null

  useEffect(() => {
    if (!selectedId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [selectedId])

  if (solicitudes.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-12 text-center">
        <p className="font-raleway text-gray-400 text-sm">Todavía no hay candidatos inscritos en esta oferta.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
        <div className="hidden md:grid px-5 lg:px-7 py-3.5 border-b border-black/5 grid-cols-[2fr_1fr_1fr_1fr] text-[10px] tracking-widest text-gray-400 font-bold">
          <span>CANDIDATO</span><span>INSCRIPCIÓN</span><span>CV</span><span>ESTADO</span>
        </div>

        {pagination.paginated.map(s => {
          const esNueva = s.estado === 'nuevo'
          const fecha = s.created_at
            ? new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—'
          return (
            <div
              key={s.id}
              className={`border-b border-black/5 last:border-0 cursor-pointer transition-colors ${esNueva ? 'bg-henko-greenblue/10 hover:bg-henko-greenblue/20' : 'hover:bg-henko-white/40'}`}
              onClick={() => setSelectedId(s.id)}
            >
              {/* Desktop */}
              <div className="hidden md:grid px-5 lg:px-7 py-4 grid-cols-[2fr_1fr_1fr_1fr] items-center gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {esNueva && <span className="w-2 h-2 rounded-full bg-henko-turquoise flex-shrink-0" />}
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/candidatos/${s.candidato_id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-sm font-semibold truncate block hover:text-henko-turquoise hover:underline transition-colors"
                    >
                      {s.nombre}
                    </Link>
                    <p className="text-[11px] text-gray-400">{s.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{fecha}</p>
                <div onClick={e => e.stopPropagation()}>
                  {s.cvPath ? (
                    <button
                      type="button"
                      onClick={() => onDescargarCv(s.cvPath!)}
                      className="w-8 h-8 rounded-lg bg-henko-turquoise/10 hover:bg-henko-turquoise/20 flex items-center justify-center transition-colors"
                      title={s.cvNombre ?? 'Descargar CV'}
                    >
                      <svg className="w-4 h-4 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <EstadoDropdownSol estado={s.estado} onChange={v => onCambiarEstado(s.id, v)} />
                </div>
              </div>
              {/* Móvil */}
              <div className="md:hidden px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {esNueva && <span className="w-2 h-2 rounded-full bg-henko-turquoise flex-shrink-0 mt-1" />}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{s.nombre}</p>
                      <p className="text-[11px] text-gray-400">{s.email} · {fecha}</p>
                    </div>
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <EstadoDropdownSol estado={s.estado} onChange={v => onCambiarEstado(s.id, v)} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <TablePagination
          page={pagination.page} pageSize={pagination.pageSize} total={pagination.total}
          totalPages={pagination.totalPages} from={pagination.from} to={pagination.to}
          onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize}
        />
      </div>

      {/* Drawer detalle solicitud */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setSelectedId(null)}>
          <div className="relative h-full w-full max-w-lg bg-white flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-8 py-5 border-b border-black/5 sticky top-0 bg-white z-10">
              <div>
                <p className="font-roxborough text-xl text-gray-900">{selected.nombre}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {selected.created_at ? new Date(selected.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedId(null)} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              <div>
                <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">ESTADO</p>
                <EstadoDropdownSol estado={selected.estado} onChange={v => onCambiarEstado(selected.id, v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1">EMAIL</p>
                  <p className="text-sm text-gray-800">{selected.email}</p>
                </div>
                {selected.telefono && (
                  <div>
                    <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1">TELÉFONO</p>
                    <p className="text-sm text-gray-800">{selected.telefono}</p>
                  </div>
                )}
              </div>
              {selected.cvPath && (
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">CURRÍCULUM</p>
                  <button
                    type="button"
                    onClick={() => onDescargarCv(selected.cvPath!)}
                    className="inline-flex items-center gap-2 text-sm text-henko-turquoise font-semibold hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    {selected.cvNombre || 'Descargar CV'}
                  </button>
                </div>
              )}
              {selected.mensaje && (
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">MENSAJE DEL CANDIDATO</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 whitespace-pre-wrap">{selected.mensaje}</p>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-black/5 bg-white">
              <Link
                href={`/dashboard/candidatos/${selected.candidato_id}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
              >
                Ver perfil completo →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Formulario edición ───────────────────────────────────────────────────────

function FormOferta({
  draft, update, sectores, modalidades, jornadas, empresas, error,
}: {
  draft: Draft
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void
  sectores: Catalogo[]
  modalidades: Catalogo[]
  jornadas: Catalogo[]
  empresas: EmpresaOption[]
  error: string | null
}) {
  const datalistId = 'ofertas-empresas-list'
  const match = empresas.find(e => e.nombre.toLowerCase() === draft.empresa.trim().toLowerCase())
  const hint = match
    ? `Cliente-empresa existente${match.ubicacion ? ` · ${match.ubicacion}` : ''}`
    : draft.empresa.trim() ? 'Se creará un nuevo cliente-empresa con este nombre' : null

  return (
    <>
      <div className="mb-4">
        <label className={labelClass}>TÍTULO DEL PUESTO</label>
        <input className={inputClass} value={draft.titulo} onChange={e => update('titulo', e.target.value)} placeholder="ej. Responsable de Operaciones" />
      </div>
      <div className="mb-4">
        <label className={labelClass}>EMPRESA</label>
        <input className={inputClass} value={draft.empresa} list={datalistId} onChange={e => {
          update('empresa', e.target.value)
          const m = empresas.find(em => em.nombre.toLowerCase() === e.target.value.toLowerCase())
          if (m?.ubicacion && !draft.ubicacion.trim()) update('ubicacion', m.ubicacion)
        }} />
        <datalist id={datalistId}>{empresas.map(e => <option key={e.id} value={e.nombre} />)}</datalist>
        {hint && <p className={`mt-1.5 text-[11px] ${match ? 'text-henko-turquoise' : 'text-gray-500'}`}>{hint}</p>}
      </div>
      <label className="flex items-start gap-2.5 mb-4 cursor-pointer select-none">
        <input type="checkbox" checked={draft.empresa_oculta} onChange={e => update('empresa_oculta', e.target.checked)} className="mt-0.5 w-4 h-4 accent-henko-turquoise" />
        <span className="text-xs text-gray-600 leading-snug">
          <span className="font-semibold text-gray-800">Ocultar nombre de la empresa</span> — aparecerá como &quot;Empresa confidencial&quot;.
        </span>
      </label>
      <div className="mb-4">
        <label className={labelClass}>UBICACIÓN</label>
        <input className={inputClass} value={draft.ubicacion} onChange={e => update('ubicacion', e.target.value)} placeholder="Palma de Mallorca" />
      </div>
      <div className="mb-4">
        <label className={labelClass}>SALARIO</label>
        <input className={inputClass} value={draft.salario_texto} onChange={e => update('salario_texto', e.target.value)} placeholder="ej. 30.000 – 36.000 €/año" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {([['MODALIDAD', 'modalidad_id', modalidades], ['JORNADA', 'jornada_id', jornadas], ['SECTOR', 'sector_id', sectores]] as const).map(([lbl, key, opts]) => (
          <div key={key}>
            <label className={labelClass}>{lbl}</label>
            <CustomSelect
              value={String(draft[key])}
              onChange={v => update(key, Number(v) as never)}
              options={[{ value: '0', label: '— Seleccionar —' }, ...opts.map(o => ({ value: String(o.id), label: o.nombre }))]}
              className="w-full"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelClass}>REPORTA A</label>
          <input className={inputClass} value={draft.reporta_a} onChange={e => update('reporta_a', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>CONTRATO</label>
          <input className={inputClass} value={draft.contrato} onChange={e => update('contrato', e.target.value)} />
        </div>
      </div>
      <div className="mb-4">
        <label className={labelClass}>ESTADO</label>
        <CustomSelect
          value={draft.estado}
          onChange={v => update('estado', v as Draft['estado'])}
          options={[
            { value: 'borrador', label: 'Borrador (no visible)' },
            { value: 'publicada', label: 'Publicada' },
            { value: 'pausada', label: 'Pausada' },
            { value: 'cerrada', label: 'Cerrada' },
          ]}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <label className={labelClass}>FECHA LÍMITE <span className="text-red-400 normal-case tracking-normal">* (obligatoria — Google deja de mostrar la oferta al caducar)</span></label>
        <input type="date" className={inputClass} value={draft.fecha_expiracion} onChange={e => update('fecha_expiracion', e.target.value)} />
      </div>
      <div className="mb-4">
        <label className={labelClass}>DESCRIPCIÓN DEL PUESTO</label>
        <textarea rows={5} className={inputClass + ' resize-y leading-relaxed'} value={draft.descripcion} onChange={e => update('descripcion', e.target.value)} />
      </div>
      <div className="mb-4">
        <label className={labelClass}>FUNCIONES PRINCIPALES (una por línea)</label>
        <textarea rows={4} className={inputClass + ' resize-y leading-relaxed'} value={draft.funciones} onChange={e => update('funciones', e.target.value)} />
      </div>
      <div className="mb-4">
        <label className={labelClass}>REQUISITOS (uno por línea)</label>
        <textarea rows={4} className={inputClass + ' resize-y leading-relaxed'} value={draft.requisitos} onChange={e => update('requisitos', e.target.value)} />
      </div>
      <div className="mb-4">
        <label className={labelClass}>COMPETENCIAS CLAVE (una por línea)</label>
        <textarea rows={4} className={inputClass + ' resize-y leading-relaxed'} value={draft.competencias} onChange={e => update('competencias', e.target.value)} />
      </div>
      <div className="mb-2">
        <label className={labelClass}>SE OFRECE (uno por línea)</label>
        <textarea rows={4} className={inputClass + ' resize-y leading-relaxed'} value={draft.ofrecemos} onChange={e => update('ofrecemos', e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
    </>
  )
}

// ─── Helpers visuales ─────────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}

// Formatea una fecha ISO (YYYY-MM-DD) a "10 sept 2026". Añade T00:00:00 para evitar desfase de zona horaria.
function formatFechaCorta(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ListaDetalle({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 items-start text-sm text-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-henko-turquoise flex-shrink-0 mt-[0.4rem]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Utilidad ─────────────────────────────────────────────────────────────────

function ofertaToDraft(o: OfertaView): Draft {
  return {
    titulo: o.titulo,
    empresa: o.empresa,
    empresa_oculta: o.empresa_oculta,
    ubicacion: o.ubicacion,
    modalidad_id: o.modalidad_id ?? 0,
    jornada_id: o.jornada_id ?? 0,
    sector_id: o.sector_id ?? 0,
    salario_texto: o.salario_texto,
    reporta_a: o.reporta_a,
    contrato: o.contrato,
    descripcion: o.descripcion,
    funciones: o.funciones.join('\n'),
    requisitos: o.requisitos.join('\n'),
    competencias: o.competencias.join('\n'),
    ofrecemos: o.ofrecemos.join('\n'),
    estado: o.estado,
    fecha_expiracion: o.fecha_expiracion ?? '',
  }
}
