'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import { guardarAjustes, subirImagenEmisor, quitarImagenEmisor, type AjustesInput } from '@/actions/ajustes'
import type { CompanySettings } from '@/lib/company-settings'

type Props = {
  settings: CompanySettings
  logoUrl: string | null
  firmaUrl: string | null
  headerUrl: string | null
  footerUrl: string | null
  sobreMiUrl: string | null
  ratFirmadoUrl: string | null
  ratFirmadoAt: string | null
}

const TABS = [
  { key: 'fiscal',      label: 'Datos fiscales' },
  { key: 'imagenes',    label: 'Imágenes' },
  { key: 'facturacion', label: 'Facturación' },
] as const

type TabKey = typeof TABS[number]['key']

export default function AjustesForm({ settings, logoUrl, firmaUrl, headerUrl, footerUrl, sobreMiUrl }: Omit<Props, 'ratFirmadoUrl' | 'ratFirmadoAt'>) {
  const router = useRouter()
  const runAction = useAction()

  const [tab, setTab] = useState<TabKey>('fiscal')
  const [datos, setDatos] = useState<AjustesInput>({
    emisor_nombre: settings.emisor_nombre,
    emisor_nif: settings.emisor_nif,
    emisor_direccion: settings.emisor_direccion,
    emisor_cp: settings.emisor_cp,
    emisor_ciudad: settings.emisor_ciudad,
    emisor_provincia: settings.emisor_provincia,
    emisor_pais: settings.emisor_pais,
    emisor_email: settings.emisor_email,
    emisor_telefono: settings.emisor_telefono,
    emisor_web: settings.emisor_web,
    emisor_iban: settings.emisor_iban,
    prefijo_anio: settings.prefijo_anio,
  })

  const set = <K extends keyof AjustesInput>(key: K, value: AjustesInput[K]) =>
    setDatos((prev) => ({ ...prev, [key]: value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const r = await runAction('Guardando ajustes', () => guardarAjustes(datos), {
      successMessage: 'Ajustes guardados',
    })
    if (r.ok) router.refresh()
  }

  const showSave = tab === 'fiscal' || tab === 'facturacion' || tab === 'imagenes'

  return (
    <form onSubmit={onSubmit}>
      {/* Tab bar — fuera de la tarjeta */}
      <div className="flex items-end gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-3 font-raleway text-sm font-semibold transition-colors whitespace-nowrap ${
              tab === t.key ? 'text-henko-turquoise' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
            {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-henko-turquoise rounded-full" />}
          </button>
        ))}
      </div>

      {/* Tarjeta con el contenido */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">

          {/* ── Datos fiscales ── */}
          {tab === 'fiscal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nombre / razón social" required>
                <input
                  type="text"
                  required
                  value={datos.emisor_nombre}
                  onChange={(e) => set('emisor_nombre', e.target.value)}
                  placeholder="Jennifer Cervera Henkoaching S.L."
                  className="input"
                />
              </Field>
              <Field label="NIF / CIF" required>
                <input
                  type="text"
                  required
                  value={datos.emisor_nif}
                  onChange={(e) => set('emisor_nif', e.target.value)}
                  placeholder="B12345678"
                  className="input"
                />
              </Field>
              <Field label="Dirección" wide>
                <input
                  type="text"
                  value={datos.emisor_direccion}
                  onChange={(e) => set('emisor_direccion', e.target.value)}
                  placeholder="Calle Ejemplo, 12, 3ºA"
                  className="input"
                />
              </Field>
              <Field label="Código postal">
                <input
                  type="text"
                  value={datos.emisor_cp}
                  onChange={(e) => set('emisor_cp', e.target.value)}
                  placeholder="07001"
                  className="input"
                />
              </Field>
              <Field label="Ciudad">
                <input
                  type="text"
                  value={datos.emisor_ciudad}
                  onChange={(e) => set('emisor_ciudad', e.target.value)}
                  placeholder="Palma de Mallorca"
                  className="input"
                />
              </Field>
              <Field label="Provincia">
                <input
                  type="text"
                  value={datos.emisor_provincia}
                  onChange={(e) => set('emisor_provincia', e.target.value)}
                  placeholder="Islas Baleares"
                  className="input"
                />
              </Field>
              <Field label="País">
                <input
                  type="text"
                  value={datos.emisor_pais}
                  onChange={(e) => set('emisor_pais', e.target.value)}
                  placeholder="España"
                  className="input"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={datos.emisor_email}
                  onChange={(e) => set('emisor_email', e.target.value)}
                  placeholder="info@henkoaching.com"
                  className="input"
                />
              </Field>
              <Field label="Teléfono">
                <input
                  type="tel"
                  value={datos.emisor_telefono}
                  onChange={(e) => set('emisor_telefono', e.target.value)}
                  placeholder="+34 600 000 000"
                  className="input"
                />
              </Field>
              <Field label="Web">
                <input
                  type="url"
                  value={datos.emisor_web}
                  onChange={(e) => set('emisor_web', e.target.value)}
                  placeholder="https://henkoaching.com"
                  className="input"
                />
              </Field>
              <Field label="IBAN" wide>
                <input
                  type="text"
                  value={datos.emisor_iban}
                  onChange={(e) => set('emisor_iban', e.target.value)}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  className="input font-mono tracking-wide"
                />
                <p className="text-xs text-gray-400 mt-1 font-raleway">Se mostrará como nº de cuenta para ingresos en facturas.</p>
              </Field>
            </div>
          )}

          {/* ── Imágenes ── */}
          {tab === 'imagenes' && (
            <div className="space-y-8">
              <div>
                <p className="font-roxborough text-lg text-gray-800 mb-1">PDFs y facturas</p>
                <p className="font-raleway text-sm text-gray-400 font-light mb-5">Logo y firma se imprimen en cada PDF. La cabecera y el pie son banners panorámicos opcionales.</p>
                <div className="space-y-6">
                  <ImagenUploader tipo="header" label="Cabecera de PDFs" hint="Banner panorámico arriba del documento. Recomendado 1200×200px." url={headerUrl} wide onChange={() => router.refresh()} />
                  <ImagenUploader tipo="footer" label="Pie de documento" hint="Banner panorámico abajo del documento. Recomendado 1200×150px." url={footerUrl} wide onChange={() => router.refresh()} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImagenUploader tipo="logo" label="Logo" hint="Aparece en la esquina del PDF si no hay cabecera. PNG transparente recomendado." url={logoUrl} onChange={() => router.refresh()} />
                    <ImagenUploader tipo="firma" label="Firma" hint="Imagen de firma que aparece al pie de las facturas." url={firmaUrl} onChange={() => router.refresh()} />
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-8">
                <p className="font-roxborough text-lg text-gray-800 mb-1">Web pública</p>
                <p className="font-raleway text-sm text-gray-400 font-light mb-5">Imágenes que aparecen en las páginas públicas del sitio.</p>
                <ImagenUploader tipo="sobre_mi" label="Foto Sobre mí" hint="Sección «Sobre mí» de la web. Recomendado vertical 800×1000px. PNG o JPG." url={sobreMiUrl} onChange={() => router.refresh()} />
              </div>
            </div>
          )}

          {/* ── Facturación ── */}
          {tab === 'facturacion' && (
            <div className="space-y-4">
              <p className="font-raleway text-sm text-gray-400 font-light mb-2">El IVA, IRPF, forma de pago y vencimiento se eligen en cada factura por separado.</p>
              <Field label="Formato del número de factura">
                <label className="flex items-center gap-2 py-2.5 font-raleway text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={datos.prefijo_anio}
                    onChange={(e) => set('prefijo_anio', e.target.checked)}
                    className="w-4 h-4 rounded text-henko-turquoise focus:ring-henko-turquoise"
                  />
                  Incluir año (ej: F2026-0001)
                </label>
                <p className="text-xs text-gray-400 font-raleway">
                  La serie (prefijo) se elige en cada factura. Si lo desactivas: correlativo continuo tipo F00001.
                </p>
              </Field>
            </div>
          )}


        </div>

        {/* Footer con botón guardar (solo en pestañas con form) */}
        {showSave && (
          <div className="flex justify-end px-6 md:px-8 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
            >
              Guardar cambios
            </button>
          </div>
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



function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''}`}>
      <span className="font-raleway text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
        {label} {required && <span className="text-henko-coral">*</span>}
      </span>
      {children}
    </label>
  )
}

function ImagenUploader({
  tipo,
  label,
  hint,
  url,
  wide,
  onChange,
}: {
  tipo: 'logo' | 'firma' | 'header' | 'footer' | 'sobre_mi'
  label: string
  hint: string
  url: string | null
  wide?: boolean
  onChange: () => void
}) {
  const runAction = useAction()
  const confirm = useConfirm()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('tipo', tipo)
    const r = await runAction(`Subiendo ${label.toLowerCase()}`, () => subirImagenEmisor(fd), {
      successMessage: `${label} actualizado`,
    })
    setUploading(false)
    e.target.value = ''
    if (r.ok) onChange()
  }

  async function onRemove() {
    const ok = await confirm({
      title: `Quitar ${label.toLowerCase()}`,
      description: `¿Quitar ${label.toLowerCase()} actual?`,
      confirmLabel: 'Quitar',
      variant: 'danger',
    })
    if (!ok) return
    const r = await runAction(`Quitando ${label.toLowerCase()}`, () => quitarImagenEmisor(tipo), {
      successMessage: `${label} eliminado`,
    })
    if (r.ok) onChange()
  }

  return (
    <div>
      <p className="font-raleway text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      <div className={`border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 bg-gray-50 ${wide ? 'min-h-[120px]' : 'min-h-[160px]'}`}>
        {uploading ? (
          <span className="font-raleway text-sm text-gray-500">Subiendo…</span>
        ) : url ? (
          <>
            {/* Imagen firmada: Next/Image necesita el dominio whitelisted, usamos <img> simple */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={label}
              className={`object-contain rounded ${wide ? 'max-h-24 w-full' : 'max-h-28'}`}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-raleway font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-raleway font-semibold hover:bg-red-100"
              >
                Quitar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-henko-turquoise text-white text-xs font-raleway font-semibold hover:bg-henko-turquoise-light"
            >
              Subir imagen
            </button>
          </>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1.5 font-raleway">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFile}
      />
    </div>
  )
}
