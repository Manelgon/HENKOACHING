'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { actualizarPerfilCandidato, uploadCv, exportarMisDatos, eliminarMiCuenta, solicitarCodigoExportacion } from '@/actions/candidato'
import { createClient } from '@/lib/supabase/client'
import { signout } from '@/actions/auth'
import { getCvUrl } from '@/actions/solicitudes'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'

type Tab = 'solicitudes' | 'perfil' | 'cv' | 'privacidad'

const ESTADO_META: Record<EstadoSolicitud, { label: string; badge: string }> = {
  nuevo:      { label: 'Nueva',       badge: 'bg-henko-turquoise/15 text-henko-turquoise' },
  revisando:  { label: 'Revisando',   badge: 'bg-amber-50 text-amber-700' },
  entrevista: { label: 'Entrevista',  badge: 'bg-henko-turquoise text-white' },
  descartado: { label: 'Descartado',  badge: 'bg-gray-100 text-gray-500' },
  contratado: { label: 'Contratado',  badge: 'bg-emerald-50 text-emerald-700' },
}

const NAV: { id: Tab; label: string }[] = [
  { id: 'solicitudes', label: 'Mis solicitudes' },
  { id: 'perfil',      label: 'Mi perfil' },
  { id: 'cv',          label: 'Mi CV' },
  { id: 'privacidad',  label: 'Privacidad y datos' },
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
  const [open, setOpen] = useState(false)
  const iniciales = `${perfil.nombre[0] ?? ''}${perfil.apellidos[0] ?? ''}`.toUpperCase() || 'CD'

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const goTab = (next: Tab) => {
    setTab(next)
    setOpen(false)
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-raleway">
      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar (drawer en móvil, sticky en desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-100 flex flex-col py-8 transform transition-transform duration-300 md:translate-x-0 md:static md:inset-auto md:h-screen md:sticky md:top-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-6 pb-7">
          <Link href="/">
            <Image src="/henkologo.png" alt="Henkoaching" width={280} height={194} className="object-contain w-[140px] h-auto" />
          </Link>
        </div>
        <div className="px-3 flex-1 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => goTab(item.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm mb-0.5 flex items-center gap-2.5 transition-all ${
                tab === item.id
                  ? 'bg-henko-turquoise/10 text-henko-turquoise font-bold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-henko-turquoise'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tab === item.id ? 'bg-henko-turquoise' : 'bg-transparent'}`}
              />
              {item.label}
            </button>
          ))}
        </div>
        <div className="px-3 pt-5 border-t border-gray-100 mx-3">
          <div className="px-3.5 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-henko-turquoise flex items-center justify-center text-xs text-white font-bold">
              {iniciales}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{perfil.nombre} {perfil.apellidos}</p>
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

      {/* Columna principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar móvil */}
        <div className="sticky top-0 z-20 md:hidden flex items-center gap-3 px-4 h-14 bg-white/90 backdrop-blur border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/henkologo.png" alt="Henkoaching" width={240} height={167} className="object-contain w-[120px] h-auto" />
          </Link>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full bg-henko-turquoise flex items-center justify-center text-xs text-white font-bold">
            {iniciales}
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            className="w-9 h-9 rounded-lg flex flex-col items-center justify-center gap-[5px] hover:bg-black/5 transition-colors"
          >
            <span className={`block w-5 h-[2px] rounded bg-gray-900 transition-transform ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-5 h-[2px] rounded bg-gray-900 transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[2px] rounded bg-gray-900 transition-transform ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>

        <main className="flex-1 px-5 py-6 md:p-12 overflow-y-auto">
          {tab === 'solicitudes' && <TabSolicitudes solicitudes={solicitudes} />}
          {tab === 'perfil' && <TabPerfil perfil={perfil} />}
          {tab === 'cv' && <TabCV cv={cv} />}
          {tab === 'privacidad' && <TabPrivacidad perfil={perfil} onGoTab={setTab} />}
        </main>
      </div>
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
      <h2 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-8">Mis solicitudes</h2>

      {solicitudes.length === 0 ? (
        <div className="bg-white rounded-2xl px-9 py-12 border border-henko-turquoise/15 shadow-sm max-w-xl text-center">
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
                className="bg-white rounded-2xl px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-henko-turquoise/15 shadow-sm"
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
  const runAction = useAction()

  async function onSubmit(formData: FormData) {
    const result = await runAction(
      'Guardando cambios del perfil',
      () => actualizarPerfilCandidato(formData),
      { successMessage: 'Cambios guardados' },
    )
    if (result.ok) router.refresh()
  }

  return (
    <div>
      <Eyebrow>Mi perfil</Eyebrow>
      <h2 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-8">Datos personales</h2>

      <form action={onSubmit} className="bg-white rounded-2xl px-9 py-8 border border-henko-turquoise/15 shadow-sm max-w-xl space-y-4">
        <Field label="NOMBRE" name="nombre" defaultValue={perfil.nombre} />
        <Field label="APELLIDOS" name="apellidos" defaultValue={perfil.apellidos} />
        <Field label="EMAIL" name="email" defaultValue={perfil.email} disabled />
        <Field label="TELÉFONO" name="telefono" defaultValue={perfil.telefono} />
        <Field label="UBICACIÓN" name="ubicacion" defaultValue={perfil.ubicacion} />
        <Field label="CARGO OBJETIVO" name="cargo" defaultValue={perfil.cargo} />

        <button
          type="submit"
          className="mt-2 inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
        >
          Guardar cambios
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
        className="w-full text-sm text-gray-900 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-henko-turquoise focus:ring-2 focus:ring-henko-turquoise/20 disabled:opacity-60 transition-colors"
      />
    </div>
  )
}

function TabCV({ cv }: { cv: CvView }) {
  const router = useRouter()
  const runAction = useAction()
  const fileRef = useRef<HTMLInputElement>(null)

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('cv', file)
    const result = await runAction(
      'Subiendo CV',
      () => uploadCv(fd),
      { successMessage: 'CV actualizado' },
    )
    if (result.ok) router.refresh()
  }

  async function descargar() {
    if (!cv) return
    const result = await runAction(
      'Generando enlace del CV',
      () => getCvUrl(cv.storage_path),
      { silentSuccess: true },
    )
    if (result.ok && result.data.url) window.open(result.data.url, '_blank')
  }

  const fechaSubida = cv?.created_at
    ? new Date(cv.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div>
      <Eyebrow>Mi CV</Eyebrow>
      <h2 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-8">Currículum</h2>

      <div className="bg-white rounded-2xl px-9 py-10 border border-henko-turquoise/15 shadow-sm max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-henko-turquoise/15 flex items-center justify-center mx-auto mb-4">
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
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
          >
            {cv ? 'Actualizar CV' : 'Subir CV'}
          </button>
        </div>
      </div>
    </div>
  )
}

type OtpStep = 'idle' | 'sending' | 'awaiting_code' | 'verifying'

function TabPrivacidad({ perfil, onGoTab }: { perfil: PerfilView; onGoTab: (t: Tab) => void }) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()

  const [otpStep, setOtpStep] = useState<OtpStep>('idle')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')

  async function iniciarDescarga() {
    setOtpStep('sending')
    setOtpError('')
    const result = await solicitarCodigoExportacion()
    if (!result.ok) {
      setOtpError(result.error ?? 'Error al enviar el código.')
      setOtpStep('idle')
      return
    }
    setOtpEmail(result.email)
    setOtpCode('')
    setOtpStep('awaiting_code')
  }

  async function verificarYDescargar() {
    if (otpCode.length !== 6) {
      setOtpError('Introduce el código de 6 dígitos.')
      return
    }
    setOtpStep('verifying')
    setOtpError('')

    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: otpEmail,
      token: otpCode,
      type: 'email',
    })

    if (verifyError) {
      setOtpError('Código incorrecto o expirado. Inténtalo de nuevo.')
      setOtpStep('awaiting_code')
      return
    }

    const result = await runAction(
      'Preparando tus datos',
      () => exportarMisDatos(),
      { silentSuccess: true },
    )
    setOtpStep('idle')
    setOtpCode('')
    if (!result.ok) return

    const fecha = new Date().toISOString().slice(0, 10)
    const safeEmail = perfil.email.replace(/[^a-zA-Z0-9]/g, '_')
    const blob = new Blob([JSON.stringify(result.data.data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mis-datos-${safeEmail}-${fecha}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function eliminarCuenta() {
    const ok = await confirm({
      title: 'Eliminar mi cuenta permanentemente',
      description:
        'Esta acción es irreversible. Se eliminarán de forma permanente tu perfil, CV, experiencia, educación, idiomas y todas tus solicitudes a ofertas. No podrás recuperar estos datos.',
      confirmLabel: 'Eliminar definitivamente',
      variant: 'danger',
    })
    if (!ok) return

    const okFinal = await confirm({
      title: '¿Estás completamente seguro?',
      description: 'Última confirmación antes de eliminar tu cuenta.',
      confirmLabel: 'Sí, eliminar',
      variant: 'danger',
    })
    if (!okFinal) return

    const result = await runAction(
      'Eliminando tu cuenta',
      () => eliminarMiCuenta(),
      { successMessage: 'Cuenta eliminada' },
    )
    if (result.ok) {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl">
      <Eyebrow>Privacidad y datos</Eyebrow>
      <h2 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-3">Tus derechos sobre tus datos</h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        En cumplimiento del Reglamento General de Protección de Datos (RGPD), puedes ejercer aquí tus derechos de acceso, portabilidad y supresión.
      </p>

      <div className="bg-white rounded-2xl px-7 py-6 border border-henko-turquoise/15 shadow-sm mb-4">
        <h3 className="font-roxborough text-lg text-gray-900 mb-1.5">Descargar mis datos</h3>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Descarga una copia de todos los datos que tenemos sobre ti en formato JSON: perfil, experiencia, educación, idiomas, CVs y solicitudes a ofertas.
        </p>

        {otpStep === 'idle' || otpStep === 'sending' ? (
          <button
            type="button"
            onClick={iniciarDescarga}
            disabled={otpStep === 'sending'}
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {otpStep === 'sending' ? 'Enviando código…' : 'Descargar mis datos (JSON)'}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Por seguridad, hemos enviado un código de verificación de 6 dígitos a{' '}
              <strong>{otpEmail}</strong>. Introdúcelo para continuar.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError('') }}
                className="w-32 text-center text-xl font-mono tracking-widest border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-henko-turquoise"
              />
              <button
                type="button"
                onClick={verificarYDescargar}
                disabled={otpStep === 'verifying'}
                className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {otpStep === 'verifying' ? 'Verificando…' : 'Verificar y descargar'}
              </button>
              <button
                type="button"
                onClick={() => { setOtpStep('idle'); setOtpCode(''); setOtpError('') }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
            <button
              type="button"
              onClick={iniciarDescarga}
              className="text-xs text-henko-turquoise hover:underline"
            >
              ¿No recibiste el código? Reenviar
            </button>
            {otpError && <p className="text-sm text-red-600">{otpError}</p>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl px-7 py-6 border border-henko-turquoise/15 shadow-sm mb-4">
        <h3 className="font-roxborough text-lg text-gray-900 mb-1.5">Rectificar mis datos</h3>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Puedes actualizar tus datos personales en cualquier momento desde la pestaña <strong>Mi perfil</strong>. Tu experiencia, educación e idiomas también son editables.
        </p>
        <button
          type="button"
          onClick={() => onGoTab('perfil')}
          className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-5 py-2 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
        >
          Ir a Mi perfil →
        </button>
      </div>

      <div className="bg-red-50/50 rounded-2xl px-7 py-6 border border-red-200">
        <h3 className="font-roxborough text-lg text-red-900 mb-1.5">Eliminar mi cuenta</h3>
        <p className="text-sm text-red-800/80 mb-5 leading-relaxed">
          Esto eliminará de forma <strong>permanente e irreversible</strong> tu cuenta y todos los datos asociados: perfil, CV, experiencia, educación, idiomas y todas tus solicitudes a ofertas.
        </p>
        <button
          type="button"
          onClick={eliminarCuenta}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 hover:shadow-lg transition-all"
        >
          Eliminar mi cuenta
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-6 leading-relaxed">
        Para ejercer otros derechos (oposición, limitación) o presentar una reclamación, escribe a{' '}
        <a href="mailto:info@henkoaching.com" className="text-henko-turquoise hover:underline">info@henkoaching.com</a>
        {' '}o consulta nuestra{' '}
        <Link href="/legal#privacidad" target="_blank" className="text-henko-turquoise hover:underline">política de privacidad</Link>.
      </p>
    </div>
  )
}
