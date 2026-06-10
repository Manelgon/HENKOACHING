'use client'

import { useEffect, useState } from 'react'
import { getCitasByRecurso, type CitaHistorial } from '@/actions/citas'
import AgendarCitaModal, { type AgendarCitaRecurso } from '@/shared/components/AgendarCitaModal'

// Historial de citas y tareas de un recurso del CRM (lead, cliente, candidato,
// solicitud). Carga sus datos al montar y se refresca al agendar desde aquí.
// `compact`: versión para drawers (sin card envolvente).
type Props = {
  recurso: AgendarCitaRecurso
  tiposCita: string[]
  tiposTarea: string[]
  compact?: boolean
}

const ICON_CAL = 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5'
const ICON_TASK = 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'

function fmtFecha(iso: string, conHora: boolean) {
  const d = new Date(iso)
  const fecha = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' })
  if (!conHora) return fecha
  const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })
  return `${fecha} · ${hora}`
}

export default function CitasHistorial({ recurso, tiposCita, tiposTarea, compact }: Props) {
  const [citas, setCitas] = useState<CitaHistorial[]>([])
  const [cargando, setCargando] = useState(true)
  const [agendarOpen, setAgendarOpen] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let activo = true
    setCargando(true)
    getCitasByRecurso(recurso.tipo, recurso.id)
      .then(rows => { if (activo) setCitas(rows) })
      .catch(() => {})
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [recurso.tipo, recurso.id, reload])

  const ahora = Date.now()
  const proximas = citas
    .filter(c => new Date(c.start_at).getTime() >= ahora)
    .sort((a, b) => a.start_at.localeCompare(b.start_at))
  const pasadas = citas.filter(c => new Date(c.start_at).getTime() < ahora)

  const contenido = (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className={compact
          ? 'font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest'
          : 'font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px]'}>
          Citas
        </p>
        <button
          type="button"
          onClick={() => setAgendarOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-henko-turquoise text-white text-xs font-raleway font-semibold hover:bg-henko-turquoise-light transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={ICON_CAL} />
          </svg>
          Agendar cita
        </button>
      </div>

      {cargando ? (
        <p className="text-xs text-gray-400 font-raleway">Cargando…</p>
      ) : citas.length === 0 ? (
        <p className="text-xs text-gray-400 font-raleway italic">
          Aún no hay citas registradas. Las citas agendadas desde aquí o desde el calendario aparecerán en este historial.
        </p>
      ) : (
        <div className="space-y-5">
          {proximas.length > 0 && (
            <ListaCitas titulo="Próximas" citas={proximas} destacar />
          )}
          {pasadas.length > 0 && (
            <ListaCitas titulo="Anteriores" citas={pasadas} />
          )}
        </div>
      )}

      {agendarOpen && (
        <AgendarCitaModal
          recurso={recurso}
          tiposCita={tiposCita}
          tiposTarea={tiposTarea}
          onClose={() => setAgendarOpen(false)}
          onDone={() => { setAgendarOpen(false); setReload(n => n + 1) }}
        />
      )}
    </>
  )

  if (compact) return <div>{contenido}</div>
  return <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">{contenido}</div>
}

function ListaCitas({ titulo, citas, destacar }: { titulo: string; citas: CitaHistorial[]; destacar?: boolean }) {
  return (
    <div>
      <p className="font-raleway text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{titulo}</p>
      <div className="space-y-2">
        {citas.map(c => {
          const esTarea = c.clase === 'tarea'
          return (
            <div
              key={c.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                destacar ? 'border-henko-turquoise/30 bg-henko-turquoise/5' : 'border-gray-100 bg-gray-50/60'
              }`}
            >
              <span className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                esTarea ? 'bg-henko-yellow/40 text-yellow-700' : 'bg-henko-turquoise/15 text-henko-turquoise'
              }`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={esTarea ? ICON_TASK : ICON_CAL} />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="font-raleway text-sm font-semibold text-gray-800 truncate">{c.titulo}</p>
                  {c.tipo && (
                    <span className="font-raleway text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                      {c.tipo}
                    </span>
                  )}
                  {esTarea && (
                    <span className="font-raleway text-[10px] px-2 py-0.5 rounded-full bg-henko-yellow/40 text-yellow-800 font-semibold">
                      Tarea
                    </span>
                  )}
                </div>
                <p className="font-raleway text-xs text-gray-500 mt-0.5">
                  {fmtFecha(c.start_at, !esTarea)}
                  {c.invitado && c.contacto_email && (
                    <span className="text-green-600"> · Invitado ✓ ({c.contacto_email})</span>
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
