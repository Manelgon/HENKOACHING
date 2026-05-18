'use client'

import { useState, useTransition } from 'react'
import { useConfirm, useToast } from '@/shared/feedback/FeedbackContext'
import { reintentarEnvioVerifactu, getRegistroVerifactu } from '@/actions/verifactu'

type EstadoEnvio = 'pendiente' | 'enviado' | 'aceptado' | 'rechazado' | 'error'

type Props = {
  registroId: string
  numeroFactura: string
  estadoEnvio: EstadoEnvio
}

type DetalleRegistro = {
  num_registro: number
  tipo: 'alta' | 'anulacion'
  numero_factura: string
  fecha_hora_generacion: string
  huella: string
  huella_anterior: string | null
  estado_envio: string
  ultimo_error: string | null
  intentos: number
  enviado_at: string | null
  csv_aeat: string | null
  xml_payload: string | null
  respuesta_aeat: string | null
}

export default function RegistroAcciones({ registroId, numeroFactura, estadoEnvio }: Props) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detalle, setDetalle] = useState<DetalleRegistro | null>(null)
  const confirm = useConfirm()
  const toast = useToast()

  const puedeReintentar = estadoEnvio === 'error' || estadoEnvio === 'rechazado'

  async function abrirDetalle() {
    setOpen(true)
    if (detalle) return
    setLoading(true)
    const r = await getRegistroVerifactu(registroId)
    setLoading(false)
    if ('error' in r && r.error) {
      toast('error', r.error)
      setOpen(false)
      return
    }
    if ('registro' in r) {
      setDetalle(r.registro as DetalleRegistro)
    }
  }

  async function reintentar() {
    const ok = await confirm({
      title: 'Reintentar envío',
      description: `Se marcará el registro de la factura ${numeroFactura} como pendiente para que el próximo ciclo de envío AEAT lo recoja.`,
      confirmLabel: 'Reintentar',
    })
    if (!ok) return

    startTransition(async () => {
      const r = await reintentarEnvioVerifactu(registroId)
      if ('error' in r && r.error) {
        toast('error', r.error)
        return
      }
      toast('success', 'Registro marcado para reenvío')
    })
  }

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto)
    toast('success', 'Copiado al portapapeles')
  }

  return (
    <>
      <div className="flex items-center gap-1.5 justify-end">
        <button
          onClick={abrirDetalle}
          className="px-2 py-1 rounded-md text-[10px] font-raleway font-semibold text-henko-turquoise hover:bg-henko-greenblue/10"
          title="Ver XML y respuesta AEAT"
        >
          Ver XML
        </button>
        {puedeReintentar && (
          <button
            onClick={reintentar}
            disabled={isPending}
            className="px-2 py-1 rounded-md text-[10px] font-raleway font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-50"
            title="Reintentar envío a la AEAT"
          >
            {isPending ? '…' : 'Reintentar'}
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex justify-end"
          onClick={() => setOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-2xl h-full overflow-y-auto shadow-xl flex flex-col"
          >
            <header className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 flex items-start justify-between gap-3">
              <div>
                <p className="font-roxborough text-xl text-gray-900">Registro Veri*factu</p>
                <p className="font-raleway text-xs text-gray-500 font-mono">{numeroFactura}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="px-6 py-5 space-y-5 flex-1">
              {loading && (
                <p className="font-raleway text-sm text-gray-500">Cargando…</p>
              )}

              {detalle && (
                <>
                  {/* Metadata */}
                  <section>
                    <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Datos del registro
                    </p>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5 font-raleway text-sm">
                      <Row label="Nº de registro" value={String(detalle.num_registro)} />
                      <Row label="Tipo" value={detalle.tipo === 'anulacion' ? 'Anulación' : 'Alta'} />
                      <Row
                        label="Generado"
                        value={new Date(detalle.fecha_hora_generacion).toLocaleString('es-ES')}
                      />
                      <Row label="Estado envío" value={detalle.estado_envio} />
                      <Row label="Intentos" value={String(detalle.intentos)} />
                      {detalle.enviado_at && (
                        <Row
                          label="Enviado el"
                          value={new Date(detalle.enviado_at).toLocaleString('es-ES')}
                        />
                      )}
                      {detalle.csv_aeat && (
                        <Row label="CSV AEAT" value={<code className="text-xs">{detalle.csv_aeat}</code>} />
                      )}
                    </div>
                  </section>

                  {/* Huellas */}
                  <section>
                    <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Encadenamiento
                    </p>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3 font-raleway text-xs">
                      <div>
                        <p className="text-gray-500 mb-1">Huella anterior</p>
                        <code className="block break-all text-[11px] text-gray-700 font-mono">
                          {detalle.huella_anterior ?? '— (primer registro)'}
                        </code>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Huella de este registro</p>
                        <code className="block break-all text-[11px] text-gray-700 font-mono">
                          {detalle.huella}
                        </code>
                      </div>
                    </div>
                  </section>

                  {/* Último error */}
                  {detalle.ultimo_error && (
                    <section>
                      <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2">
                        Último error
                      </p>
                      <pre className="bg-red-50 border border-red-100 rounded-2xl p-4 text-[11px] text-red-700 font-mono whitespace-pre-wrap break-all">
                        {detalle.ultimo_error}
                      </pre>
                    </section>
                  )}

                  {/* XML payload */}
                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        XML enviado / por enviar
                      </p>
                      {detalle.xml_payload && (
                        <button
                          onClick={() => copiar(detalle.xml_payload!)}
                          className="font-raleway text-[10px] font-semibold text-henko-turquoise hover:underline"
                        >
                          Copiar
                        </button>
                      )}
                    </div>
                    {detalle.xml_payload ? (
                      <pre className="bg-gray-900 rounded-2xl p-4 text-[10px] text-green-200 font-mono overflow-x-auto whitespace-pre max-h-96">
                        {detalle.xml_payload}
                      </pre>
                    ) : (
                      <p className="font-raleway text-sm text-gray-500 italic">Sin XML generado</p>
                    )}
                  </section>

                  {/* Respuesta AEAT */}
                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Respuesta AEAT
                      </p>
                      {detalle.respuesta_aeat && (
                        <button
                          onClick={() => copiar(detalle.respuesta_aeat!)}
                          className="font-raleway text-[10px] font-semibold text-henko-turquoise hover:underline"
                        >
                          Copiar
                        </button>
                      )}
                    </div>
                    {detalle.respuesta_aeat ? (
                      <pre className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[11px] text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-64">
                        {typeof detalle.respuesta_aeat === 'string'
                          ? detalle.respuesta_aeat
                          : JSON.stringify(detalle.respuesta_aeat, null, 2)}
                      </pre>
                    ) : (
                      <p className="font-raleway text-sm text-gray-500 italic">
                        Todavía no se ha enviado a la AEAT. El envío automático se activa con el certificado digital.
                      </p>
                    )}
                  </section>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}


function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-gray-600">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-900 text-right font-medium">{value}</span>
    </div>
  )
}
