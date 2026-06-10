'use client'

import { useState, useEffect } from 'react'
import { agendarCita } from '@/actions/citas'
import { getTaskLists, type TaskList } from '@/actions/google-tasks'
import { getCalendars, type CalendarMeta } from '@/actions/google-calendar'
import { useAction } from '@/shared/feedback/FeedbackContext'
import CustomSelect from '@/shared/components/CustomSelect'

export type AgendarCitaRecurso = {
  tipo: 'solicitud' | 'lead' | 'cliente' | 'candidato'
  id: string
  nombre: string
  email?: string | null
  contexto?: string // oferta, servicio, asunto… (subtítulo + descripción del evento)
}

type Props = {
  recurso: AgendarCitaRecurso
  tiposCita: string[]
  tiposTarea: string[]
  onClose: () => void
  onDone: () => void
}

const DURACIONES = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 h 30 min' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const fmtLocal = (dt: Date) =>
  `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`

const TIPO_OTRO = '__otro__'

export default function AgendarCitaModal({ recurso, tiposCita, tiposTarea, onClose, onDone }: Props) {
  const runAction = useAction()
  const [tipo, setTipo] = useState(tiposCita[0] ?? TIPO_OTRO)
  const [asunto, setAsunto] = useState(recurso.nombre)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('10:00')
  const [duracion, setDuracion] = useState(45)
  const [calendarId, setCalendarId] = useState('')
  const [calendarios, setCalendarios] = useState<CalendarMeta[]>([])
  const [invitar, setInvitar] = useState(true)
  const [crearTarea, setCrearTarea] = useState(false)
  const [tipoTarea, setTipoTarea] = useState(tiposTarea[0] ?? TIPO_OTRO)
  const [tareaTitulo, setTareaTitulo] = useState('')
  const [tareaFecha, setTareaFecha] = useState('')
  const [taskListId, setTaskListId] = useState('')
  const [listas, setListas] = useState<TaskList[]>([])
  const [cargandoListas, setCargandoListas] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  // Carga los calendarios de Google al abrir; selecciona el principal por defecto
  useEffect(() => {
    let activo = true
    getCalendars()
      .then(cals => {
        if (!activo) return
        setCalendarios(cals)
        const principal = cals.find(c => c.primary) ?? cals[0]
        if (principal) setCalendarId(prev => prev || principal.id)
      })
      .catch(() => {})
    return () => { activo = false }
  }, [])

  // Carga las listas de Google Tasks la primera vez que se activa el toggle
  useEffect(() => {
    if (!crearTarea || listas.length || cargandoListas) return
    setCargandoListas(true)
    getTaskLists()
      .then(ls => { setListas(ls); if (ls[0]) setTaskListId(prev => prev || ls[0].id) })
      .catch(() => {})
      .finally(() => setCargandoListas(false))
  }, [crearTarea, listas.length, cargandoListas])

  // Título final del evento: "{Tipo} con {nombre}", o libre si el tipo es "Otro".
  const tipoBase = tipo && tipo !== TIPO_OTRO ? tipo : ''
  const tituloFinal = tipoBase
    ? (asunto.trim() ? `${tipoBase} con ${asunto.trim()}` : tipoBase)
    : asunto.trim()

  async function handleSubmit() {
    if (!fecha || !hora || !tituloFinal) return
    const startDate = new Date(`${fecha}T${hora}:00`)
    const endDate = new Date(startDate.getTime() + duracion * 60000)

    setEnviando(true)
    const result = await runAction(
      `Agendando: ${tituloFinal}`,
      () => agendarCita({
        recursoTipo: recurso.tipo,
        recursoId: recurso.id,
        tipo: tipoBase || undefined,
        titulo: tituloFinal,
        contactoNombre: recurso.nombre,
        contactoEmail: recurso.email || undefined,
        contexto: recurso.contexto || undefined,
        start: fmtLocal(startDate),
        end: fmtLocal(endDate),
        calendarId: calendarId || undefined,
        invitar,
        crearTarea,
        taskListId: crearTarea ? (taskListId || undefined) : undefined,
        tareaTitulo: crearTarea ? (tareaTitulo.trim() || undefined) : undefined,
        tareaFecha: crearTarea ? (tareaFecha || undefined) : undefined,
      }),
      { successMessage: 'Cita agendada en el calendario' },
    )
    setEnviando(false)
    if (result.ok) onDone()
  }

  const sinEmail = !recurso.email

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-black/5 flex-shrink-0">
          <div>
            <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1">AGENDAR CITA</p>
            <p className="font-roxborough text-xl text-gray-900 leading-tight">{recurso.nombre}</p>
            {recurso.contexto && <p className="text-[11px] text-gray-400 mt-0.5">{recurso.contexto}</p>}
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-5 overflow-y-auto flex-1">
          <Field label="TIPO">
            <CustomSelect
              value={tipo}
              onChange={setTipo}
              options={[...tiposCita.map(t => ({ value: t, label: t })), { value: TIPO_OTRO, label: 'Otro (personalizado)' }]}
              className="w-full"
            />
          </Field>

          <Field label={tipo === TIPO_OTRO ? 'TÍTULO' : 'NOMBRE'}>
            <input
              type="text"
              value={asunto}
              onChange={e => setAsunto(e.target.value)}
              placeholder={tipo === TIPO_OTRO ? 'Escribe el título del evento…' : 'Nombre del contacto'}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Se creará: <span className="text-gray-700 font-medium">{tituloFinal || '—'}</span>
            </p>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="FECHA">
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
              />
            </Field>
            <Field label="HORA">
              <input
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
              />
            </Field>
          </div>

          <Field label="DURACIÓN">
            <div className="grid grid-cols-4 gap-2">
              {DURACIONES.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuracion(d.value)}
                  className={`px-2 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    duracion === d.value
                      ? 'bg-henko-turquoise text-white'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </Field>

          {calendarios.length > 0 && (
            <Field label="CALENDARIO">
              <CustomSelect
                value={calendarId}
                onChange={setCalendarId}
                options={calendarios.map(c => ({ value: c.id, label: c.title }))}
                className="w-full"
              />
            </Field>
          )}

          <div className="space-y-2.5 pt-1">
            <Toggle
              checked={invitar && !sinEmail}
              disabled={sinEmail}
              onChange={setInvitar}
              label="Invitar por email + Google Meet"
              hint={sinEmail ? 'Sin email de contacto' : (recurso.email ?? '')}
            />
            <Toggle
              checked={crearTarea}
              onChange={(v) => {
                setCrearTarea(v)
                if (v && !tareaTitulo && tipoTarea !== TIPO_OTRO) setTareaTitulo(`${tipoTarea} — ${recurso.nombre}`)
                if (v && !tareaFecha && fecha) setTareaFecha(fecha)
              }}
              label="Crear tarea de seguimiento"
              hint="Se añadirá a Google Tasks"
            />

            {crearTarea && (
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-3">
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5">TIPO DE TAREA</p>
                  <CustomSelect
                    value={tipoTarea}
                    onChange={(v) => { setTipoTarea(v); if (v !== TIPO_OTRO) setTareaTitulo(`${v} — ${recurso.nombre}`) }}
                    options={[...tiposTarea.map(t => ({ value: t, label: t })), { value: TIPO_OTRO, label: 'Otro (personalizado)' }]}
                    className="w-full"
                  />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5">TÍTULO DE LA TAREA</p>
                  <input
                    type="text"
                    value={tareaTitulo}
                    onChange={e => setTareaTitulo(e.target.value)}
                    placeholder={`Preparar: ${tituloFinal || 'cita'}`}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise transition-colors"
                  />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5">FECHA DE LA TAREA</p>
                  <input
                    type="date"
                    value={tareaFecha}
                    onChange={e => setTareaFecha(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise transition-colors"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Si la dejas vacía, usa la fecha de la cita.</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5">LISTA</p>
                  {cargandoListas ? (
                    <p className="text-xs text-gray-400 py-2">Cargando listas…</p>
                  ) : listas.length ? (
                    <CustomSelect
                      value={taskListId}
                      onChange={setTaskListId}
                      options={listas.map(l => ({ value: l.id, label: l.title }))}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-xs text-gray-400 py-2">No se encontraron listas (se usará la principal).</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-black/5 flex items-center justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-500 hover:bg-black/5 transition-colors">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!fecha || !hora || !tituloFinal || enviando}
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {enviando ? 'Agendando…' : 'Agendar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">{label}</p>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
        disabled ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60' : 'border-gray-200 hover:border-henko-turquoise/50'
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-[11px] text-gray-400 truncate">{hint}</p>}
      </div>
      <span className={`relative w-10 h-6 rounded-full flex-shrink-0 transition-colors ${checked ? 'bg-henko-turquoise' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </span>
    </button>
  )
}
