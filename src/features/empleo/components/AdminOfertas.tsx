'use client'

import { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { crearOferta, cambiarEstadoOferta } from '@/actions/ofertas'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import CustomSelect from '@/shared/components/CustomSelect'

type Catalogo = { id: number; nombre: string; slug: string }

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
  candidatos_count: number
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
  estado: '' | 'borrador' | 'publicada' | 'pausada' | 'cerrada'
  fecha_expiracion: string
}

type EmpresaOption = { id: string; nombre: string; ubicacion: string | null }

type Props = {
  ofertas: OfertaView[]
  sectores: Catalogo[]
  modalidades: Catalogo[]
  jornadas: Catalogo[]
  empresas: EmpresaOption[]
}

const labelClass = 'text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5 block'
const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm border-[1.5px] border-gray-200 bg-henko-white outline-none focus:border-henko-turquoise transition-colors'

// ─── Estado dropdown (tabla) ─────────────────────────────────────────────────
const ESTADO_OPCIONES: { value: OfertaView['estado']; label: string; badge: string }[] = [
  { value: 'publicada', label: 'Activa',    badge: 'bg-henko-greenblue text-henko-turquoise' },
  { value: 'borrador',  label: 'Borrador',  badge: 'bg-henko-yellow text-yellow-900' },
  { value: 'pausada',   label: 'Pausada',   badge: 'bg-orange-100 text-orange-700' },
  { value: 'cerrada',   label: 'Cerrada',   badge: 'bg-black/5 text-gray-500' },
]

function EstadoDropdown({ estado, onChange }: { estado: OfertaView['estado']; onChange: (v: OfertaView['estado']) => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const actual = ESTADO_OPCIONES.find(o => o.value === estado)!

  // Borrador solo disponible si la oferta está actualmente en borrador
  const opciones = ESTADO_OPCIONES.filter(o => o.value !== 'borrador' || estado === 'borrador')

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX })
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold cursor-pointer transition-opacity hover:opacity-80 ${actual.badge}`}
      >
        {actual.label}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[120px]"
          style={{ top: pos.top, left: pos.left }}
        >
          {opciones.map(op => (
            <button
              key={op.value}
              type="button"
              onClick={() => { setOpen(false); if (op.value !== estado) onChange(op.value) }}
              className={`w-full text-left px-3 py-2 text-[11px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${op.value === estado ? 'opacity-40 cursor-default' : ''}`}
            >
              <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${op.badge.split(' ')[0]}`} />
              {op.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

type TabOferta = 'todos' | OfertaView['estado']

const TABS_OFERTA: { value: TabOferta; label: string; dot?: string }[] = [
  { value: 'todos',     label: 'Todas' },
  { value: 'publicada', label: 'Activa',   dot: 'bg-henko-turquoise' },
  { value: 'borrador',  label: 'Borrador', dot: 'bg-yellow-400' },
  { value: 'pausada',   label: 'Pausada',  dot: 'bg-orange-400' },
  { value: 'cerrada',   label: 'Cerrada',  dot: 'bg-gray-400' },
]

export default function AdminOfertas({ ofertas, sectores, modalidades, jornadas, empresas }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [tabEstado, setTabEstado] = useState<TabOferta>('todos')
  const [busqueda, setBusqueda] = useState('')

  const counts = useMemo(() => {
    const c: Record<TabOferta, number> = { todos: ofertas.length, publicada: 0, borrador: 0, pausada: 0, cerrada: 0 }
    for (const o of ofertas) c[o.estado]++
    return c
  }, [ofertas])

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return ofertas.filter(o => {
      if (tabEstado !== 'todos' && o.estado !== tabEstado) return false
      if (q && !o.titulo.toLowerCase().includes(q) && !o.empresa.toLowerCase().includes(q)) return false
      return true
    })
  }, [ofertas, busqueda, tabEstado])

  const pagination = usePagination(filtradas, 20)

  // ── Drawer state (solo para crear nueva oferta) ───────────────────────────
  const [drawerMode, setDrawerMode] = useState<'closed' | 'nueva'>('closed')
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft(sectores, modalidades, jornadas))

  const drawerAbierto = drawerMode !== 'closed'

  const update = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft(d => ({ ...d, [k]: v }))

  function abrirNueva() {
    setDraft(emptyDraft(sectores, modalidades, jornadas))
    setError(null)
    setDrawerMode('nueva')
  }

  function cerrar() {
    setDrawerMode('closed')
    setError(null)
    setDraft(emptyDraft(sectores, modalidades, jornadas))
  }

  const save = async () => {
    if (!draft.titulo.trim() || !draft.empresa.trim() || !draft.descripcion.trim() || !draft.estado || !draft.modalidad_id || !draft.jornada_id) {
      setError('Título, empresa, descripción, estado, modalidad y jornada son obligatorios')
      return
    }
    setError(null)
    const input = {
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
    }
    const result = await runAction(
      'Publicando oferta',
      () => crearOferta(input),
      { successMessage: 'Oferta publicada' },
    )
    if (!result.ok) { setError(result.error); return }
    cerrar()
    router.refresh()
  }

  const cambiarEstadoConConfirm = async (o: OfertaView, nuevoEstado: OfertaView['estado']) => {
    if (nuevoEstado === o.estado) return
    const labels: Record<OfertaView['estado'], string> = {
      publicada: 'Activa', borrador: 'Borrador', pausada: 'Pausada', cerrada: 'Cerrada',
    }
    const ok = await confirm({
      title: `Cambiar estado a "${labels[nuevoEstado]}"`,
      description: `¿Confirmas cambiar el estado de "${o.titulo}" de ${labels[o.estado]} a ${labels[nuevoEstado]}?`,
      confirmLabel: 'Confirmar',
    })
    if (!ok) return
    const result = await runAction(
      `Cambiando estado a ${labels[nuevoEstado]}`,
      () => cambiarEstadoOferta(o.id, nuevoEstado),
      { successMessage: `Estado cambiado a ${labels[nuevoEstado]}` },
    )
    if (result.ok) router.refresh()
  }

  useEffect(() => {
    if (!drawerAbierto) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [drawerAbierto])

  return (
    <div>
      {/* Tabs estado */}
      <div className="flex items-center gap-1 overflow-x-auto mb-6 border-b border-gray-200" style={{ scrollSnapType: 'x proximity' }}>
        {TABS_OFERTA.map(t => (
          <TabButton
            key={t.value}
            active={tabEstado === t.value}
            onClick={() => setTabEstado(t.value)}
            label={t.label}
            count={counts[t.value]}
            dotColor={t.dot}
          />
        ))}
      </div>

      {/* Toolbar: búsqueda + botón nueva oferta */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Buscar por título o empresa…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
          />
          <button
            type="button"
            onClick={abrirNueva}
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all whitespace-nowrap"
          >
            + Nueva oferta
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
        <div className="hidden md:grid px-5 lg:px-7 py-3.5 border-b border-black/5 grid-cols-[2fr_1.5fr_1fr_0.7fr_70px_100px_110px] text-[10px] tracking-widest text-gray-400 font-bold">
          <span>OFERTA</span><span>EMPRESA</span><span>SECTOR</span><span>MODALIDAD</span><span>CAND.</span><span>EXPIRA</span><span>ESTADO</span>
        </div>
        {filtradas.length === 0 && (
          <div className="px-5 md:px-7 py-12 text-center text-gray-400 text-sm">
            {ofertas.length === 0 ? 'Aún no hay ofertas.' : 'Ninguna oferta coincide con los filtros.'}
          </div>
        )}
        {pagination.paginated.map((o) => (
          <div
            key={o.id}
            className="border-b border-black/5 last:border-0 hover:bg-henko-white/40 transition-colors cursor-pointer"
            onClick={() => router.push(`/dashboard/ofertas/${o.id}`)}
          >
            {/* Desktop */}
            <div className="hidden md:grid px-5 lg:px-7 py-4 grid-cols-[2fr_1.5fr_1fr_0.7fr_70px_100px_110px] items-center gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{o.titulo}</p>
                <p className="text-[11px] text-gray-400">{o.fecha}{o.ubicacion ? ` · ${o.ubicacion}` : ''}</p>
              </div>
              <div className="min-w-0">
                <span className="text-sm text-gray-600 inline-flex items-center gap-1.5 truncate">
                  {o.empresa}
                  {o.empresa_oculta && (
                    <span className="text-[9px] font-bold tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">OCULTA</span>
                  )}
                </span>
              </div>
              <span className="text-xs text-gray-500 truncate">{o.sector_nombre || '—'}</span>
              <span className="text-xs text-gray-500 truncate">{o.modalidad_nombre || '—'}</span>
              <span className={`text-xs font-semibold text-center ${o.candidatos_count > 0 ? 'text-henko-turquoise' : 'text-gray-300'}`}>
                {o.candidatos_count}
              </span>
              <span className="text-xs text-gray-400">
                {o.fecha_expiracion
                  ? (() => {
                      const dias = Math.ceil((new Date(o.fecha_expiracion).getTime() - Date.now()) / 86400000)
                      return dias < 0
                        ? <span className="text-red-400">Expirada</span>
                        : dias <= 7
                        ? <span className="text-orange-400">{o.fecha_expiracion}</span>
                        : o.fecha_expiracion
                    })()
                  : '—'}
              </span>
              <div onClick={e => e.stopPropagation()}>
                <EstadoDropdown estado={o.estado} onChange={nuevoEstado => cambiarEstadoConConfirm(o, nuevoEstado)} />
              </div>
            </div>
            {/* Móvil */}
            <div className="md:hidden px-4 py-4">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{o.titulo}</p>
                  <p className="text-[11px] text-gray-400">{o.empresa}{o.ubicacion ? ` · ${o.ubicacion}` : ''}</p>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <EstadoDropdown estado={o.estado} onChange={nuevoEstado => cambiarEstadoConConfirm(o, nuevoEstado)} />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {o.sector_nombre && <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{o.sector_nombre}</span>}
                {o.modalidad_nombre && <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{o.modalidad_nombre}</span>}
                {o.candidatos_count > 0 && <span className="text-[10px] text-henko-turquoise font-semibold">{o.candidatos_count} candidato{o.candidatos_count !== 1 ? 's' : ''}</span>}
              </div>
            </div>
          </div>
        ))}
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          totalPages={pagination.totalPages}
          from={pagination.from}
          to={pagination.to}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </div>

      {/* Drawer — solo crear nueva oferta */}
      {drawerAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={cerrar}>
          <div
            className="relative h-full w-full max-w-2xl bg-white flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-5 border-b border-black/5 bg-white sticky top-0 z-10">
              <h2 className="font-roxborough text-2xl text-gray-900">Nueva oferta</h2>
              <button type="button" onClick={cerrar} aria-label="Cerrar" className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <FormOferta
                draft={draft}
                update={update}
                sectores={sectores}
                modalidades={modalidades}
                jornadas={jornadas}
                empresas={empresas}
                error={error}
              />
            </div>
            <div className="flex gap-3 px-8 py-5 border-t border-black/5 bg-white">
              <button
                type="button"
                onClick={cerrar}
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={save}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
              >
                Publicar oferta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Formulario edición/creación ──────────────────────────────────────────────
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
  return (
    <>
      <Field label="TÍTULO DEL PUESTO" value={draft.titulo} onChange={v => update('titulo', v)} placeholder="ej. Responsable de Operaciones" />
      <EmpresaPickerField
        value={draft.empresa}
        onChange={v => {
          update('empresa', v)
          const match = empresas.find(e => e.nombre.toLowerCase() === v.toLowerCase())
          if (match?.ubicacion && !draft.ubicacion.trim()) update('ubicacion', match.ubicacion)
        }}
        empresas={empresas}
      />
      <label className="flex items-start gap-2.5 mb-4 cursor-pointer select-none">
        <input type="checkbox" checked={draft.empresa_oculta} onChange={e => update('empresa_oculta', e.target.checked)} className="mt-0.5 w-4 h-4 accent-henko-turquoise" />
        <span className="text-xs text-gray-600 leading-snug">
          <span className="font-semibold text-gray-800">Ocultar nombre de la empresa</span> — en la web pública aparecerá como &quot;Empresa confidencial&quot;.
        </span>
      </label>
      <Field label="UBICACIÓN" value={draft.ubicacion} onChange={v => update('ubicacion', v)} placeholder="Palma de Mallorca" />
      <Field label="SALARIO" value={draft.salario_texto} onChange={v => update('salario_texto', v)} placeholder="ej. 30.000 – 36.000 €/año" />
      <div className="grid grid-cols-3 gap-3 mb-4">
        <SelectField label="MODALIDAD" value={draft.modalidad_id} onChange={v => update('modalidad_id', v)} options={modalidades} />
        <SelectField label="JORNADA" value={draft.jornada_id} onChange={v => update('jornada_id', v)} options={jornadas} />
        <SelectField label="SECTOR" value={draft.sector_id} onChange={v => update('sector_id', v)} options={sectores} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="REPORTA A" value={draft.reporta_a} onChange={v => update('reporta_a', v)} placeholder="ej. Responsable de Administración" />
        <Field label="CONTRATO" value={draft.contrato} onChange={v => update('contrato', v)} placeholder="ej. Sustitución por maternidad" />
      </div>
      <div className="mb-4">
        <label className={labelClass}>ESTADO</label>
        <CustomSelect
          value={draft.estado}
          onChange={(v) => update('estado', v as Draft['estado'])}
          options={[
            { value: '', label: '— Seleccionar estado —' },
            { value: 'borrador', label: 'Borrador (no visible)' },
            { value: 'publicada', label: 'Publicada' },
            { value: 'pausada', label: 'Pausada' },
            { value: 'cerrada', label: 'Cerrada' },
          ]}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <label className={labelClass}>FECHA LÍMITE <span className="text-gray-400 normal-case tracking-normal">(opcional — mejora Google for Jobs)</span></label>
        <input type="date" className={inputClass} value={draft.fecha_expiracion} onChange={e => update('fecha_expiracion', e.target.value)} />
      </div>
      <div className="mb-4">
        <label className={labelClass}>DESCRIPCIÓN DEL PUESTO</label>
        <textarea rows={5} className={inputClass + ' resize-y leading-relaxed'} placeholder="Describe el puesto, responsabilidades y contexto..." value={draft.descripcion} onChange={e => update('descripcion', e.target.value)} />
      </div>
      <div className="mb-4">
        <label className={labelClass}>FUNCIONES PRINCIPALES (una por línea)</label>
        <textarea rows={5} className={inputClass + ' resize-y leading-relaxed'} value={draft.funciones} onChange={e => update('funciones', e.target.value)} />
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function emptyDraft(sectores: Catalogo[], modalidades: Catalogo[], jornadas: Catalogo[]): Draft {
  return {
    titulo: '', empresa: '', empresa_oculta: false, ubicacion: '', estado: '' as const,
    modalidad_id: 0,
    jornada_id: 0,
    sector_id: 0,
    salario_texto: '', reporta_a: '', contrato: '', descripcion: '',
    funciones: '', requisitos: '', competencias: '', ofrecemos: '',
    fecha_expiracion: '',
    modalidad_id: 0, jornada_id: 0, sector_id: 0,
  }
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="mb-4">
      <label className={labelClass}>{label}</label>
      <input className={inputClass} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function EmpresaPickerField({ value, onChange, empresas }: { value: string; onChange: (v: string) => void; empresas: EmpresaOption[] }) {
  const datalistId = 'empresas-existentes'
  const match = empresas.find(e => e.nombre.toLowerCase() === value.trim().toLowerCase())
  const hint = match
    ? `Cliente-empresa existente${match.ubicacion ? ` · ${match.ubicacion}` : ''}`
    : value.trim() ? 'Se creará un nuevo cliente-empresa con este nombre' : null
  return (
    <div className="mb-4">
      <label className={labelClass}>EMPRESA</label>
      <input className={inputClass} placeholder="Empieza a escribir para buscar o crea una nueva" value={value} list={datalistId} onChange={e => onChange(e.target.value)} />
      <datalist id={datalistId}>
        {empresas.map(e => <option key={e.id} value={e.nombre} />)}
      </datalist>
      {hint && <p className={`mt-1.5 text-[11px] font-raleway ${match ? 'text-henko-turquoise' : 'text-gray-500'}`}>{hint}</p>}
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: number; onChange: (v: number) => void; options: Catalogo[] }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <CustomSelect
        value={String(value)}
        onChange={(v) => onChange(Number(v))}
        options={[{ value: '0', label: '— Seleccionar —' }, ...options.map(o => ({ value: String(o.id), label: o.nombre }))]}
        className="w-full"
      />
    </div>
  )
}

const TabButton = forwardRef<HTMLButtonElement, { active: boolean; onClick: () => void; label: string; count: number; dotColor?: string }>(
  function TabButton({ active, onClick, label, count, dotColor }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        style={{ scrollSnapAlign: 'start' }}
        className={`relative px-3 md:px-4 py-3 font-raleway text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
          active ? 'text-henko-turquoise' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
        {label}
        <span className={`text-xs font-normal px-1.5 py-0.5 rounded-full ${
          active ? 'bg-henko-turquoise/10 text-henko-turquoise' : 'bg-gray-100 text-gray-400'
        }`}>
          {count}
        </span>
        {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-henko-turquoise rounded-full" />}
      </button>
    )
  }
)
