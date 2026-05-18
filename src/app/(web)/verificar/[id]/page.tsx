import QRCode from 'qrcode'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanySettings } from '@/lib/company-settings'
import { urlVerificacion } from '@/lib/verifactu/qr'

export const metadata = {
  title: 'Verificación de factura — Henkoaching',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type FacturaPublica = {
  id: string
  numero: string
  fecha_emision: string
  cliente_nombre: string
  cliente_nif: string | null
  total: number
  estado: string
  verifactu_alta_id: string | null
  verifactu_anulacion_id: string | null
}

type RegistroPublico = {
  huella: string
  fecha_hora_generacion: string
  num_registro: number
  tipo_factura_aeat: string
}

const TIPO_FACTURA_LABEL: Record<string, string> = {
  F1: 'Factura ordinaria',
  F2: 'Factura simplificada',
  F3: 'Factura emitida en sustitución de simplificadas',
  R1: 'Factura rectificativa (art. 80.1, 80.2 y errores fundados)',
  R2: 'Factura rectificativa (art. 80.3)',
  R3: 'Factura rectificativa (art. 80.4)',
  R4: 'Factura rectificativa (resto)',
  R5: 'Factura rectificativa simplificada',
}

async function leerDatos(id: string, hashCorto: string | null) {
  // Sin parametro `h` no se devuelve nada: el QR es la unica via legitima
  // de acceso. Conocer el UUID no debe bastar para ver datos fiscales.
  if (!hashCorto || !/^[A-Fa-f0-9]{8,64}$/.test(hashCorto)) {
    return { factura: null, registro: null, anulacion: null }
  }

  const admin = createAdminClient()

  const { data: facturaRaw } = await admin
    .from('facturas' as never)
    .select('id, numero, fecha_emision, cliente_nombre, cliente_nif, total, estado, verifactu_alta_id, verifactu_anulacion_id')
    .eq('id', id)
    .maybeSingle()

  const factura = facturaRaw as FacturaPublica | null
  if (!factura) return { factura: null, registro: null, anulacion: null }

  if (!factura.verifactu_alta_id) return { factura: null, registro: null, anulacion: null }

  const { data: registroRaw } = await admin
    .from('verifactu_registros' as never)
    .select('huella, fecha_hora_generacion, num_registro, tipo_factura_aeat')
    .eq('id', factura.verifactu_alta_id)
    .maybeSingle()

  const registro = registroRaw as RegistroPublico | null
  if (!registro) return { factura: null, registro: null, anulacion: null }

  // Validar prefijo de huella contra el QR (defensa en profundidad).
  if (!registro.huella.toUpperCase().startsWith(hashCorto.toUpperCase())) {
    return { factura: null, registro: null, anulacion: null }
  }

  let anulacion: RegistroPublico | null = null
  if (factura.verifactu_anulacion_id) {
    const { data: anulRaw } = await admin
      .from('verifactu_registros' as never)
      .select('huella, fecha_hora_generacion, num_registro, tipo_factura_aeat')
      .eq('id', factura.verifactu_anulacion_id)
      .maybeSingle()
    anulacion = anulRaw as RegistroPublico | null
  }

  return { factura, registro, anulacion }
}

export default async function VerificarFacturaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ h?: string }>
}) {
  const { id } = await params
  const { h } = await searchParams

  const [{ factura, registro, anulacion }, settings] = await Promise.all([
    leerDatos(id, h ?? null),
    getCompanySettings(),
  ])

  if (!factura || !registro) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-henko-cream">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="font-roxborough text-2xl text-gray-900 mb-2">Factura no encontrada</p>
          <p className="font-raleway text-sm text-gray-500">
            La factura no existe o la huella del código QR no coincide con la registrada.
          </p>
        </div>
      </main>
    )
  }

  const fechaEmisionEs = new Date(factura.fecha_emision).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  const fechaRegistroEs = new Date(registro.fecha_hora_generacion).toLocaleString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const totalEs = factura.total.toFixed(2).replace('.', ',') + ' €'
  // RGPD: enmascarar el NIF del cliente. El receptor de la factura puede
  // confirmar identidad con los ultimos 3 caracteres; un tercero que tenga
  // el UUID y el QR no obtiene un NIF utilizable.
  const clienteNifMasked = factura.cliente_nif
    ? '••••' + factura.cliente_nif.slice(-3).toUpperCase()
    : null

  const tipoFacturaLabel = TIPO_FACTURA_LABEL[registro.tipo_factura_aeat] ?? registro.tipo_factura_aeat

  // Generar QR de esta misma URL para re-compartir / reimprimir desde la página pública
  const qrUrl = urlVerificacion(factura.id, registro.huella)
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 240,
  })

  const emisorDireccionLineas = [
    settings.emisor_direccion,
    [settings.emisor_cp, settings.emisor_ciudad].filter(Boolean).join(' '),
    [settings.emisor_provincia, settings.emisor_pais].filter(Boolean).join(', '),
  ].filter(Boolean)

  return (
    <main className="min-h-screen px-6 py-16 md:py-24 bg-henko-cream">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
        <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-henko-turquoise mb-3">
          Verificación de factura · RD 1007/2023
        </p>
        <h1 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-1">{factura.numero}</h1>
        <p className="font-raleway text-sm text-gray-500 mb-8">Emitida el {fechaEmisionEs}</p>

        {anulacion && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="font-raleway text-sm font-semibold text-red-700">
              Factura anulada el {new Date(anulacion.fecha_hora_generacion).toLocaleDateString('es-ES')}.
            </p>
            <p className="font-raleway text-xs text-red-600 mt-0.5">
              Registro de anulación nº {anulacion.num_registro}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
          <dl className="space-y-4 font-raleway text-sm">
            <Row
              label="Emisor"
              value={settings.emisor_nombre || '—'}
              sub={
                <>
                  {settings.emisor_nif && <div>NIF: {settings.emisor_nif}</div>}
                  {emisorDireccionLineas.map((l, i) => <div key={i}>{l}</div>)}
                </>
              }
            />
            <Row label="Cliente" value={factura.cliente_nombre} sub={clienteNifMasked ?? ''} />
            <Row label="Tipo" value={tipoFacturaLabel} sub={registro.tipo_factura_aeat} />
            <Row label="Total" value={totalEs} />
            <Row label="Estado" value={anulacion ? 'Anulada' : factura.estado} />
            <Row
              label="Registro"
              value={`Nº ${registro.num_registro}`}
              sub={`Generado el ${fechaRegistroEs}`}
            />
            <Row
              label="Huella"
              value={<code className="break-all text-xs">{registro.huella}</code>}
              sub="SHA-256 del registro encadenado"
            />
          </dl>

          <div className="flex flex-col items-center md:items-end shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`Código QR de verificación de la factura ${factura.numero}`}
              width={160}
              height={160}
              className="rounded-xl border border-gray-100"
            />
            <p className="font-raleway text-[10px] text-gray-400 mt-2 text-center md:text-right max-w-[160px]">
              Escanea para volver a esta página
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 space-y-2">
          <p className="font-raleway text-xs text-gray-500 leading-relaxed">
            Este registro forma parte de un libro de facturación encadenado conforme al
            <strong> Real Decreto 1007/2023</strong> y la <strong>Orden HAC/1177/2024</strong>.
            La integridad se garantiza mediante la huella SHA-256 mostrada, que enlaza
            criptográficamente esta factura con la inmediatamente anterior del emisor.
          </p>
          <p className="font-raleway text-xs text-gray-400 leading-relaxed">
            La validación contra los servicios de la Agencia Tributaria estará disponible
            cuando la entidad emisora active el envío automático Veri*factu.
          </p>
        </div>
      </div>
    </main>
  )
}


function Row({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4 border-b border-gray-100 pb-3 last:border-0">
      <dt className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400 sm:w-28 mb-1 sm:mb-0 shrink-0">
        {label}
      </dt>
      <dd className="font-raleway text-gray-900 flex-1 min-w-0">
        <div>{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
      </dd>
    </div>
  )
}
