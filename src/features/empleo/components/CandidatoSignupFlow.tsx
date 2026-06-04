'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signupCandidato, uploadCvPorAdmin, checkEmailCandidatoExiste, solicitarResetCandidato } from '@/actions/candidato'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { FormError } from '@/components/FormError'

const CONSENT_TEXT_CANDIDATO = 'He leído y acepto la política de privacidad y consiento el tratamiento de mis datos y de mi CV por Jennifer Cervera Alzate con la finalidad de gestionar mi candidatura en los procesos de selección publicados.'

type StepCuentaErrors = { nombre?: string; apellidos?: string; email?: string; password?: string; privacidad?: string }

type FormState = {
  nombre: string; apellidos: string; email: string; password: string
  telefonoPrefijo: string; telefono: string; ubicacion: string; localidad: string; cp: string; cargo: string
  sectores: string[]
  cv: File | null
}

const CARGOS = [
  'Director/a General','Director/a de Operaciones','Director/a de RRHH',
  'Director/a Comercial','Director/a de Marketing','Director/a Financiero/a',
  'Responsable de Operaciones','Responsable de RRHH','Responsable Comercial',
  'Responsable de Marketing','Responsable de Logística','Responsable de Producción',
  'Jefe/a de Equipo','Coordinador/a','Project Manager','Account Manager',
  'Técnico/a de RRHH','Técnico/a Comercial','Administrativo/a','Auxiliar Administrativo/a',
  'Recepcionista','Atención al Cliente','Comercial','Asesor/a Comercial',
  'Dependiente/a','Encargado/a de Tienda','Responsable de Tienda',
  'Cocinero/a','Jefe/a de Cocina','Camarero/a','Barista','Recepcionista de Hotel',
  'Diseñador/a Gráfico/a','Desarrollador/a Web','Analista de Datos',
  'Community Manager','Especialista en Marketing Digital','SEO/SEM',
  'Enfermero/a','Auxiliar de Enfermería','Fisioterapeuta','Psicólogo/a',
  'Maestro/a','Educador/a','Monitor/a','Formador/a','Otro',
]

const PREFIJOS = [
  { label: '🇪🇸 +34', value: '+34' },
  { label: '🇫🇷 +33', value: '+33' },
  { label: '🇩🇪 +49', value: '+49' },
  { label: '🇮🇹 +39', value: '+39' },
  { label: '🇵🇹 +351', value: '+351' },
  { label: '🇬🇧 +44', value: '+44' },
  { label: '🇺🇸 +1', value: '+1' },
  { label: '🇦🇷 +54', value: '+54' },
  { label: '🇲🇽 +52', value: '+52' },
  { label: '🇨🇴 +57', value: '+57' },
  { label: '🇻🇪 +58', value: '+58' },
  { label: '🇨🇱 +56', value: '+56' },
  { label: '🇵🇪 +51', value: '+51' },
  { label: '🇲🇦 +212', value: '+212' },
  { label: '🇷🇴 +40', value: '+40' },
]

const inputClass = 'w-full px-4 py-3 rounded-xl text-sm border-[1.5px] border-gray-200 bg-white outline-none focus:border-henko-turquoise transition-colors'
const labelClass = 'text-[11px] tracking-[0.12em] font-bold text-henko-turquoise mb-1.5 block'

const PROVINCIAS = [
  'Álava','Albacete','Alicante','Almería','Asturias','Ávila','Badajoz','Barcelona',
  'Bizkaia','Burgos','Cáceres','Cádiz','Cantabria','Castellón','Ceuta','Ciudad Real',
  'Córdoba','A Coruña','Cuenca','Girona','Granada','Guadalajara','Gipuzkoa','Huelva',
  'Huesca','Illes Balears','Jaén','León','Lleida','La Rioja','Lugo','Madrid','Málaga',
  'Melilla','Murcia','Navarra','Ourense','Palencia','Las Palmas','Pontevedra',
  'Salamanca','Santa Cruz de Tenerife','Segovia','Sevilla','Soria','Tarragona',
  'Teruel','Toledo','Valencia','Valladolid','Zamora','Zaragoza','Otro',
]

// ── Combobox buscador ────────────────────────────────────────────────────────
function ComboboxField({
  value, onChange, options, placeholder, className = '',
}: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const filtered = value.length
    ? options.filter(o => o.toLowerCase().includes(value.toLowerCase())).slice(0, 10)
    : options.slice(0, 10)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleOpen = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropUp(window.innerHeight - rect.bottom < 240)
    }
    setOpen(true)
  }

  return (
    <div ref={ref} className={`relative ${className}`} style={{ isolation: 'isolate' }}>
      <div className="relative">
        <input
          ref={inputRef}
          className={inputClass + ' pr-8'}
          value={value}
          placeholder={placeholder}
          onChange={e => { onChange(e.target.value); handleOpen() }}
          onFocus={handleOpen}
          onKeyDown={e => { if (e.key === 'Escape') setOpen(false) }}
          autoComplete="off"
        />
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <ul
          className={`absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-auto ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}
          style={{ zIndex: 9999 }}
        >
          {filtered.length > 0 ? filtered.map(opt => (
            <li
              key={opt}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-henko-turquoise/5 hover:text-henko-turquoise transition-colors"
              onMouseDown={e => { e.preventDefault(); onChange(opt); setOpen(false) }}
            >
              {opt}
            </li>
          )) : (
            <li className="px-4 py-2.5 text-sm text-gray-400 italic">Sin resultados</li>
          )}
        </ul>
      )}
    </div>
  )
}

// ── Shell ────────────────────────────────────────────────────────────────────
export default function CandidatoSignupFlow() {
  const router = useRouter()
  const runAction = useAction()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState<FormState>({
    nombre: '', apellidos: '', email: '', password: '',
    telefonoPrefijo: '+34', telefono: '', ubicacion: '', localidad: '', cp: '', cargo: '',
    sectores: [],
    cv: null,
  })
  const fileRef = useRef<HTMLInputElement>(null)

  const upd = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  async function finalizar() {
    setSubmitting(true)
    const signup = await runAction(
      'Creando perfil',
      () => signupCandidato({
        nombre: form.nombre, apellidos: form.apellidos,
        email: form.email, password: form.password,
        telefono: form.telefono ? `${form.telefonoPrefijo} ${form.telefono}` : '',
        ubicacion: form.ubicacion, localidad: form.localidad, cp: form.cp, cargo: form.cargo,
        tipoJornada: '', modalidad: '', tipoContrato: '',
        sectores: [], disponibilidad: '', pretensionSalarial: '',
        experiencias: [], educacion: [], idiomas: [],
        consentText: CONSENT_TEXT_CANDIDATO,
      }),
      { successMessage: 'Perfil creado' },
    )
    if (!signup.ok) { setSubmitting(false); return }

    // Subir CV usando admin client (el usuario aún no tiene sesión hasta confirmar email)
    if (form.cv && signup.data?.userId) {
      const fd = new FormData()
      fd.append('cv', form.cv as File)
      await uploadCvPorAdmin(signup.data.userId, fd)
    }

    setDone(true)
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white font-raleway flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {/* Icono check grande */}
          <div className="w-20 h-20 rounded-full bg-henko-turquoise flex items-center justify-center mx-auto mb-6 shadow-lg shadow-henko-turquoise/25">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          <h2 className="font-roxborough text-3xl text-gray-900 mb-3">¡Registro completado!</h2>
          <p className="text-gray-600 text-sm mb-1">
            Hemos enviado un email de confirmación a
          </p>
          <p className="font-semibold text-gray-900 text-sm mb-6">{form.email}</p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-8 text-left">
            <p className="text-sm font-semibold text-amber-800 mb-1">Confirma tu cuenta para acceder</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Revisa tu bandeja de entrada (y la carpeta de spam). Una vez confirmado el email, podrás acceder a tu panel y completar tu perfil.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/candidato/login')}
              className="w-full bg-henko-turquoise text-white font-semibold py-3 rounded-xl hover:bg-henko-turquoise/90 transition-colors text-sm"
            >
              Ir al acceso de candidatos →
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-white border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-300 hover:text-gray-900 transition-colors text-sm"
            >
              ← Volver a la web
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-raleway">
      <div className="max-w-2xl mx-auto px-6 md:px-10 pt-8 pb-14">
        <Link href="/" className="inline-block mb-6 text-xs text-gray-400 hover:text-gray-600">
          ← Volver al sitio
        </Link>

        <div className="flex items-center gap-2 mb-10">
          {['Cuenta', 'Datos', 'CV'].map((s, i) => (
            <Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 || step === i + 1 ? 'bg-henko-turquoise text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs ${step === i + 1 ? 'font-bold text-gray-900' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-px transition-all ${step > i + 1 ? 'bg-henko-turquoise' : 'bg-gray-200'}`} />}
            </Fragment>
          ))}
        </div>

        {step === 1 && <StepCuenta form={form} upd={upd} next={() => setStep(2)} />}
        {step === 2 && <StepPerfil form={form} upd={upd} back={() => setStep(1)} next={() => setStep(3)} />}
        {step === 3 && <StepCV form={form} upd={upd} fileRef={fileRef} back={() => setStep(2)} finish={finalizar} submitting={submitting} isFinal />}
      </div>
    </div>
  )
}

// ── Helpers UI ───────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-3">{children}</p>
}
function Heading({ children }: { children: React.ReactNode }) {
  return <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-8 leading-tight">{children}</h1>
}
function PrimaryBtn({ children, onClick, full = false, type = 'button', disabled }: { children: React.ReactNode; onClick?: () => void; full?: boolean; type?: 'button' | 'submit'; disabled?: boolean }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${full ? 'w-full' : ''}`}>
      {children}
    </button>
  )
}
function SecondaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all">
      {children}
    </button>
  )
}

// ── Paso 1 ───────────────────────────────────────────────────────────────────
function StepCuenta({ form, upd, next }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void; next: () => void }) {
  const router = useRouter()
  const [errors, setErrors] = useState<StepCuentaErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [aceptoPrivacidad, setAceptoPrivacidad] = useState(false)
  const [checking, setChecking] = useState(false)
  const [emailRegistrado, setEmailRegistrado] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const validar = async () => {
    const errs: StepCuentaErrors = {}
    if (!form.nombre.trim()) errs.nombre = 'Introduce tu nombre'
    if (!form.apellidos.trim()) errs.apellidos = 'Introduce tus apellidos'
    if (!form.email.trim()) errs.email = 'Introduce tu email'
    else if (!form.email.includes('@')) errs.email = 'Email inválido'
    if (!form.password) errs.password = 'Introduce una contraseña'
    else if (form.password.length < 8) errs.password = 'Contraseña mínimo 8 caracteres'
    if (!aceptoPrivacidad) errs.privacidad = 'Debes aceptar la política de privacidad para continuar'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setChecking(true)
    const { exists } = await checkEmailCandidatoExiste(form.email)
    setChecking(false)

    if (exists) { setEmailRegistrado(true); return }

    setErrors({})
    next()
  }

  const handleReset = async () => {
    setSendingReset(true)
    await solicitarResetCandidato(form.email)
    setSendingReset(false)
    setResetSent(true)
  }

  const fieldClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl text-sm border-[1.5px] bg-white outline-none transition-colors ${hasError ? 'border-red-300 focus:border-red-400' : 'border-black/10 focus:border-henko-turquoise'}`
  const errLabelClass = (hasError: boolean) =>
    `text-[11px] tracking-[0.12em] font-bold mb-1.5 block ${hasError ? 'text-red-600' : 'text-henko-turquoise'}`
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    upd(key, value)
    if (errors[key as keyof StepCuentaErrors]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  return (
    <div>
      <Eyebrow>Paso 1</Eyebrow>
      <Heading>Crea tu cuenta</Heading>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={errLabelClass(!!errors.nombre)}>NOMBRE</label>
          <input className={fieldClass(!!errors.nombre)} placeholder="Tu nombre" value={form.nombre} onChange={e => update('nombre', e.target.value)} />
          <FormError msg={errors.nombre} />
        </div>
        <div>
          <label className={errLabelClass(!!errors.apellidos)}>APELLIDOS</label>
          <input className={fieldClass(!!errors.apellidos)} placeholder="Tus apellidos" value={form.apellidos} onChange={e => update('apellidos', e.target.value)} />
          <FormError msg={errors.apellidos} />
        </div>
      </div>
      <div className="mb-4">
        <label className={errLabelClass(!!errors.email)}>EMAIL</label>
        <input className={fieldClass(!!errors.email)} type="email" placeholder="tu@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
        <FormError msg={errors.email} />
      </div>
      <div className="mb-8">
        <label className={errLabelClass(!!errors.password)}>CONTRASEÑA</label>
        <div className="relative">
          <input className={`${fieldClass(!!errors.password)} pr-12`} type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={form.password} onChange={e => update('password', e.target.value)} />
          <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Ocultar' : 'Mostrar'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-henko-turquoise transition-colors p-1">
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>
        <FormError msg={errors.password} />
      </div>

      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" checked={aceptoPrivacidad}
            onChange={e => { setAceptoPrivacidad(e.target.checked); if (errors.privacidad && e.target.checked) setErrors(p => ({ ...p, privacidad: undefined })) }}
            className={`mt-0.5 w-4 h-4 rounded border-[1.5px] cursor-pointer accent-henko-turquoise flex-shrink-0 ${errors.privacidad ? 'border-red-400' : 'border-black/20'}`}
          />
          <span className="text-[13px] leading-relaxed text-gray-700 group-hover:text-gray-900 transition-colors">
            He leído y acepto la{' '}
            <Link href="/legal#privacidad" target="_blank" className="text-henko-turquoise hover:text-henko-turquoise-light font-semibold underline underline-offset-2">política de privacidad</Link>
            {' '}y consiento el tratamiento de mis datos y de mi CV por Jennifer Cervera Alzate con la finalidad de gestionar mi candidatura en los procesos de selección publicados.
          </span>
        </label>
        <FormError msg={errors.privacidad} />
      </div>

      {emailRegistrado && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3 mb-4">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Este correo ya está registrado como candidato</p>
              <p className="text-xs text-amber-700">Si ya tienes cuenta, accede con tu email y contraseña.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => router.push('/candidato/login')}
              className="w-full bg-henko-turquoise text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-henko-turquoise/90 transition-colors"
            >
              Ir al acceso de candidatos →
            </button>
            {!resetSent ? (
              <button
                type="button"
                onClick={handleReset}
                disabled={sendingReset}
                className="w-full text-sm text-amber-700 hover:text-amber-900 py-2 underline underline-offset-2 disabled:opacity-50 transition-colors"
              >
                {sendingReset ? 'Enviando...' : '¿Olvidaste tu contraseña? Enviar email de recuperación'}
              </button>
            ) : (
              <p className="text-center text-xs text-amber-700 py-2">
                ✓ Email enviado a <span className="font-semibold">{form.email}</span>. Revisa tu bandeja de entrada.
              </p>
            )}
            <button
              type="button"
              onClick={() => { setEmailRegistrado(false); setResetSent(false) }}
              className="text-xs text-gray-400 hover:text-gray-600 text-center py-1 transition-colors"
            >
              ← Usar otro correo
            </button>
          </div>
        </div>
      )}

      <PrimaryBtn onClick={validar} full disabled={checking}>
        {checking ? 'Verificando...' : 'Continuar →'}
      </PrimaryBtn>
    </div>
  )
}

// ── Paso 2 ───────────────────────────────────────────────────────────────────
function StepPerfil({ form, upd, back, next }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void; back: () => void; next: () => void }) {
  return (
    <div>
      <Eyebrow>Paso 2</Eyebrow>
      <Heading>Datos personales</Heading>

      <div className="mb-4">
        <label className={labelClass}>TELÉFONO</label>
        <div className="flex gap-2">
          <select
            className="px-3 py-3 rounded-xl text-sm border-[1.5px] border-gray-200 bg-white outline-none focus:border-henko-turquoise transition-colors shrink-0"
            value={form.telefonoPrefijo}
            onChange={e => upd('telefonoPrefijo', e.target.value)}
          >
            {PREFIJOS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <input className={inputClass} type="tel" placeholder="600 000 000" value={form.telefono} onChange={e => upd('telefono', e.target.value)} />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelClass}>PROVINCIA</label>
        <ComboboxField value={form.ubicacion} onChange={v => upd('ubicacion', v)} options={PROVINCIAS} placeholder="Busca tu provincia…" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelClass}>LOCALIDAD</label>
          <input className={inputClass} placeholder="Ciudad o municipio" value={form.localidad} onChange={e => upd('localidad', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>CÓDIGO POSTAL</label>
          <input className={inputClass} placeholder="08001" maxLength={5} value={form.cp} onChange={e => upd('cp', e.target.value.replace(/\D/g, '').slice(0, 5))} />
        </div>
      </div>

      <div className="mb-6">
        <label className={labelClass}>CARGO ACTUAL / OBJETIVO</label>
        <ComboboxField value={form.cargo} onChange={v => upd('cargo', v)} options={CARGOS} placeholder="p.ej. Responsable de Operaciones" />
      </div>

      <div className="mb-6">
        <label className={labelClass}>SECTORES DE INTERÉS <span className="text-gray-400 font-normal normal-case">(opcional)</span></label>
        <div className="flex flex-wrap gap-2 mt-1">
          {['Recursos Humanos', 'Administración', 'Comercial / Ventas', 'Marketing', 'Tecnología',
            'Finanzas', 'Legal', 'Operaciones', 'Logística', 'Atención al cliente',
            'Educación / Formación', 'Salud', 'Diseño / Creatividad', 'Comunicación', 'Otro'].map((s) => {
            const sel = form.sectores.includes(s)
            return (
              <button
                key={s}
                type="button"
                onClick={() => upd('sectores', sel ? form.sectores.filter(x => x !== s) : [...form.sectores, s])}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${sel ? 'bg-henko-turquoise text-white border-henko-turquoise' : 'bg-transparent text-gray-600 border-gray-200 hover:border-henko-turquoise hover:text-henko-turquoise'}`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <SecondaryBtn onClick={back}>← Volver</SecondaryBtn>
        <div className="flex-1"><PrimaryBtn onClick={next} full>Continuar →</PrimaryBtn></div>
      </div>
    </div>
  )
}

// ── Paso 3 (CV) ──────────────────────────────────────────────────────────────
function StepCV({ form, upd, fileRef, back, finish, submitting, isFinal = true }: {
  form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  fileRef: React.RefObject<HTMLInputElement | null>; back: () => void; finish: () => void; submitting: boolean; isFinal?: boolean
}) {
  return (
    <div>
      <Eyebrow>Paso 3</Eyebrow>
      <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-3 leading-tight">Sube tu CV</h1>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">Añade tu currículum en PDF. Lo usaremos en tus solicitudes a las ofertas.</p>

      <div onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-3xl px-8 py-12 text-center cursor-pointer mb-8 transition-all ${form.cv ? 'border-henko-turquoise bg-henko-turquoise/10' : 'border-henko-turquoise/25 bg-gray-50 hover:border-henko-turquoise/50'}`}>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => upd('cv', e.target.files?.[0] ?? null)} />
        {form.cv ? (
          <>
            <div className="w-12 h-12 rounded-full bg-henko-turquoise flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <p className="font-semibold text-sm">{form.cv.name}</p>
            <p className="text-xs text-henko-turquoise mt-1">Click para cambiar</p>
          </>
        ) : (
          <>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            <p className="text-sm text-gray-400">Arrastra tu CV o <span className="text-henko-turquoise font-semibold">haz click aquí</span></p>
            <p className="text-xs text-gray-300 mt-1.5">Solo PDF · Máx. 5MB</p>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <SecondaryBtn onClick={back}>← Volver</SecondaryBtn>
        <div className="flex-1"><PrimaryBtn onClick={finish} full disabled={submitting}>{isFinal ? (submitting ? 'Creando perfil...' : 'Crear perfil →') : 'Continuar →'}</PrimaryBtn></div>
      </div>
    </div>
  )
}
