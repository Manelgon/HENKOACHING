'use client'

import { useState } from 'react'
import { OFERTAS, type Oferta } from '@/features/empleo/data'

type Draft = {
  titulo: string
  empresa: string
  ubicacion: string
  modalidad: Oferta['modalidad']
  jornada: Oferta['jornada']
  sector: string
  salario: string
  desc: string
}

const emptyDraft: Draft = {
  titulo: '', empresa: '', ubicacion: '',
  modalidad: 'Presencial', jornada: 'Completa',
  sector: 'Operaciones', salario: '', desc: '',
}

const labelClass = 'text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5 block'
const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm border-[1.5px] border-black/5 bg-henko-white outline-none focus:border-henko-turquoise transition-colors'

export default function AdminOfertas() {
  const [ofertas, setOfertas] = useState<Oferta[]>(OFERTAS)
  const [editando, setEditando] = useState<number | null>(null)
  const [nueva, setNueva] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const update = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft(d => ({ ...d, [k]: v }))

  const startEdit = (o: Oferta) => {
    setEditando(o.id)
    setDraft({
      titulo: o.titulo,
      empresa: o.empresa,
      ubicacion: o.ubicacion,
      modalidad: o.modalidad,
      jornada: o.jornada,
      sector: o.sector,
      salario: o.salario,
      desc: o.desc,
    })
  }

  const save = () => {
    if (editando) {
      setOfertas(arr => arr.map(x => x.id === editando ? { ...x, ...draft } : x))
    } else {
      setOfertas(arr => [
        ...arr,
        {
          ...draft,
          id: Date.now(),
          fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
          activa: true,
          requisitos: [],
          ofrecemos: [],
        },
      ])
    }
    setEditando(null)
    setNueva(false)
    setDraft(emptyDraft)
  }

  const cancel = () => {
    setEditando(null)
    setNueva(false)
    setDraft(emptyDraft)
  }

  if (editando || nueva) {
    return (
      <div>
        <button
          type="button"
          onClick={cancel}
          className="text-sm text-henko-turquoise font-semibold mb-6 hover:underline"
        >
          ← Volver
        </button>
        <h2 className="font-roxborough text-3xl text-gray-900 mb-7">
          {nueva ? 'Nueva oferta' : 'Editar oferta'}
        </h2>

        <div className="bg-white rounded-3xl p-9 border border-black/5 max-w-2xl">
          {([
            ['TÍTULO DEL PUESTO', 'titulo', 'ej. Responsable de Operaciones'],
            ['EMPRESA', 'empresa', 'Nombre de la empresa'],
            ['UBICACIÓN', 'ubicacion', 'Palma, Mallorca'],
            ['SALARIO', 'salario', 'ej. 30.000 – 36.000 €/año'],
          ] as const).map(([l, k, ph]) => (
            <div key={k} className="mb-4">
              <label className={labelClass}>{l}</label>
              <input className={inputClass} placeholder={ph} value={draft[k]} onChange={(e) => update(k, e.target.value)} />
            </div>
          ))}

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className={labelClass}>MODALIDAD</label>
              <select className={inputClass + ' appearance-none'} value={draft.modalidad} onChange={(e) => update('modalidad', e.target.value as Oferta['modalidad'])}>
                {['Presencial','Híbrido','Remoto'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>JORNADA</label>
              <select className={inputClass + ' appearance-none'} value={draft.jornada} onChange={(e) => update('jornada', e.target.value as Oferta['jornada'])}>
                {['Completa','Parcial'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>SECTOR</label>
              <select className={inputClass + ' appearance-none'} value={draft.sector} onChange={(e) => update('sector', e.target.value)}>
                {['Operaciones','Recursos Humanos','Comercial','Marketing','Tecnología'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className={labelClass}>DESCRIPCIÓN</label>
            <textarea
              rows={5}
              className={inputClass + ' resize-y leading-relaxed'}
              placeholder="Describe el puesto, responsabilidades y contexto..."
              value={draft.desc}
              onChange={(e) => update('desc', e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={save}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
            >
              {nueva ? 'Publicar oferta' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px] mb-1.5">Portal empleo</p>
          <h2 className="font-roxborough text-3xl text-gray-900">Ofertas publicadas</h2>
        </div>
        <button
          type="button"
          onClick={() => { setNueva(true); setDraft(emptyDraft) }}
          className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
        >
          + Nueva oferta
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
        <div className="px-7 py-3.5 border-b border-black/5 grid grid-cols-[3fr_2fr_1fr_1fr_100px] text-[10px] tracking-widest text-gray-400 font-bold">
          <span>OFERTA</span><span>EMPRESA</span><span>MODALIDAD</span><span>ESTADO</span><span></span>
        </div>
        {ofertas.map((o) => (
          <div
            key={o.id}
            className="px-7 py-4 border-b border-black/5 last:border-0 grid grid-cols-[3fr_2fr_1fr_1fr_100px] items-center hover:bg-henko-white/40 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold">{o.titulo}</p>
              <p className="text-[11px] text-gray-400">{o.fecha}</p>
            </div>
            <span className="text-sm text-gray-600">{o.empresa}</span>
            <span className="text-xs text-gray-500">{o.modalidad}</span>
            <span>
              <span
                className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                  o.activa ? 'bg-henko-greenblue text-henko-turquoise' : 'bg-black/5 text-gray-500'
                }`}
              >
                {o.activa ? 'Activa' : 'Cerrada'}
              </span>
            </span>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => startEdit(o)} className="text-xs text-henko-turquoise font-semibold hover:underline">
                Editar
              </button>
              <button
                type="button"
                onClick={() => setOfertas(arr => arr.map(x => x.id === o.id ? { ...x, activa: !x.activa } : x))}
                className="text-xs text-gray-400 hover:text-gray-700"
              >
                {o.activa ? 'Cerrar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
