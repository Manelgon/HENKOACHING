'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { actualizarPerfilCandidato, uploadCv } from '@/actions/candidato'
import { signout } from '@/actions/auth'
import { getCvUrl } from '@/actions/solicitudes'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'

type Tab = 'solicitudes' | 'perfil' | 'cv'

const ESTADO_META: Record<EstadoSolicitud, { label: string; badge: string }> = {
  nuevo:      { label: 'Nueva',       badge: 'bg-henko-greenblue text-henko-turquoise' },
  revisando:  { label: 'Revisando',   badge: 'bg-henko-yellow text-yellow-900' },
  entrevista: { label: 'Entrevista',  badge: 'bg-henko-purple text-white' },
  descartado: { label: 'Descartado',  badge: 'bg-black/5 text-gray-500' },
  contratado: { label: 'Contratado',  badge: 'bg-henko-turquoise text-white' },
}

const NAV: { id: Tab; label: string }[] = [
  { id: 'solicitudes', label: 'Mis solicitudes' },
  { id: 'perfil',      label: 'Mi perfil' },
  { id: 'cv',          label: 'Mi CV' },
]

type SolicitudView = {
  id: string
  estado: EstadoSolicitud
  fecha: string
  ofertaSlug: string
  ofertaTitulo: string
  empresa: string
}

type PerfilView = {
  nombre: string
  apellidos: string
  email: string
  telefono: string
  ubicacion: string
  cargo: string
}

type CvView = {
  id: string
  nombre_archivo: string
  storage_path: string
  created_at: string | null
  tamano_bytes: number | null
} | null

type Props = {
  perfil: PerfilView
  cv: CvView
  solicitudes: SolicitudView[]
}

export default function CandidatoDashboard({ perfil, cv, solicitudes }: Props) {
  const [tab, setTab] = useState<Tab>('solicitudes')
  const iniciales = `${perfil.nombre[0] ?? ''}${perfil.apellidos[0] ?? ''}`.toUpperCase() || 'CD'

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[220px_1fr] bg-[#f5f0eb] font-raleway">
      {/* Sidebar */}
      <aside className="bg-henko-yellow flex flex-col py-8 md:sticky md:top-0 md:h-screen">
        <div className="px-6 pb-7">
          <Link href="/">
            <Image src="/henkologo.png" alt="Henkoaching" width={140} height={40} className="object-contain" />
          </Link>
        </div>
        <div className="px-3 flex-1">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm mb-0.5 flex items-center gap-2.5 transition-all ${
                tab === item.id
                  ? 'bg-black/10 text-gray-900 font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tab === item.id ? 'bg-henko-turquoise' : 'bg-transparent'}`}
              />
              {item.label}
            </button>
          ))}
        </div>
        <div className="px-3 pt-5 border-t border-black/10 mx-3">
          <div className="px-3.5 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-henko-turquoise flex items-center justify-center text-xs text-white font-bold">
              {iniciales}
            </div>
            <div>
              <p className="text-sm font-semibold">{perfil.nombre} {perfil.apellidos}</p>
              <p className="text-[10px] text-gray-500">Candidata</p>
            </div>
          </div>
          <Link
            href="/empleo"
            className="block w-full px-3.5 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Ver ofertas
          </Link>
          <form action={signout}>
            <button
              type="submit"
              className="block w-full text-left px-3.5 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="p-8 md:p-12 overflow-y-auto">
        {tab === 'solicitudes' && <TabSolicitudes solicitudes={solicitudes} />}
        {tab === 'perfil' && <TabPerfil perfil={perfil} />}
        {tab === 'cv' && <TabCV cv={cv} />}
      </main>
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-2">{children}</p>
}

function TabSolicitudes({ solicitudes }: { solicitudes: SolicitudView[] }) {
  return (
    <div>
      <Eyebrow>Mi área</Eyebrow>
      <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-8">Mis solicitudes</h2>

      {solicitudes.length === 0 ? (
        <div className="bg-white rounded-2xl px-9 py-12 border border-black/5 max-w-xl text-center">
          <p className="font-roxborough text-xl mb-2">Aún no has aplicado a ninguna oferta</p>
          <p className="text-sm text-gray-500 mb-6">Explora las ofertas disponibles y aplica con un click</p>
          <Link
            href="/empleo"
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
          >
            Ver ofertas
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {solicitudes.map((s) => {
            const meta = ESTADO_META[s.estado]
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-black/5"
              >
                <div>
                  <p className="font-roxborough text-lg mb-1">{s.ofertaTitulo}</p>
                  <p className="text-xs text-gray-400">{s.empresa} · Aplicado el {s.fecha}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[11px] px-3.5 py-1 rounded-full font-bold ${meta.badge}`}>
                    {meta.label}
                  </span>
                  {s.ofertaSlug && (
                    <Link
                      href={`/empleo/${s.ofertaSlug}`}
                      className="text-xs text-henko-turquoise font-semibold hover:underline whitespace-nowrap"
                    >
                      Ver oferta →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-7">
        <Link
          href="/empleo"
          className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
        >
          Ver más ofertas →
        </Link>
      </div>
    </div>
  )
}

function TabPerfil({ perfil }: { perfil: PerfilView }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setSaving(true)
    setMsg(null)
    const result = await actualizarPerfilCandidato(formData)
    if (result.error) setMsg('Error: ' + result.error)
    else {
      setMsg('Cambios guardados')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div>
      <Eyebrow>Mi perfil</Eyebrow>
      <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-8">Datos personales</h2>

      <form action={onSubmit} className="bg-white rounded-2xl px-9 py-8 border border-black/5 max-w-xl space-y-4">
        <Field label="NOMBRE" name="nombre" defaultValue={perfil.nombre} />
        <Field label="APELLIDOS" name="apellidos" defaultValue={perfil.apellidos} />
        <Field label="EMAIL" name="email" defaultValue={perfil.email} disabled />
        <Field label="TELÉFONO" name="telefono" defaultValue={perfil.telefono} />
        <Field label="UBICACIÓN" name="ubicacion" defaultValue={perfil.ubicacion} />
        <Field label="CARGO OBJETIVO" name="cargo" defaultValue={perfil.cargo} />

        {msg && <p className={`text-sm ${msg.startsWith('Error') ? 'text-red-500' : 'text-henko-turquoise'}`}>{msg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, name, defaultValue, disabled }: { label: string; name: string; defaultValue: string; disabled?: boolean }) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5 block">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full text-sm text-gray-900 px-4 py-3 bg-henko-white rounded-xl outline-none focus:ring-2 focus:ring-henko-turquoise/30 disabled:opacity-60"
      />
    </div>
  )
}

function TabCV({ cv }: { cv: CvView }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    const fd = new FormData()
    fd.append('cv', file)
    const result = await uploadCv(fd)
    if (result.error) setError(result.error)
    else router.refresh()
    setUploading(false)
  }

  async function descargar() {
    if (!cv) return
    const result = await getCvUrl(cv.storage_path)
    if (result.url) window.open(result.url, '_blank')
  }

  const fechaSubida = cv?.created_at
    ? new Date(cv.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div>
      <Eyebrow>Mi CV</Eyebrow>
      <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-8">Currículum</h2>

      <div className="bg-white rounded-2xl px-9 py-10 border border-black/5 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-henko-greenblue flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1f8f9b" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>

        {cv ? (
          <>
            <p className="font-roxborough text-xl mb-1.5">{cv.nombre_archivo}</p>
            <p className="text-xs text-gray-400 mb-6">Subido el {fechaSubida}</p>
          </>
        ) : (
          <>
            <p className="font-roxborough text-xl mb-1.5">Sin CV subido</p>
            <p className="text-xs text-gray-400 mb-6">Sube tu currículum en PDF para aplicar a ofertas</p>
          </>
        )}

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onUpload}
        />

        <div className="flex flex-col gap-2.5 items-center">
          {cv && (
            <button
              type="button"
              onClick={descargar}
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
            >
              Descargar
            </button>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all disabled:opacity-60"
          >
            {uploading ? 'Subiendo...' : cv ? 'Actualizar CV' : 'Subir CV'}
          </button>
        </div>
      </div>
    </div>
  )
}
