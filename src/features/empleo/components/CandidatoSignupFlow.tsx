'use client'

import { useState, useRef, Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Experiencia = { empresa: string; cargo: string; desde: string; hasta: string }
type Educacion = { centro: string; titulo: string; ano: string }
type Idioma = { idioma: string; nivel: string }

type FormState = {
  nombre: string
  apellidos: string
  email: string
  password: string
  telefono: string
  ubicacion: string
  cargo: string
  exp: Experiencia[]
  edu: Educacion[]
  idiomas: Idioma[]
  cv: File | null
}

const inputClass = 'w-full px-4 py-3 rounded-xl text-sm border-[1.5px] border-black/10 bg-white outline-none focus:border-henko-turquoise transition-colors'
const labelClass = 'text-[11px] tracking-[0.12em] font-bold text-henko-turquoise mb-1.5 block'

export default function CandidatoSignupFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
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

  return (
    <div className="min-h-screen bg-henko-white pt-20 font-raleway">
      <div className="max-w-2xl mx-auto px-6 md:px-10 py-14">
        <Link href="/" className="inline-block mb-8 text-xs text-gray-400 hover:text-gray-600">
          ← Volver al sitio
        </Link>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-12">
          {['Cuenta', 'Perfil', 'Experiencia', 'CV'].map((s, i) => (
            <Fragment key={s}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > i + 1
                      ? 'bg-henko-turquoise text-white'
                      : step === i + 1
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs ${step === i + 1 ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
                  {s}
                </span>
              </div>
              {i < 3 && (
                <div
                  className={`flex-1 h-px transition-all ${
                    step > i + 1 ? 'bg-henko-turquoise' : 'bg-gray-200'
                  }`}
                />
              )}
            </Fragment>
          ))}
        </div>

        {step === 1 && <StepCuenta form={form} upd={upd} next={() => setStep(2)} />}
        {step === 2 && <StepPerfil form={form} upd={upd} back={() => setStep(1)} next={() => setStep(3)} />}
        {step === 3 && <StepExperiencia form={form} upd={upd} back={() => setStep(2)} next={() => setStep(4)} />}
        {step === 4 && (
          <StepCV
            form={form}
            upd={upd}
            fileRef={fileRef}
            back={() => setStep(3)}
            finish={() => router.push('/candidato/dashboard')}
          />
        )}
      </div>
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-3">{children}</p>
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h1 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-8 leading-tight">{children}</h1>
}

function PrimaryBtn({ children, onClick, full = false, type = 'button' }: { children: React.ReactNode; onClick?: () => void; full?: boolean; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all ${full ? 'w-full' : ''}`}
    >
      {children}
    </button>
  )
}

function SecondaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
    >
      {children}
    </button>
  )
}

function StepCuenta({ form, upd, next }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void; next: () => void }) {
  return (
    <div>
      <Eyebrow>Paso 1</Eyebrow>
      <Heading>Crea tu cuenta</Heading>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>NOMBRE</label>
          <input className={inputClass} placeholder="Tu nombre" value={form.nombre} onChange={(e) => upd('nombre', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>APELLIDOS</label>
          <input className={inputClass} placeholder="Tus apellidos" value={form.apellidos} onChange={(e) => upd('apellidos', e.target.value)} />
        </div>
      </div>
      <div className="mb-4">
        <label className={labelClass}>EMAIL</label>
        <input className={inputClass} type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => upd('email', e.target.value)} />
      </div>
      <div className="mb-8">
        <label className={labelClass}>CONTRASEÑA</label>
        <input className={inputClass} type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => upd('password', e.target.value)} />
      </div>

      <PrimaryBtn onClick={next} full>Continuar →</PrimaryBtn>
    </div>
  )
}

function StepPerfil({ form, upd, back, next }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void; back: () => void; next: () => void }) {
  const fields: [string, 'telefono' | 'ubicacion' | 'cargo', string, string][] = [
    ['TELÉFONO', 'telefono', 'tel', '+34 600 000 000'],
    ['UBICACIÓN', 'ubicacion', 'text', 'Palma, Mallorca'],
    ['CARGO ACTUAL / OBJETIVO', 'cargo', 'text', 'p.ej. Responsable de Operaciones'],
  ]
  return (
    <div>
      <Eyebrow>Paso 2</Eyebrow>
      <Heading>Tu perfil profesional</Heading>

      {fields.map(([l, k, t, ph]) => (
        <div key={k} className="mb-4">
          <label className={labelClass}>{l}</label>
          <input className={inputClass} type={t} placeholder={ph} value={form[k]} onChange={(e) => upd(k, e.target.value)} />
        </div>
      ))}

      <div className="mb-8">
        <label className={labelClass + ' mb-3'}>IDIOMAS</label>
        {form.idiomas.map((id, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 mb-2.5">
            <input
              className={inputClass}
              placeholder="Idioma"
              value={id.idioma}
              onChange={(e) => {
                const arr = [...form.idiomas]
                arr[i] = { ...arr[i], idioma: e.target.value }
                upd('idiomas', arr)
              }}
            />
            <select
              className={inputClass + ' appearance-none'}
              value={id.nivel}
              onChange={(e) => {
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
        <button
          type="button"
          onClick={() => upd('idiomas', [...form.idiomas, { idioma: '', nivel: '' }])}
          className="text-sm text-henko-turquoise font-semibold hover:underline"
        >
          + Añadir idioma
        </button>
      </div>

      <div className="flex gap-3">
        <SecondaryBtn onClick={back}>← Volver</SecondaryBtn>
        <div className="flex-1">
          <PrimaryBtn onClick={next} full>Continuar →</PrimaryBtn>
        </div>
      </div>
    </div>
  )
}

function StepExperiencia({ form, upd, back, next }: { form: FormState; upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void; back: () => void; next: () => void }) {
  return (
    <div>
      <Eyebrow>Paso 3</Eyebrow>
      <Heading>Experiencia y educación</Heading>

      <h3 className="font-roxborough text-xl mb-4">Experiencia laboral</h3>
      {form.exp.map((ex, i) => (
        <div key={i} className="bg-henko-white border border-black/5 rounded-2xl p-5 mb-3">
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <input
              className={inputClass}
              placeholder="Empresa"
              value={ex.empresa}
              onChange={(e) => {
                const arr = [...form.exp]
                arr[i] = { ...arr[i], empresa: e.target.value }
                upd('exp', arr)
              }}
            />
            <input
              className={inputClass}
              placeholder="Cargo"
              value={ex.cargo}
              onChange={(e) => {
                const arr = [...form.exp]
                arr[i] = { ...arr[i], cargo: e.target.value }
                upd('exp', arr)
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              className={inputClass}
              placeholder="Desde (ej. 2020)"
              value={ex.desde}
              onChange={(e) => {
                const arr = [...form.exp]
                arr[i] = { ...arr[i], desde: e.target.value }
                upd('exp', arr)
              }}
            />
            <input
              className={inputClass}
              placeholder="Hasta (o 'Actual')"
              value={ex.hasta}
              onChange={(e) => {
                const arr = [...form.exp]
                arr[i] = { ...arr[i], hasta: e.target.value }
                upd('exp', arr)
              }}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => upd('exp', [...form.exp, { empresa: '', cargo: '', desde: '', hasta: '' }])}
        className="text-sm text-henko-turquoise font-semibold hover:underline mb-7"
      >
        + Añadir experiencia
      </button>

      <h3 className="font-roxborough text-xl mt-5 mb-4">Educación</h3>
      {form.edu.map((ed, i) => (
        <div key={i} className="bg-henko-white border border-black/5 rounded-2xl p-5 mb-3">
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <input
              className={inputClass}
              placeholder="Centro / Universidad"
              value={ed.centro}
              onChange={(e) => {
                const arr = [...form.edu]
                arr[i] = { ...arr[i], centro: e.target.value }
                upd('edu', arr)
              }}
            />
            <input
              className={inputClass}
              placeholder="Título / Grado"
              value={ed.titulo}
              onChange={(e) => {
                const arr = [...form.edu]
                arr[i] = { ...arr[i], titulo: e.target.value }
                upd('edu', arr)
              }}
            />
          </div>
          <input
            className={inputClass + ' max-w-[200px]'}
            placeholder="Año fin"
            value={ed.ano}
            onChange={(e) => {
              const arr = [...form.edu]
              arr[i] = { ...arr[i], ano: e.target.value }
              upd('edu', arr)
            }}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => upd('edu', [...form.edu, { centro: '', titulo: '', ano: '' }])}
        className="text-sm text-henko-turquoise font-semibold hover:underline mb-8 block"
      >
        + Añadir educación
      </button>

      <div className="flex gap-3">
        <SecondaryBtn onClick={back}>← Volver</SecondaryBtn>
        <div className="flex-1">
          <PrimaryBtn onClick={next} full>Continuar →</PrimaryBtn>
        </div>
      </div>
    </div>
  )
}

function StepCV({ form, upd, fileRef, back, finish }: {
  form: FormState
  upd: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  fileRef: React.RefObject<HTMLInputElement | null>
  back: () => void
  finish: () => void
}) {
  return (
    <div>
      <Eyebrow>Paso 4</Eyebrow>
      <h1 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-3 leading-tight">Sube tu CV</h1>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        Añade tu currículum en PDF. Lo usaremos en tus solicitudes a las ofertas.
      </p>

      <div
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl px-8 py-12 text-center cursor-pointer mb-8 transition-all ${
          form.cv
            ? 'border-henko-turquoise bg-henko-greenblue/20'
            : 'border-black/15 bg-[#faf7f4] hover:border-henko-turquoise/50'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => upd('cv', e.target.files?.[0] ?? null)}
        />
        {form.cv ? (
          <>
            <div className="w-12 h-12 rounded-full bg-henko-turquoise flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="font-semibold text-sm">{form.cv.name}</p>
            <p className="text-xs text-henko-turquoise mt-1">Click para cambiar</p>
          </>
        ) : (
          <>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mx-auto mb-3">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-sm text-gray-400">
              Arrastra tu CV o <span className="text-henko-turquoise font-semibold">haz click aquí</span>
            </p>
            <p className="text-xs text-gray-300 mt-1.5">Solo PDF · Máx. 5MB</p>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <SecondaryBtn onClick={back}>← Volver</SecondaryBtn>
        <div className="flex-1">
          <PrimaryBtn onClick={finish} full>Crear perfil →</PrimaryBtn>
        </div>
      </div>
    </div>
  )
}
