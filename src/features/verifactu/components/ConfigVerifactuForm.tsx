'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { guardarConfigVerifactu, type ConfigVerifactuInput } from '@/actions/verifactu'

type Props = {
  initial: ConfigVerifactuInput
  emisorNombre: string
  emisorNif: string
}

export default function ConfigVerifactuForm({ initial, emisorNombre, emisorNif }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const [editing, setEditing] = useState(false)
  const [datos, setDatos] = useState<ConfigVerifactuInput>(initial)
  const [saved, setSaved] = useState<ConfigVerifactuInput>(initial)

  const set = <K extends keyof ConfigVerifactuInput>(key: K, value: ConfigVerifactuInput[K]) =>
    setDatos((prev) => ({ ...prev, [key]: value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const r = await runAction('Guardando configuración Veri*factu', () => guardarConfigVerifactu(datos), {
      successMessage: 'Configuración guardada',
    })
    if (r.ok) { setSaved({ ...datos }); setEditing(false); router.refresh() }
  }

  function cancelar() { setDatos({ ...saved }); setEditing(false) }

  const productorEfectivoNombre = datos.verifactu_productor_nombre.trim() || emisorNombre
  const productorEfectivoNif = datos.verifactu_productor_nif.trim() || emisorNif

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Productor */}
      <Section
        title="Productor del software"
        description="Empresa o persona que desarrolla el sistema de facturación. Si el productor coincide con el emisor, deja estos campos en blanco: se usarán los datos del emisor."
      >
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Productor: nombre / razón social">
              <input type="text" value={datos.verifactu_productor_nombre} onChange={(e) => set('verifactu_productor_nombre', e.target.value)} placeholder="(en blanco = usar el del emisor)" className="input" />
            </Field>
            <Field label="Productor: NIF">
              <input type="text" value={datos.verifactu_productor_nif} onChange={(e) => set('verifactu_productor_nif', e.target.value)} placeholder="(en blanco = usar el del emisor)" className="input" />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <ReadRow label="Nombre" value={datos.verifactu_productor_nombre || `${emisorNombre} (del emisor)`} />
            <ReadRow label="NIF" value={datos.verifactu_productor_nif || `${emisorNif} (del emisor)`} />
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-henko-cream border border-henko-greenblue/40 px-4 py-3">
          <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-henko-turquoise mb-1">En cada XML enviará a AEAT</p>
          <p className="font-raleway text-sm text-gray-700">
            <strong>{productorEfectivoNombre || '—'}</strong>{' '}
            {productorEfectivoNif && <span className="text-gray-500">· {productorEfectivoNif}</span>}
          </p>
        </div>
      </Section>

      {/* Identificación técnica del software */}
      <Section
        title="Identificación técnica del software"
        description="Datos del propio programa de facturación. AEAT no impone formatos: son códigos internos que identifican esta instalación."
      >
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre del sistema informático" wide>
              <input type="text" value={datos.verifactu_sistema_nombre} onChange={(e) => set('verifactu_sistema_nombre', e.target.value)} placeholder="Henkoaching Facturación" className="input" />
            </Field>
            <Field label="ID del sistema (2 caracteres)">
              <input type="text" maxLength={2} value={datos.verifactu_sistema_id} onChange={(e) => set('verifactu_sistema_id', e.target.value.toUpperCase())} placeholder="HK" className="input" />
            </Field>
            <Field label="Versión">
              <input type="text" value={datos.verifactu_version} onChange={(e) => set('verifactu_version', e.target.value)} placeholder="1.0" className="input" />
            </Field>
            <Field label="Número de instalación" wide>
              <input type="text" value={datos.verifactu_numero_instalacion} onChange={(e) => set('verifactu_numero_instalacion', e.target.value)} placeholder="HK-01" className="input" />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <ReadRow label="Sistema" value={datos.verifactu_sistema_nombre} />
            <ReadRow label="ID" value={datos.verifactu_sistema_id} />
            <ReadRow label="Versión" value={datos.verifactu_version} />
            <ReadRow label="Nº instalación" value={datos.verifactu_numero_instalacion} />
          </div>
        )}
      </Section>

      <div className="flex justify-end gap-2 pt-2">
        {editing ? (
          <>
            <button type="button" onClick={cancelar} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise/90 transition-colors">Guardar configuración</button>
          </>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Editar</button>
        )}
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.75rem;
          border: 1px solid rgb(229, 231, 235);
          background: rgb(249, 250, 251);
          font-family: var(--font-raleway), Raleway, sans-serif;
          font-size: 0.875rem;
          color: rgb(17, 24, 39);
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        :global(.input:focus) {
          border-color: #1f8f9b;
          background: #fff;
        }
      `}</style>
    </form>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
      <h2 className="font-roxborough text-xl text-gray-900 mb-1">{title}</h2>
      {description && <p className="font-raleway text-gray-500 text-sm font-light mb-6">{description}</p>}
      {children}
    </section>
  )
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-gray-700 font-raleway">{value || <span className="text-gray-300 italic">—</span>}</span>
    </div>
  )
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''}`}>
      <span className="font-raleway text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}
