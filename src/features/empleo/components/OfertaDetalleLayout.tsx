'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { actualizarOferta, cambiarEstadoOferta, eliminarOferta } from '@/actions/ofertas'
import { cambiarEstadoSolicitud } from '@/actions/solicitudes'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
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

const SOL_BADGE: Record<EstadoSolicitud, string> = {
  nuevo:       'bg-blue-50 text-blue-700',
  revisando:   'bg-yellow-50 text-yellow-700',
  entrevista:  'bg-purple-50 text-purple-700',
  descartado:  'bg-red-50 text-red-500',
  contratado:  'bg-henko-greenblue text-henko-turquoise',
}
const SOL_LABEL: Record<EstadoSolicitud, string> = {
  nuevo: 'Nuevo', revisando: 'Revisando', entrevista: 'Entrevista',
  descartado: 'Descartado', contratado: 'Contratado',
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
    if (!draft.titulo.trim() || !draft.empresa.trim() || !draft.descripcion.trim()) {
      setEditError('Título, empresa y descripción son obligatorios')
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
    const result = await runAction(
      'Actualizando estado',
      () => cambiarEstadoSolicitud(solicitudId, nuevoEstado),
      { successMessage: 'Estado actualizado', silentSuccess: true },
    )
    if (result.ok) {
      setSolicitudes(prev => prev.map(s => s.id === solicitudId ? { ...s, estado: nuevoEstado } : s))
    }
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
        {o.fecha && <InfoField label="PUBLICADA" value={o.fecha} />}
        {o.fecha_expiracion && <InfoField label="EXPIRA" value={o.fecha_expiracion} />}
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

function OfertaCandidatos({
  solicitudes,
  onCambiarEstado,
}: {
  solicitudes: Solicitud[]
  onCambiarEstado: (id: string, estado: EstadoSolicitud) => void
}) {
  if (solicitudes.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-12 text-center">
        <p className="font-raleway text-gray-400 text-sm">Todavía no hay candidatos inscritos en esta oferta.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      {/* Cabecera tabla */}
      <div className="hidden md:grid px-6 py-3.5 border-b border-gray-100 grid-cols-[1fr_1fr_160px_120px] text-[10px] tracking-widest text-gray-400 font-bold">
        <span>CANDIDATO</span>
        <span>CARGO ACTUAL</span>
        <span>INSCRIPCIÓN</span>
        <span>ESTADO</span>
      </div>

      {solicitudes.map(s => {
        const inicial = s.nombre[0]?.toUpperCase() ?? '?'
        const fecha = s.created_at
          ? new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—'

        return (
          <div key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-henko-white/40 transition-colors">
            {/* Desktop */}
            <div className="hidden md:grid px-6 py-4 grid-cols-[1fr_1fr_160px_120px] items-center gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-henko-turquoise/10 flex items-center justify-center text-henko-turquoise font-roxborough text-sm flex-shrink-0">
                  {inicial}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/candidatos/${s.candidato_id}`}
                    className="text-sm font-semibold text-gray-800 hover:text-henko-turquoise transition-colors truncate block"
                  >
                    {s.nombre}
                  </Link>
                  <p className="text-[11px] text-gray-400 truncate">{s.email}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 truncate">{s.cargo_actual ?? '—'}</p>
              <p className="text-sm text-gray-400">{fecha}</p>
              <EstadoSolSelect estado={s.estado} onChange={v => onCambiarEstado(s.id, v)} />
            </div>

            {/* Móvil */}
            <div className="md:hidden px-5 py-4">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-henko-turquoise/10 flex items-center justify-center text-henko-turquoise font-roxborough text-sm flex-shrink-0">
                    {inicial}
                  </div>
                  <div className="min-w-0">
                    <Link href={`/dashboard/candidatos/${s.candidato_id}`} className="text-sm font-semibold text-gray-800 hover:text-henko-turquoise">
                      {s.nombre}
                    </Link>
                    <p className="text-[11px] text-gray-400">{s.email}</p>
                  </div>
                </div>
                <EstadoSolSelect estado={s.estado} onChange={v => onCambiarEstado(s.id, v)} />
              </div>
              <p className="text-[11px] text-gray-400 pl-11">{fecha}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Selector estado solicitud ────────────────────────────────────────────────

function EstadoSolSelect({ estado, onChange }: { estado: EstadoSolicitud; onChange: (v: EstadoSolicitud) => void }) {
  const ESTADOS: EstadoSolicitud[] = ['nuevo', 'revisando', 'entrevista', 'descartado', 'contratado']
  return (
    <div onClick={e => e.stopPropagation()}>
      <CustomSelect
        value={estado}
        onChange={v => onChange(v as EstadoSolicitud)}
        options={ESTADOS.map(e => ({ value: e, label: SOL_LABEL[e] }))}
        className="w-full"
      />
    </div>
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
        <label className={labelClass}>FECHA LÍMITE <span className="text-gray-400 normal-case tracking-normal">(opcional)</span></label>
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
