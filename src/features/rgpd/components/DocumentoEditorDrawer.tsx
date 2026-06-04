'use client'

import { useEffect, useState } from 'react'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { guardarDocumento } from '@/actions/rgpd'
import type {
  RgpdDocId, RgpdDocumento,
  ContenidoRopa, ActividadRopa,
  ContenidoRunbook,
  ContenidoPoliticaIa, HerramientaIa,
  ContenidoFormacionIa, RegistroFormacion,
  ContenidoDpiaChecklist,
  ContenidoSubencargados, Subencargado,
  ContenidoResponsableIncidentes,
} from '@/features/rgpd/types'

const inputCls = 'w-full px-3 py-2 rounded-xl text-sm border-[1.5px] border-gray-200 bg-white outline-none focus:border-henko-turquoise transition-colors font-raleway'
const labelCls = 'block text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1'
const textareaCls = inputCls + ' resize-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

// ── Responsable de incidentes ────────────────────────────────────────────────
function EditorResponsable({ doc, onSaved }: { doc: RgpdDocumento; onSaved: (c: Record<string, unknown>) => void }) {
  const runAction = useAction()
  const init = doc.contenido as unknown as ContenidoResponsableIncidentes
  const [form, setForm] = useState<ContenidoResponsableIncidentes>({
    nombre: init.nombre ?? '',
    email: init.email ?? '',
    telefono: init.telefono ?? '',
    nif: init.nif ?? '',
    rol: init.rol ?? '',
    procedimiento: init.procedimiento ?? '',
    ultima_revision: init.ultima_revision ?? '',
  })
  const set = (k: keyof ContenidoResponsableIncidentes, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    const r = await runAction('Guardando', () => guardarDocumento(doc.id, form as unknown as Record<string, unknown>), { successMessage: 'Guardado' })
    if (r.ok) onSaved(form as unknown as Record<string, unknown>)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre completo"><input className={inputCls} value={form.nombre} onChange={e => set('nombre', e.target.value)} /></Field>
        <Field label="NIF"><input className={inputCls} value={form.nif} onChange={e => set('nif', e.target.value)} /></Field>
        <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={e => set('email', e.target.value)} /></Field>
        <Field label="Teléfono"><input className={inputCls} value={form.telefono} onChange={e => set('telefono', e.target.value)} /></Field>
      </div>
      <Field label="Rol"><input className={inputCls} value={form.rol} onChange={e => set('rol', e.target.value)} /></Field>
      <Field label="Procedimiento en caso de brecha">
        <textarea className={textareaCls} rows={3} value={form.procedimiento} onChange={e => set('procedimiento', e.target.value)} />
      </Field>
      <Field label="Fecha última revisión">
        <input className={inputCls} type="date" value={form.ultima_revision} onChange={e => set('ultima_revision', e.target.value)} />
      </Field>
      <SaveButton onClick={save} />
    </div>
  )
}

// ── Runbook ──────────────────────────────────────────────────────────────────
function EditorRunbook({ doc, onSaved }: { doc: RgpdDocumento; onSaved: (c: Record<string, unknown>) => void }) {
  const runAction = useAction()
  const init = doc.contenido as unknown as ContenidoRunbook
  const [pasos, setPasos] = useState(init.pasos ?? [])
  const [contacto, setContacto] = useState(init.contacto_responsable ?? '')
  const [enlace, setEnlace] = useState(init.enlace_aepd ?? '')

  function updatePaso(i: number, k: 'titulo' | 'descripcion', v: string) {
    setPasos(ps => ps.map((p, idx) => idx === i ? { ...p, [k]: v } : p))
  }

  async function save() {
    const contenido: ContenidoRunbook = { pasos, contacto_responsable: contacto, enlace_aepd: enlace }
    const r = await runAction('Guardando', () => guardarDocumento(doc.id, contenido as unknown as Record<string, unknown>), { successMessage: 'Guardado' })
    if (r.ok) onSaved(contenido as unknown as Record<string, unknown>)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {pasos.map((paso, i) => (
          <div key={paso.orden} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-henko-turquoise text-white text-xs font-bold flex items-center justify-center shrink-0">{paso.orden}</span>
              <input className={inputCls + ' flex-1'} value={paso.titulo} onChange={e => updatePaso(i, 'titulo', e.target.value)} placeholder="Título del paso" />
            </div>
            <textarea className={textareaCls} rows={2} value={paso.descripcion} onChange={e => updatePaso(i, 'descripcion', e.target.value)} placeholder="Descripción" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Contacto responsable"><input className={inputCls} value={contacto} onChange={e => setContacto(e.target.value)} /></Field>
        <Field label="Enlace Comunica-Brecha AEPD"><input className={inputCls} value={enlace} onChange={e => setEnlace(e.target.value)} /></Field>
      </div>
      <SaveButton onClick={save} />
    </div>
  )
}

// ── Política IA ───────────────────────────────────────────────────────────────
function EditorPoliticaIa({ doc, onSaved }: { doc: RgpdDocumento; onSaved: (c: Record<string, unknown>) => void }) {
  const runAction = useAction()
  const init = doc.contenido as unknown as ContenidoPoliticaIa
  const [tools, setTools] = useState<HerramientaIa[]>(init.herramientas_permitidas ?? [])
  const [reglas, setReglas] = useState<string[]>(init.reglas_generales ?? [])
  const [aprobacion, setAprobacion] = useState(init.aprobacion_nuevas_integraciones ?? '')
  const [revision, setRevision] = useState(init.ultima_revision ?? '')

  function updateTool(i: number, k: keyof HerramientaIa, v: string) {
    setTools(ts => ts.map((t, idx) => idx === i ? { ...t, [k]: v } : t))
  }
  function addTool() {
    setTools(ts => [...ts, { nombre: '', uso: '', datos_permitidos: '', datos_prohibidos: '' }])
  }
  function removeTool(i: number) { setTools(ts => ts.filter((_, idx) => idx !== i)) }
  function updateRegla(i: number, v: string) { setReglas(rs => rs.map((r, idx) => idx === i ? v : r)) }
  function addRegla() { setReglas(rs => [...rs, '']) }
  function removeRegla(i: number) { setReglas(rs => rs.filter((_, idx) => idx !== i)) }

  async function save() {
    const contenido: ContenidoPoliticaIa = {
      herramientas_permitidas: tools,
      reglas_generales: reglas,
      aprobacion_nuevas_integraciones: aprobacion,
      ultima_revision: revision,
    }
    const r = await runAction('Guardando', () => guardarDocumento(doc.id, contenido as unknown as Record<string, unknown>), { successMessage: 'Guardado' })
    if (r.ok) onSaved(contenido as unknown as Record<string, unknown>)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className={labelCls + ' mb-3'}>HERRAMIENTAS DE IA PERMITIDAS</p>
        <div className="space-y-3">
          {tools.map((t, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-center gap-2">
                <Field label="Herramienta"><input className={inputCls} value={t.nombre} onChange={e => updateTool(i, 'nombre', e.target.value)} /></Field>
                <button type="button" onClick={() => removeTool(i)} className="mt-5 p-1 rounded text-red-400 hover:text-red-600"><XIcon /></button>
              </div>
              <Field label="Uso autorizado"><input className={inputCls} value={t.uso} onChange={e => updateTool(i, 'uso', e.target.value)} /></Field>
              <Field label="Datos permitidos"><textarea className={textareaCls} rows={2} value={t.datos_permitidos} onChange={e => updateTool(i, 'datos_permitidos', e.target.value)} /></Field>
              <Field label="Datos PROHIBIDOS"><textarea className={textareaCls} rows={2} value={t.datos_prohibidos} onChange={e => updateTool(i, 'datos_prohibidos', e.target.value)} /></Field>
            </div>
          ))}
          <button type="button" onClick={addTool} className="text-xs font-raleway text-henko-turquoise font-semibold hover:underline">+ Añadir herramienta</button>
        </div>
      </div>
      <div>
        <p className={labelCls + ' mb-2'}>REGLAS GENERALES</p>
        <div className="space-y-2">
          {reglas.map((r, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2.5 text-xs text-gray-400 font-semibold w-4 shrink-0">{i + 1}.</span>
              <input className={inputCls + ' flex-1'} value={r} onChange={e => updateRegla(i, e.target.value)} />
              <button type="button" onClick={() => removeRegla(i)} className="mt-2 p-1 text-red-400 hover:text-red-600"><XIcon /></button>
            </div>
          ))}
          <button type="button" onClick={addRegla} className="text-xs font-raleway text-henko-turquoise font-semibold hover:underline">+ Añadir regla</button>
        </div>
      </div>
      <Field label="Quién aprueba nuevas integraciones de IA">
        <input className={inputCls} value={aprobacion} onChange={e => setAprobacion(e.target.value)} />
      </Field>
      <Field label="Fecha última revisión">
        <input className={inputCls} type="date" value={revision} onChange={e => setRevision(e.target.value)} />
      </Field>
      <SaveButton onClick={save} />
    </div>
  )
}

// ── Formación IA ─────────────────────────────────────────────────────────────
function EditorFormacionIa({ doc, onSaved }: { doc: RgpdDocumento; onSaved: (c: Record<string, unknown>) => void }) {
  const runAction = useAction()
  const init = doc.contenido as unknown as ContenidoFormacionIa
  const [registros, setRegistros] = useState<RegistroFormacion[]>(init.registros ?? [])

  function update(i: number, k: keyof RegistroFormacion, v: string) {
    setRegistros(rs => rs.map((r, idx) => idx === i ? { ...r, [k]: v } : r))
  }
  function add() { setRegistros(rs => [...rs, { persona: '', fecha: '', curso: '', horas: '' }]) }
  function remove(i: number) { setRegistros(rs => rs.filter((_, idx) => idx !== i)) }

  async function save() {
    const contenido: ContenidoFormacionIa = { registros }
    const r = await runAction('Guardando', () => guardarDocumento(doc.id, contenido as unknown as Record<string, unknown>), { successMessage: 'Guardado' })
    if (r.ok) onSaved(contenido as unknown as Record<string, unknown>)
  }

  return (
    <div className="space-y-4">
      <p className="font-raleway text-xs text-gray-500">Registra aquí cada formación sobre IA que haya hecho el equipo. Obligatorio desde febrero 2025 (art. 4 EU AI Act).</p>
      {registros.length === 0 && (
        <div className="py-8 text-center">
          <p className="font-raleway text-sm text-gray-400">Sin registros aún. Añade el primero.</p>
        </div>
      )}
      <div className="space-y-3">
        {registros.map((reg, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Persona"><input className={inputCls} value={reg.persona} onChange={e => update(i, 'persona', e.target.value)} /></Field>
              <Field label="Fecha"><input className={inputCls} type="date" value={reg.fecha} onChange={e => update(i, 'fecha', e.target.value)} /></Field>
              <Field label="Curso / Material"><input className={inputCls} value={reg.curso} onChange={e => update(i, 'curso', e.target.value)} /></Field>
              <Field label="Horas"><input className={inputCls} value={reg.horas} onChange={e => update(i, 'horas', e.target.value)} placeholder="ej: 2h" /></Field>
            </div>
            <button type="button" onClick={() => remove(i)} className="mt-2 text-xs text-red-400 font-raleway hover:text-red-600">Eliminar registro</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="text-xs font-raleway text-henko-turquoise font-semibold hover:underline">+ Añadir registro de formación</button>
      <SaveButton onClick={save} />
    </div>
  )
}

// ── DPIA Checklist ───────────────────────────────────────────────────────────
function EditorDpiaChecklist({ doc, onSaved }: { doc: RgpdDocumento; onSaved: (c: Record<string, unknown>) => void }) {
  const runAction = useAction()
  const init = doc.contenido as unknown as ContenidoDpiaChecklist
  const [decision, setDecision] = useState<'requerida' | 'no_requerida'>(init.decision ?? 'no_requerida')
  const [fecha, setFecha] = useState(init.fecha_decision ?? '')
  const [razonamiento, setRazonamiento] = useState(init.razonamiento ?? '')
  const [criterios, setCriterios] = useState(init.criterios ?? [])

  function updateCriterio(i: number, k: 'aplica' | 'nota', v: boolean | string) {
    setCriterios(cs => cs.map((c, idx) => idx === i ? { ...c, [k]: v } : c))
  }

  async function save() {
    const contenido: ContenidoDpiaChecklist = { decision, fecha_decision: fecha, razonamiento, criterios }
    const r = await runAction('Guardando', () => guardarDocumento(doc.id, contenido as unknown as Record<string, unknown>), { successMessage: 'Guardado' })
    if (r.ok) onSaved(contenido as unknown as Record<string, unknown>)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Decisión">
          <select className={inputCls} value={decision} onChange={e => setDecision(e.target.value as 'requerida' | 'no_requerida')}>
            <option value="no_requerida">No requerida</option>
            <option value="requerida">Requerida</option>
          </select>
        </Field>
        <Field label="Fecha de la decisión">
          <input className={inputCls} type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </Field>
      </div>
      <Field label="Razonamiento">
        <textarea className={textareaCls} rows={3} value={razonamiento} onChange={e => setRazonamiento(e.target.value)} />
      </Field>
      <div>
        <p className={labelCls + ' mb-2'}>CRITERIOS EVALUADOS (art. 35 RGPD)</p>
        <div className="space-y-2">
          {criterios.map((c, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={c.aplica}
                  onChange={e => updateCriterio(i, 'aplica', e.target.checked)}
                  className="w-4 h-4 accent-henko-turquoise"
                />
                <span className="font-raleway text-sm text-gray-700">{c.criterio}</span>
              </div>
              <input className={inputCls + ' text-xs'} value={c.nota} onChange={e => updateCriterio(i, 'nota', e.target.value)} placeholder="Nota / justificación" />
            </div>
          ))}
        </div>
      </div>
      <SaveButton onClick={save} />
    </div>
  )
}

// ── Subencargados ────────────────────────────────────────────────────────────
function EditorSubencargados({ doc, onSaved }: { doc: RgpdDocumento; onSaved: (c: Record<string, unknown>) => void }) {
  const runAction = useAction()
  const init = doc.contenido as unknown as ContenidoSubencargados
  const [subs, setSubs] = useState<Subencargado[]>(init.subencargados ?? [])

  function update(i: number, k: keyof Subencargado, v: string | boolean) {
    setSubs(ss => ss.map((s, idx) => idx === i ? { ...s, [k]: v } : s))
  }
  function add() {
    setSubs(ss => [...ss, { nombre: '', servicio: '', pais: '', dpa_firmado: false, enlace_dpa: '', datos_tratados: '' }])
  }
  function remove(i: number) { setSubs(ss => ss.filter((_, idx) => idx !== i)) }

  async function save() {
    const contenido: ContenidoSubencargados = { subencargados: subs }
    const r = await runAction('Guardando', () => guardarDocumento(doc.id, contenido as unknown as Record<string, unknown>), { successMessage: 'Guardado' })
    if (r.ok) onSaved(contenido as unknown as Record<string, unknown>)
  }

  return (
    <div className="space-y-4">
      {subs.map((s, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre"><input className={inputCls} value={s.nombre} onChange={e => update(i, 'nombre', e.target.value)} /></Field>
            <Field label="Servicio"><input className={inputCls} value={s.servicio} onChange={e => update(i, 'servicio', e.target.value)} /></Field>
            <Field label="País / Región"><input className={inputCls} value={s.pais} onChange={e => update(i, 'pais', e.target.value)} /></Field>
            <Field label="Enlace DPA"><input className={inputCls} value={s.enlace_dpa} onChange={e => update(i, 'enlace_dpa', e.target.value)} /></Field>
          </div>
          <Field label="Datos tratados">
            <input className={inputCls} value={s.datos_tratados} onChange={e => update(i, 'datos_tratados', e.target.value)} />
          </Field>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={s.dpa_firmado} onChange={e => update(i, 'dpa_firmado', e.target.checked)} className="w-4 h-4 accent-henko-turquoise" />
              <span className="font-raleway text-sm text-gray-700">DPA firmado</span>
            </label>
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 font-raleway hover:text-red-600">Eliminar</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs font-raleway text-henko-turquoise font-semibold hover:underline">+ Añadir subencargado</button>
      <SaveButton onClick={save} />
    </div>
  )
}

// ── RoPA / Actividades de tratamiento ────────────────────────────────────────
function EditorRopa({ doc, onSaved }: { doc: RgpdDocumento; onSaved: (c: Record<string, unknown>) => void }) {
  const runAction = useAction()
  const init = doc.contenido as unknown as ContenidoRopa
  const [actividades, setActividades] = useState<ActividadRopa[]>(init.actividades ?? [])

  function update(i: number, k: keyof ActividadRopa, v: string) {
    setActividades(as => as.map((a, idx) => idx === i ? { ...a, [k]: v } : a))
  }
  function add() {
    setActividades(as => [...as, {
      nombre: '', finalidad: '', base_legal: '', categorias_datos: '',
      destinatarios: '', transferencias_internacionales: '', plazo_conservacion: '',
    }])
  }
  function remove(i: number) { setActividades(as => as.filter((_, idx) => idx !== i)) }

  async function save() {
    const contenido: ContenidoRopa = { actividades }
    const r = await runAction('Guardando', () => guardarDocumento(doc.id, contenido as unknown as Record<string, unknown>), { successMessage: 'Guardado' })
    if (r.ok) onSaved(contenido as unknown as Record<string, unknown>)
  }

  return (
    <div className="space-y-4">
      <p className="font-raleway text-xs text-gray-500">Registra cada actividad de tratamiento de datos que realizas. La AEPD puede pedirte este documento en cualquier inspección.</p>
      {actividades.map((a, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-raleway text-sm font-semibold text-gray-700">Actividad {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 font-raleway hover:text-red-600">Eliminar</button>
          </div>
          <Field label="Nombre de la actividad"><input className={inputCls} value={a.nombre} onChange={e => update(i, 'nombre', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Finalidad"><input className={inputCls} value={a.finalidad} onChange={e => update(i, 'finalidad', e.target.value)} /></Field>
            <Field label="Base legal"><input className={inputCls} value={a.base_legal} onChange={e => update(i, 'base_legal', e.target.value)} /></Field>
            <Field label="Categorías de datos"><input className={inputCls} value={a.categorias_datos} onChange={e => update(i, 'categorias_datos', e.target.value)} /></Field>
            <Field label="Destinatarios"><input className={inputCls} value={a.destinatarios} onChange={e => update(i, 'destinatarios', e.target.value)} /></Field>
            <Field label="Transferencias internacionales"><input className={inputCls} value={a.transferencias_internacionales} onChange={e => update(i, 'transferencias_internacionales', e.target.value)} /></Field>
            <Field label="Plazo de conservación"><input className={inputCls} value={a.plazo_conservacion} onChange={e => update(i, 'plazo_conservacion', e.target.value)} /></Field>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs font-raleway text-henko-turquoise font-semibold hover:underline">+ Añadir actividad</button>
      <SaveButton onClick={save} />
    </div>
  )
}

// ── Componentes utilitarios ───────────────────────────────────────────────────
function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="pt-2 border-t border-gray-100">
      <button
        type="button"
        onClick={onClick}
        className="w-full py-2.5 rounded-xl bg-henko-turquoise text-white text-sm font-raleway font-semibold hover:bg-henko-turquoise-light transition-colors"
      >
        Guardar cambios
      </button>
    </div>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ── Drawer principal ─────────────────────────────────────────────────────────
const TITULOS: Record<RgpdDocId, string> = {
  ropa: 'Registro de Actividades de Tratamiento',
  runbook: 'Runbook de brecha de datos',
  politica_ia: 'Política de uso de IA del equipo',
  formacion_ia: 'Registro de formación en IA',
  dpia_checklist: 'Checklist DPIA',
  subencargados: 'Inventario de subencargados',
  responsable_incidentes: 'Responsable de incidentes',
}

export default function DocumentoEditorDrawer({
  doc,
  onClose,
  onSaved,
}: {
  doc: RgpdDocumento
  onClose: () => void
  onSaved: (id: RgpdDocId, contenido: Record<string, unknown>) => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function handleSaved(contenido: Record<string, unknown>) {
    onSaved(doc.id, contenido)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />
      <div
        className="w-full max-w-2xl bg-white flex flex-col h-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-roxborough text-xl text-gray-900">{TITULOS[doc.id]}</h2>
            <p className="font-raleway text-xs text-gray-400 mt-1">{doc.descripcion}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {doc.id === 'ropa' && <EditorRopa doc={doc} onSaved={handleSaved} />}
          {doc.id === 'runbook' && <EditorRunbook doc={doc} onSaved={handleSaved} />}
          {doc.id === 'politica_ia' && <EditorPoliticaIa doc={doc} onSaved={handleSaved} />}
          {doc.id === 'formacion_ia' && <EditorFormacionIa doc={doc} onSaved={handleSaved} />}
          {doc.id === 'dpia_checklist' && <EditorDpiaChecklist doc={doc} onSaved={handleSaved} />}
          {doc.id === 'subencargados' && <EditorSubencargados doc={doc} onSaved={handleSaved} />}
          {doc.id === 'responsable_incidentes' && <EditorResponsable doc={doc} onSaved={handleSaved} />}
        </div>
      </div>
    </div>
  )
}
