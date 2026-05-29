'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signupCandidato, uploadCv } from '@/actions/candidato'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { FormError } from '@/components/FormError'

type StepCuentaErrors = { nombre?: string; apellidos?: string; email?: string; password?: string; privacidad?: string }

type Experiencia = { empresa: string; cargo: string; desde: string; hasta: string }
type Educacion = { centro: string; titulo: string; ano: string }
type Idioma = { idioma: string; nivel: string }

type FormState = {
  nombre: string; apellidos: string; email: string; password: string
  telefono: string; ubicacion: string; cargo: string
  exp: Experiencia[]; edu: Educacion[]; idiomas: Idioma[]
  cv: File | null
}

const inputClass = 'w-full px-4 py-3 rounded-xl text-sm border-[1.5px] border-gray-200 bg-white outline-none focus:border-henko-turquoise transition-colors'
const labelClass = 'text-[11px] tracking-[0.12em] font-bold text-henko-turquoise mb-1.5 block'

const PROVINCIAS = [
  'Álava','Albacete','Alicante','Almería','Asturias','Ávila','Badajoz','Barcelona',
  'Bizkaia','Burgos','Cáceres','Cádiz','Cantabria','Castellón','Ceuta','Ciudad Real',
  'Córdoba','A Coruña','Cuenca','Girona','Granada','Guadalajara','Gipuzkoa','Huelva',
  'Huesca','Illes Balears','Jaén','León','Lleida','La Rioja','Lugo','Madrid','Málaga',
  'Melilla','Murcia','Navarra','Ourense','Palencia','Las Palmas','Pontevedra',
  'Salamanca','Santa Cruz de Tenerife','Segovia','Sevilla','Soria','Tarragona',
  'Teruel','Toledo','Valencia','Valladolid','Zamora','Zaragoza',
]

const IDIOMAS_LIST = [
  'Español','Catalán','Euskera','Gallego','Valenciano',
  'Inglés','Francés','Alemán','Italiano','Portugués',
  'Árabe','Chino Mandarín','Ruso','Japonés','Neerlandés',
  'Polaco','Rumano','Sueco','Noruego','Danés','Finlandés',
]

const TITULOS_EDU = [
  'ESO','Bachillerato','Ciclo Formativo Grado Básico','Ciclo Formativo Grado Medio',
  'Ciclo Formativo Grado Superior','Certificado de Profesionalidad','Diplomatura',
  'Licenciatura','Ingeniería Técnica','Ingeniería Superior','Arquitectura',
  'Grado Universitario','Doble Grado','Máster Universitario','MBA','Doctorado (PhD)','Otro',
]

// ── Combobox buscador ────────────────────────────────────────────────────────
function ComboboxField({
  value, onChange, options, placeholder, className = '',
}: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
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

  return (
    <div ref={ref} className={`relative ${className}`}>
      <input
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => e.key === 'Escape' && setOpen(false)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-auto">
          {filtered.map(opt => (
            <li
              key={opt}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-henko-turquoise/5 hover:text-henko-turquoise transition-colors"
              onMouseDown={() => { onChange(opt); setOpen(false) }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Month picker con checkbox "Actualmente" ──────────────────────────────────
function MonthField({
  value, onChange, placeholder, allowActual = false,
}: { value: string; onChange: (v: string) => void; placeholder: string; allowActual?: boolean }) {
  const isActual = value === 'Actual'
  return (
    <div>
      <input
        type="month"
        className={`${inputClass} ${isActual ? 'opacity-40 pointer-events-none' : ''}`}
        placeholder={placeholder}
        value={isActual ? '' : value}
        onChange={e => onChange(e.target.value)}
        disabled={isActual}
      />
      {allowActual && (
        <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isActual}
            onChange={e => onChange(e.target.checked ? 'Actual' : '')}
            className="w-3.5 h-3.5 accent-henko-turquoise"
          />
          <span className="text-xs text-gray-500">Actualmente aquí</span>
        </label>
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
    telefono: '', ubicacion: '', cargo: '',
    exp: [{ empresa: '', cargo: '', desde: '', hasta: '' }],
    edu: [{ centro: '', titulo: '', ano: '' }],
    idiomas: [{ idioma: '', nivel: '' }],
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
        telefono: form.telefono, ubicacion: form.ubicacion, cargo: form.cargo,
        experiencias: form.exp, educacion: form.edu, idiomas: form.idiomas,
      }),
      { successMessage: 'Perfil creado' },
    )
    if (!signup.ok) { setSubmitting(false); return }

    if (form.cv) {
      const fd = new FormData()
      fd.append('cv', form.cv as File)
      const cv = await runAction('Subiendo CV', () => uploadCv(fd), { successMessage: 'CV subido' })
      if (!cv.ok) { setSubmitting(false); return }
    }
    setDone(true)
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white font-raleway flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-henko-turquoise/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Perfil creado con éxito!</h2>
          <p className="text-gray-500 text-sm mb-2">
            Te hemos enviado un email de confirmación a <span className="font-semibold text-gray-700">{form.email}</span>.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Revisa tu bandeja de entrada (y la carpeta de spam) y confirma tu cuenta para poder acceder.
          </p>
          <button
            onClick={() => router.push('/candidato/login')}
            className="w-full bg-henko-turquoise text-white font-semibold py-3 rounded-xl hover:bg-henko-turquoise/90 transition-colors text-sm"
          >
            Ir al acceso de candidatos →
          </button>
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
          {['Cuenta', 'Perfil', 'Experiencia', 'CV'].map((s, i) => (
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
        {step === 3 && <StepExperiencia form={form} upd={upd} back={() => setStep(2)} next={() => setStep(4)} />}
        {step === 4 && <StepCV form={form} upd={upd} fileRef={fileRef} back={() => setStep(3)} finish={finalizar} submitting={submitting} />}
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
  const [errors, setErrors] = useState<StepCuentaErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [aceptoPrivacidad, setAceptoPrivacidad] = useState(false)

  const validar = () => {
    const errs: StepCuentaErrors = {}
    if (!form.nombre.trim()) errs.nombre = 'Introduce tu nombre'
    if (!form.apellidos.trim()) errs.apellidos = 'Introduce tus apellidos'
    if (!form.email.trim()) errs.email = 'Introduce tu email'
    else if (!form.email.includes('@')) errs.email = 'Email inválido'
    if (!form.password) errs.password = 'Introduce una contraseña'
    else if (form.password.length < 8) errs.password = 'Contraseña mínimo 8 caracteres'
    if (!aceptoPrivacidad) errs.privacidad = 'Debes aceptar la política de privacidad para continuar'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    next()
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

      <PrimaryBtn onClick={validar} full>Continuar →</PrimaryBtn>
    </div>
  )
}

// ── Paso 2 ───────────────────────────────────────────────────────────────────
function StepPerfil({ form, upd, back, next }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void; back: () => void; next: () => void }) {
  return (
    <div>
      <Eyebrow>Paso 2</Eyebrow>
      <Heading>Tu perfil profesional</Heading>

      <div className="mb-4">
        <label className={labelClass}>TELÉFONO</label>
        <input className={inputClass} type="tel" placeholder="+34 600 000 000" value={form.telefono} onChange={e => upd('telefono', e.target.value)} />
      </div>

      <div className="mb-4">
        <label className={labelClass}>UBICACIÓN</label>
        <ComboboxField
          value={form.ubicacion}
          onChange={v => upd('ubicacion', v)}
          options={PROVINCIAS}
          placeholder="Busca tu provincia…"
        />
      </div>

      <div className="mb-6">
        <label className={labelClass}>CARGO ACTUAL / OBJETIVO</label>
        <input className={inputClass} type="text" placeholder="p.ej. Responsable de Operaciones" value={form.cargo} onChange={e => upd('cargo', e.target.value)} />
      </div>

      <div className="mb-8">
        <label className={labelClass + ' mb-3'}>IDIOMAS</label>
        {form.idiomas.map((id, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 mb-2.5">
            <ComboboxField
              value={id.idioma}
              onChange={v => {
                const arr = [...form.idiomas]
                arr[i] = { ...arr[i], idioma: v }
                upd('idiomas', arr)
              }}
              options={IDIOMAS_LIST}
              placeholder="Idioma"
            />
            <select
              className={inputClass + ' appearance-none'}
              value={id.nivel}
              onChange={e => {
                const arr = [...form.idiomas]
                arr[i] = { ...arr[i], nivel: e.target.value }
                upd('idiomas', arr)
              }}
            >
              <option value="">Nivel</option>
              {['A1','A2','B1','B2','C1','C2','Nativo'].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        ))}
        <button type="button" onClick={() => upd('idiomas', [...form.idiomas, { idioma: '', nivel: '' }])} className="text-sm text-henko-turquoise font-semibold hover:underline">
          + Añadir idioma
        </button>
      </div>

      <div className="flex gap-3">
        <SecondaryBtn onClick={back}>← Volver</SecondaryBtn>
        <div className="flex-1"><PrimaryBtn onClick={next} full>Continuar →</PrimaryBtn></div>
      </div>
    </div>
  )
}

// ── Paso 3 ───────────────────────────────────────────────────────────────────
function StepExperiencia({ form, upd, back, next }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void; back: () => void; next: () => void }) {
  const updExp = (i: number, patch: Partial<Experiencia>) => {
    const arr = [...form.exp]
    arr[i] = { ...arr[i], ...patch }
    upd('exp', arr)
  }
  const updEdu = (i: number, patch: Partial<Educacion>) => {
    const arr = [...form.edu]
    arr[i] = { ...arr[i], ...patch }
    upd('edu', arr)
  }

  return (
    <div>
      <Eyebrow>Paso 3</Eyebrow>
      <Heading>Experiencia y educación</Heading>

      <h3 className="font-roxborough text-xl mb-4">Experiencia laboral</h3>
      {form.exp.map((ex, i) => (
        <div key={i} className="bg-white border border-henko-turquoise/15 shadow-sm rounded-2xl p-5 mb-3">
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <input className={inputClass} placeholder="Empresa" value={ex.empresa} onChange={e => updExp(i, { empresa: e.target.value })} />
            <input className={inputClass} placeholder="Cargo" value={ex.cargo} onChange={e => updExp(i, { cargo: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>DESDE</label>
              <MonthField value={ex.desde} onChange={v => updExp(i, { desde: v })} placeholder="mes / año" />
            </div>
            <div>
              <label className={labelClass}>HASTA</label>
              <MonthField value={ex.hasta} onChange={v => updExp(i, { hasta: v })} placeholder="mes / año" allowActual />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => upd('exp', [...form.exp, { empresa: '', cargo: '', desde: '', hasta: '' }])} className="text-sm text-henko-turquoise font-semibold hover:underline mb-7">
        + Añadir experiencia
      </button>

      <h3 className="font-roxborough text-xl mt-5 mb-4">Educación</h3>
      {form.edu.map((ed, i) => (
        <div key={i} className="bg-white border border-henko-turquoise/15 shadow-sm rounded-2xl p-5 mb-3">
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div>
              <label className={labelClass}>CENTRO / UNIVERSIDAD</label>
              <input className={inputClass} placeholder="Centro / Universidad" value={ed.centro} onChange={e => updEdu(i, { centro: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>TÍTULO / GRADO</label>
              <ComboboxField
                value={ed.titulo}
                onChange={v => updEdu(i, { titulo: v })}
                options={TITULOS_EDU}
                placeholder="Tipo de titulación…"
              />
            </div>
          </div>
          <div className="max-w-[200px]">
            <label className={labelClass}>AÑO FIN</label>
            <input className={inputClass} placeholder="2024" value={ed.ano} onChange={e => updEdu(i, { ano: e.target.value })} />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => upd('edu', [...form.edu, { centro: '', titulo: '', ano: '' }])} className="text-sm text-henko-turquoise font-semibold hover:underline mb-8 block">
        + Añadir educación
      </button>

      <div className="flex gap-3">
        <SecondaryBtn onClick={back}>← Volver</SecondaryBtn>
        <div className="flex-1"><PrimaryBtn onClick={next} full>Continuar →</PrimaryBtn></div>
      </div>
    </div>
  )
}

// ── Paso 4 ───────────────────────────────────────────────────────────────────
function StepCV({ form, upd, fileRef, back, finish, submitting }: {
  form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  fileRef: React.RefObject<HTMLInputElement | null>; back: () => void; finish: () => void; submitting: boolean
}) {
  return (
    <div>
      <Eyebrow>Paso 4</Eyebrow>
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
        <div className="flex-1"><PrimaryBtn onClick={finish} full disabled={submitting}>{submitting ? 'Creando perfil...' : 'Crear perfil →'}</PrimaryBtn></div>
      </div>
    </div>
  )
}
