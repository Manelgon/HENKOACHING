'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearOferta, actualizarOferta, cambiarEstadoOferta, eliminarOferta } from '@/actions/ofertas'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'

type Catalogo = { id: number; nombre: string; slug: string }

type OfertaView = {
  id: string
  titulo: string
  empresa: string
  ubicacion: string
  salario_texto: string
  descripcion: string
  requisitos: string[]
  ofrecemos: string[]
  estado: 'borrador' | 'publicada' | 'pausada' | 'cerrada'
  fecha: string
  sector_id: number | null
  modalidad_id: number | null
  jornada_id: number | null
  sector_nombre: string
  modalidad_nombre: string
  jornada_nombre: string
}

type Draft = {
  titulo: string
  empresa: string
  ubicacion: string
  modalidad_id: number
  jornada_id: number
  sector_id: number
  salario_texto: string
  descripcion: string
  requisitos: string
  ofrecemos: string
  estado: 'borrador' | 'publicada' | 'pausada' | 'cerrada'
}

type Props = {
  ofertas: OfertaView[]
  sectores: Catalogo[]
  modalidades: Catalogo[]
  jornadas: Catalogo[]
}

const labelClass = 'text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5 block'
const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm border-[1.5px] border-black/5 bg-henko-white outline-none focus:border-henko-turquoise transition-colors'

export default function AdminOfertas({ ofertas, sectores, modalidades, jornadas }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const [editando, setEditando] = useState<string | null>(null)
  const [nueva, setNueva] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft(sectores, modalidades, jornadas))
  const pagination = usePagination(ofertas, 20)

  const update = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft(d => ({ ...d, [k]: v }))

  const startEdit = (o: OfertaView) => {
    setEditando(o.id)
    setError(null)
    setDraft({
      titulo: o.titulo,
      empresa: o.empresa,
      ubicacion: o.ubicacion,
      modalidad_id: o.modalidad_id ?? modalidades[0]?.id ?? 0,
      jornada_id: o.jornada_id ?? jornadas[0]?.id ?? 0,
      sector_id: o.sector_id ?? sectores[0]?.id ?? 0,
      salario_texto: o.salario_texto,
      descripcion: o.descripcion,
      requisitos: o.requisitos.join('\n'),
      ofrecemos: o.ofrecemos.join('\n'),
      estado: o.estado,
    })
  }

  const save = async () => {
    if (!draft.titulo.trim() || !draft.empresa.trim() || !draft.descripcion.trim()) {
      setError('Título, empresa y descripción son obligatorios')
      return
    }
    setError(null)

    const input = {
      titulo: draft.titulo,
      empresa_nombre: draft.empresa,
      ubicacion: draft.ubicacion,
      modalidad_id: draft.modalidad_id,
      jornada_id: draft.jornada_id,
      sector_id: draft.sector_id,
      salario_texto: draft.salario_texto,
      descripcion: draft.descripcion,
      requisitos: draft.requisitos.split('\n').map(s => s.trim()).filter(Boolean),
      ofrecemos: draft.ofrecemos.split('\n').map(s => s.trim()).filter(Boolean),
      estado: draft.estado,
    }

    const description = editando ? 'Guardando cambios de la oferta' : 'Publicando oferta'
    const successMessage = editando ? 'Cambios guardados' : 'Oferta publicada'

    const result = await runAction(
      description,
      () => editando ? actualizarOferta(editando, input) : crearOferta(input),
      { successMessage },
    )

    if (!result.ok) {
      setError(result.error)
      return
    }
    cancel()
    router.refresh()
  }

  const cancel = () => {
    setEditando(null)
    setNueva(false)
    setError(null)
    setDraft(emptyDraft(sectores, modalidades, jornadas))
  }

  const toggleEstado = async (o: OfertaView) => {
    const nuevoEstado = o.estado === 'publicada' ? 'cerrada' : 'publicada'
    const description = nuevoEstado === 'publicada' ? `Activando "${o.titulo}"` : `Cerrando "${o.titulo}"`
    const successMessage = nuevoEstado === 'publicada' ? 'Oferta activada' : 'Oferta cerrada'
    const result = await runAction(description, () => cambiarEstadoOferta(o.id, nuevoEstado), { successMessage })
    if (result.ok) router.refresh()
  }

  const borrar = async (o: OfertaView) => {
    if (!confirm(`¿Eliminar oferta "${o.titulo}"?`)) return
    const result = await runAction(
      `Eliminando "${o.titulo}"`,
      () => eliminarOferta(o.id),
      { successMessage: 'Oferta eliminada' },
    )
    if (result.ok) router.refresh()
  }

  const modalAbierto = editando !== null || nueva

  useEffect(() => {
    if (!modalAbierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancel()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [modalAbierto])

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px] mb-1.5">Portal empleo</p>
          <h2 className="font-roxborough text-3xl text-gray-900">Ofertas publicadas</h2>
        </div>
        <button
          type="button"
          onClick={() => { setNueva(true); setDraft(emptyDraft(sectores, modalidades, jornadas)) }}
          className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
        >
          + Nueva oferta
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
        <div className="hidden md:grid px-5 lg:px-7 py-3.5 border-b border-black/5 grid-cols-[3fr_2fr_1fr_1fr_140px] text-[10px] tracking-widest text-gray-400 font-bold">
          <span>OFERTA</span><span>EMPRESA</span><span>MODALIDAD</span><span>ESTADO</span><span></span>
        </div>
        {ofertas.length === 0 && (
          <div className="px-5 md:px-7 py-12 text-center text-gray-400">
            <p className="text-sm">Aún no hay ofertas. Crea la primera con &quot;Nueva oferta&quot;.</p>
          </div>
        )}
        {pagination.paginated.map((o) => {
          const estadoBadge = (
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                o.estado === 'publicada' ? 'bg-henko-greenblue text-henko-turquoise' :
                o.estado === 'borrador' ? 'bg-henko-yellow text-yellow-900' :
                o.estado === 'pausada' ? 'bg-orange-100 text-orange-700' :
                'bg-black/5 text-gray-500'
              }`}
            >
              {o.estado === 'publicada' ? 'Activa' : o.estado === 'borrador' ? 'Borrador' : o.estado === 'pausada' ? 'Pausada' : 'Cerrada'}
            </span>
          )
          return (
            <div key={o.id} className="border-b border-black/5 last:border-0 hover:bg-henko-white/40 transition-colors">
              {/* Tabla (desktop/tablet) */}
              <div className="hidden md:grid px-5 lg:px-7 py-4 grid-cols-[3fr_2fr_1fr_1fr_140px] items-center">
                <div>
                  <p className="text-sm font-semibold">{o.titulo}</p>
                  <p className="text-[11px] text-gray-400">{o.fecha}</p>
                </div>
                <span className="text-sm text-gray-600">{o.empresa}</span>
                <span className="text-xs text-gray-500">{o.modalidad_nombre}</span>
                <span>{estadoBadge}</span>
                <div className="flex gap-2.5 text-xs">
                  <button type="button" onClick={() => startEdit(o)} className="text-henko-turquoise font-semibold hover:underline">
                    Editar
                  </button>
                  <button type="button" onClick={() => toggleEstado(o)} className="text-gray-400 hover:text-gray-700">
                    {o.estado === 'publicada' ? 'Cerrar' : 'Activar'}
                  </button>
                  <button type="button" onClick={() => borrar(o)} className="text-red-400 hover:text-red-600">
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Tarjeta (móvil) */}
              <div className="md:hidden px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{o.titulo}</p>
                    <p className="text-[11px] text-gray-400">{o.empresa} · {o.fecha}</p>
                  </div>
                  <div className="flex-shrink-0">{estadoBadge}</div>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">{o.modalidad_nombre}</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <button type="button" onClick={() => startEdit(o)} className="text-henko-turquoise font-semibold hover:underline">
                    Editar
                  </button>
                  <button type="button" onClick={() => toggleEstado(o)} className="text-gray-500 hover:text-gray-900">
                    {o.estado === 'publicada' ? 'Cerrar' : 'Activar'}
                  </button>
                  <button type="button" onClick={() => borrar(o)} className="text-red-400 hover:text-red-600">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )
        })}

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

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm px-3 py-4 sm:px-4 sm:py-10"
          onClick={cancel}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl border border-black/5 w-full max-w-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 sm:px-9 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-black/5">
              <h2 className="font-roxborough text-xl sm:text-2xl text-gray-900">
                {nueva ? 'Nueva oferta' : 'Editar oferta'}
              </h2>
              <button
                type="button"
                onClick={cancel}
                aria-label="Cerrar"
                className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 sm:px-9 py-5 sm:py-7">
              <Field label="TÍTULO DEL PUESTO" value={draft.titulo} onChange={(v) => update('titulo', v)} placeholder="ej. Responsable de Operaciones" />
              <Field label="EMPRESA" value={draft.empresa} onChange={(v) => update('empresa', v)} placeholder="Nombre de la empresa (se crea si no existe)" />
              <Field label="UBICACIÓN" value={draft.ubicacion} onChange={(v) => update('ubicacion', v)} placeholder="Palma, Mallorca" />
              <Field label="SALARIO" value={draft.salario_texto} onChange={(v) => update('salario_texto', v)} placeholder="ej. 30.000 – 36.000 €/año" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <SelectField label="MODALIDAD" value={draft.modalidad_id} onChange={(v) => update('modalidad_id', v)} options={modalidades} />
                <SelectField label="JORNADA" value={draft.jornada_id} onChange={(v) => update('jornada_id', v)} options={jornadas} />
                <SelectField label="SECTOR" value={draft.sector_id} onChange={(v) => update('sector_id', v)} options={sectores} />
              </div>

              <div className="mb-4">
                <label className={labelClass}>ESTADO</label>
                <select
                  className={inputClass + ' appearance-none'}
                  value={draft.estado}
                  onChange={(e) => update('estado', e.target.value as Draft['estado'])}
                >
                  <option value="borrador">Borrador (no visible)</option>
                  <option value="publicada">Publicada</option>
                  <option value="pausada">Pausada</option>
                  <option value="cerrada">Cerrada</option>
                </select>
              </div>

              <div className="mb-4">
                <label className={labelClass}>DESCRIPCIÓN</label>
                <textarea
                  rows={5}
                  className={inputClass + ' resize-y leading-relaxed'}
                  placeholder="Describe el puesto, responsabilidades y contexto..."
                  value={draft.descripcion}
                  onChange={(e) => update('descripcion', e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className={labelClass}>REQUISITOS (uno por línea)</label>
                <textarea
                  rows={4}
                  className={inputClass + ' resize-y leading-relaxed'}
                  placeholder="Experiencia mínima 3 años&#10;Inglés C1&#10;..."
                  value={draft.requisitos}
                  onChange={(e) => update('requisitos', e.target.value)}
                />
              </div>

              <div className="mb-2">
                <label className={labelClass}>QUÉ OFRECEMOS (uno por línea)</label>
                <textarea
                  rows={4}
                  className={inputClass + ' resize-y leading-relaxed'}
                  placeholder="Salario competitivo&#10;Horario flexible&#10;..."
                  value={draft.ofrecemos}
                  onChange={(e) => update('ofrecemos', e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 px-5 sm:px-9 py-4 sm:py-5 border-t border-black/5">
              <button
                type="button"
                onClick={cancel}
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={save}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
              >
                {nueva ? 'Publicar oferta' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function emptyDraft(sectores: Catalogo[], modalidades: Catalogo[], jornadas: Catalogo[]): Draft {
  return {
    titulo: '',
    empresa: '',
    ubicacion: '',
    modalidad_id: modalidades[0]?.id ?? 0,
    jornada_id: jornadas[0]?.id ?? 0,
    sector_id: sectores[0]?.id ?? 0,
    salario_texto: '',
    descripcion: '',
    requisitos: '',
    ofrecemos: '',
    estado: 'publicada',
  }
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="mb-4">
      <label className={labelClass}>{label}</label>
      <input className={inputClass} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: number; onChange: (v: number) => void; options: Catalogo[] }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select className={inputClass + ' appearance-none'} value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
      </select>
    </div>
  )
}
