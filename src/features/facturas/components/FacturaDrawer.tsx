'use client'

import { useState } from 'react'
import { useConfirm } from '@/shared/feedback/FeedbackContext'
import { getEstadoMeta, FORMAS_PAGO, type EstadoFactura } from './estados'
import type { FacturaRow } from '@/app/(main)/dashboard/facturas/page'

type FormaPago = 'transferencia' | 'efectivo' | 'bizum' | 'tarjeta' | 'domiciliacion'

type Props = {
  factura: FacturaRow & { estado_calc: EstadoFactura }
  facturaRectificadaNumero: string | null
  puedeRectificarse: boolean
  onClose: () => void
  onCambiarEstado: (estado: EstadoFactura, extras?: { motivo_devolucion?: string | null; fecha_pago?: string | null; forma_pago?: FormaPago | null }) => void
  onDescargar: () => void
  onDescargarXml: () => void
  onRectificar: (tipo: 'rectificativa' | 'abono') => void
  onActualizarNoFiscal: (input: { notas: string | null; fecha_vencimiento: string | null; forma_pago: FormaPago | null }) => Promise<void>
  onEliminar: () => void
}

export default function FacturaDrawer({
  factura,
  facturaRectificadaNumero,
  puedeRectificarse,
  onClose,
  onCambiarEstado,
  onDescargar,
  onDescargarXml,
  onRectificar,
  onActualizarNoFiscal,
  onEliminar,
}: Props) {
  const estado = getEstadoMeta(factura.estado_calc)
  const esRectificativa = !!factura.factura_rectificada_id
  const esAbono = esRectificativa && factura.numero.startsWith('A')
  const tipoLabel = esAbono ? 'Abono' : 'Rectificativa'
  const tipoColor = esAbono
    ? 'bg-red-50 text-red-600 border-red-200'
    : 'bg-orange-50 text-henko-orange border-orange-200'
  const confirm = useConfirm()
  const [confirmDevolver, setConfirmDevolver] = useState(false)
  const [motivo, setMotivo] = useState('')

  // Editor inline de datos no fiscales (lo único que puede cambiar tras emitir)
  const [editando, setEditando] = useState(false)
  const [notasDraft, setNotasDraft] = useState(factura.notas ?? '')
  const [vencimientoDraft, setVencimientoDraft] = useState(factura.fecha_vencimiento ?? '')
  const [formaPagoDraft, setFormaPagoDraft] = useState<FormaPago | ''>((factura.forma_pago as FormaPago) ?? '')
  const [guardandoNoFiscal, setGuardandoNoFiscal] = useState(false)

  function abrirEditor() {
    setNotasDraft(factura.notas ?? '')
    setVencimientoDraft(factura.fecha_vencimiento ?? '')
    setFormaPagoDraft((factura.forma_pago as FormaPago) ?? '')
    setEditando(true)
  }

  async function guardarNoFiscal() {
    setGuardandoNoFiscal(true)
    await onActualizarNoFiscal({
      notas: notasDraft.trim() || null,
      fecha_vencimiento: vencimientoDraft || null,
      forma_pago: (formaPagoDraft || null) as FormaPago | null,
    })
    setGuardandoNoFiscal(false)
    setEditando(false)
  }

  function marcarPagada() {
    onCambiarEstado('pagada', { fecha_pago: new Date().toISOString().slice(0, 10) })
    onClose()
  }
  function marcarPendiente() {
    onCambiarEstado('pendiente')
    onClose()
  }
  function devolver() {
    if (!confirmDevolver) {
      setConfirmDevolver(true)
      return
    }
    onCambiarEstado('devuelta', { motivo_devolucion: motivo.trim() || null })
    onClose()
  }
  async function anular() {
    const ok = await confirm({
      title: 'Anular factura',
      description: '¿Anular esta factura? Quedará registrada pero marcada como anulada.',
      confirmLabel: 'Anular',
      variant: 'danger',
    })
    if (!ok) return
    onCambiarEstado('anulada')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md h-full overflow-y-auto shadow-xl flex flex-col"
      >
        <div className="px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="font-mono font-bold text-2xl text-gray-900">{factura.numero}</p>
              <p className="font-raleway text-sm text-gray-500">{factura.cliente_nombre}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold ${estado.bg} ${estado.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
              {estado.label}
            </span>
            {esRectificativa && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold border ${tipoColor}`}>
                {tipoLabel}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 flex-1">
          {/* Aviso rectificativa / abono */}
          {esRectificativa && (
            <div className={`border rounded-2xl p-4 ${esAbono ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
              <p className={`font-raleway text-[10px] font-bold uppercase tracking-widest mb-1 ${esAbono ? 'text-red-600' : 'text-henko-orange'}`}>
                {esAbono ? 'Abona a' : 'Rectifica a'}
              </p>
              <p className="font-raleway font-bold text-gray-900 font-mono">
                {facturaRectificadaNumero ?? '(factura eliminada)'}
              </p>
              {factura.motivo_rectificacion && (
                <p className="font-raleway text-sm text-gray-600 mt-2">{factura.motivo_rectificacion}</p>
              )}
            </div>
          )}
          {/* Resumen */}
          <Section title="Resumen">
            <Row label="Base imponible" value={moneyES(Number(factura.base_imponible))} />
            <Row label={`IVA (${factura.iva_porcentaje}%)`} value={moneyES(Number(factura.iva_importe))} />
            {Number(factura.irpf_porcentaje) > 0 && (
              <Row label={`IRPF (-${factura.irpf_porcentaje}%)`} value={'-' + moneyES(Number(factura.irpf_importe))} />
            )}
            <Row label="TOTAL" value={moneyES(Number(factura.total))} bold />
          </Section>

          {/* Fechas */}
          <Section title="Fechas">
            <Row label="Emisión" value={fechaES(factura.fecha_emision)} />
            {factura.fecha_vencimiento && <Row label="Vencimiento" value={fechaES(factura.fecha_vencimiento)} />}
          </Section>

          {factura.forma_pago && (
            <Section title="Pago">
              <Row label="Forma" value={FORMAS_PAGO.find((f) => f.value === factura.forma_pago)?.label ?? factura.forma_pago} />
            </Section>
          )}

          {/* Confirm devolución */}
          {confirmDevolver && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
              <p className="font-raleway font-semibold text-red-700 text-sm">Marcar como devuelta</p>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Motivo (opcional)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white font-raleway text-sm outline-none focus:border-red-400"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setConfirmDevolver(false); setMotivo('') }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-raleway font-semibold text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={devolver}
                  className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-raleway font-semibold hover:bg-red-600"
                >
                  Confirmar devolución
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Editor inline de campos no fiscales */}
        {editando && factura.estado_calc !== 'anulada' && (
          <div className="mx-6 mb-4 rounded-2xl border border-henko-greenblue/40 bg-henko-cream/60 p-4 space-y-3">
            <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-henko-turquoise">
              Editar datos no fiscales
            </p>
            <p className="font-raleway text-xs text-gray-500 leading-snug">
              Solo se permite modificar notas, vencimiento y forma de pago. El resto requiere rectificativa.
            </p>
            <div>
              <label className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Notas</label>
              <textarea
                value={notasDraft}
                onChange={(e) => setNotasDraft(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Vencimiento</label>
                <input
                  type="date"
                  value={vencimientoDraft}
                  onChange={(e) => setVencimientoDraft(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise"
                />
              </div>
              <div>
                <label className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Forma de pago</label>
                <select
                  value={formaPagoDraft}
                  onChange={(e) => setFormaPagoDraft(e.target.value as FormaPago | '')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise"
                >
                  <option value="">—</option>
                  {FORMAS_PAGO.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setEditando(false)}
                disabled={guardandoNoFiscal}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-raleway font-semibold text-gray-600 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarNoFiscal}
                disabled={guardandoNoFiscal}
                className="px-3 py-1.5 rounded-lg bg-henko-turquoise text-white text-xs font-raleway font-semibold hover:bg-henko-turquoise-light disabled:opacity-50"
              >
                {guardandoNoFiscal ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        )}

        {/* Footer acciones */}
        <div className="px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white space-y-2">
          <button
            onClick={onDescargar}
            className="w-full px-4 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>

          <button
            onClick={onDescargarXml}
            className="w-full px-4 py-2 rounded-xl bg-white border border-henko-turquoise/40 text-henko-turquoise font-raleway font-semibold text-xs hover:bg-henko-greenblue/10 flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Descargar XML Verifactu
          </button>

          <div className="grid grid-cols-2 gap-2">
            {factura.estado_calc !== 'pagada' && factura.estado_calc !== 'anulada' && (
              <button
                onClick={marcarPagada}
                className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-raleway font-semibold text-sm hover:bg-emerald-100"
              >
                Marcar pagada
              </button>
            )}
            {factura.estado_calc === 'pagada' && (
              <button
                onClick={marcarPendiente}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 font-raleway font-semibold text-sm hover:bg-gray-200"
              >
                Volver a pendiente
              </button>
            )}
            {factura.estado_calc !== 'devuelta' && factura.estado_calc !== 'anulada' && (
              <button
                onClick={devolver}
                className="px-3 py-2 rounded-xl bg-red-50 text-red-600 font-raleway font-semibold text-sm hover:bg-red-100"
              >
                Devuelta
              </button>
            )}
            {factura.estado_calc !== 'anulada' && (
              <button
                onClick={abrirEditor}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 font-raleway font-semibold text-sm hover:bg-gray-200"
              >
                Editar notas/pago
              </button>
            )}
            {puedeRectificarse && (
              <>
                <button
                  onClick={() => onRectificar('rectificativa')}
                  className="px-3 py-2 rounded-xl bg-orange-50 text-henko-orange font-raleway font-semibold text-sm hover:bg-orange-100"
                >
                  Rectificar
                </button>
                <button
                  onClick={() => onRectificar('abono')}
                  className="px-3 py-2 rounded-xl bg-red-50 text-red-600 font-raleway font-semibold text-sm hover:bg-red-100"
                >
                  Crear abono
                </button>
              </>
            )}
            {factura.estado_calc !== 'anulada' && (
              <button
                onClick={anular}
                className="col-span-2 px-3 py-2 rounded-xl bg-gray-50 text-gray-500 font-raleway font-semibold text-sm hover:bg-gray-100"
              >
                Anular factura
              </button>
            )}
            {factura.estado_calc === 'anulada' && (
              <button
                onClick={onEliminar}
                className="col-span-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 font-raleway font-semibold text-sm hover:bg-red-100"
              >
                Eliminar definitivamente
              </button>
            )}
          </div>

          {/* Aviso inmutabilidad */}
          <p className="font-raleway text-[10px] text-gray-400 leading-snug pt-1">
            Las facturas emitidas son inmutables (RD 1007/2023). Para corregir importes o datos del cliente, emite una rectificativa o un abono.
          </p>
        </div>
      </aside>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{title}</p>
      <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between font-raleway text-sm ${bold ? 'font-bold text-base text-gray-900 pt-2 mt-1 border-t border-gray-200' : 'text-gray-600'}`}>
      <span>{label}</span>
      <span className={bold ? '' : 'text-gray-900 font-medium'}>{value}</span>
    </div>
  )
}

function moneyES(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' €'
}

function fechaES(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}
