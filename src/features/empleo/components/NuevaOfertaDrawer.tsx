'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearOferta } from '@/actions/ofertas'
import { useAction } from '@/shared/feedback/FeedbackContext'
import CustomSelect from '@/shared/components/CustomSelect'

export type Catalogo = { id: number; nombre: string; slug: string }
export type EmpresaOption = { id: string; nombre: string; ubicacion: string | null }

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

const labelClass = 'text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5 block'
const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm border-[1.5px] border-gray-200 bg-henko-white outline-none focus:border-henko-turquoise transition-colors'

function emptyDraft(): Draft {
  return {
    titulo: '', empresa: '', empresa_oculta: false, ubicacion: '', estado: '' as const,
    modalidad_id: 0,
    jornada_id: 0,
    sector_id: 0,
    salario_texto: '', reporta_a: '', contrato: '', descripcion: '',
    funciones: '', requisitos: '', competencias: '', ofrecemos: '',
    fecha_expiracion: '',
  }
}

type Props = {
  sectores: Catalogo[]
  modalidades: Catalogo[]
  jornadas: Catalogo[]
  empresas: EmpresaOption[]
  onClose: () => void
}

export default function NuevaOfertaDrawer({ sectores, modalidades, jornadas, empresas, onClose }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const update = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft(d => ({ ...d, [k]: v }))

  const save = async () => {
    if (!draft.titulo.trim() || !draft.empresa.trim() || !draft.descripcion.trim() || !draft.estado || !draft.modalidad_id || !draft.jornada_id || !draft.fecha_expiracion) {
      setError('Título, empresa, descripción, estado, modalidad, jornada y fecha límite son obligatorios')
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
    onClose()
    router.refresh()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative h-full w-full max-w-2xl bg-white flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-black/5 bg-white sticky top-0 z-10">
          <h2 className="font-roxborough text-2xl text-gray-900">Nueva oferta</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
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
            onClick={onClose}
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
  )
}

// ─── Formulario creación ──────────────────────────────────────────────────────
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
        <label className={labelClass}>FECHA LÍMITE <span className="text-red-400 normal-case tracking-normal">* (obligatoria — Google deja de mostrar la oferta al caducar)</span></label>
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
