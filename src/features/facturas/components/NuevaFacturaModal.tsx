'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearFactura, editarFactura, obtenerFactura, type FacturaInput, type LineaInput } from '@/actions/facturas'
import { FORMAS_PAGO } from './estados'
import type { ClienteOption, FacturaRow } from '@/app/(main)/dashboard/facturas/page'

export type FacturaRectificableOption = Pick<FacturaRow, 'id' | 'numero' | 'cliente_nombre' | 'total' | 'fecha_emision' | 'estado'>

type Props = {
  clientes: ClienteOption[]
  facturasRectificables: FacturaRectificableOption[]
  serieDefault: string
  modo?: 'crear' | 'editar'
  facturaId?: string
  onClose: () => void
  onCreated: () => void
}

type FormaPago = 'transferencia' | 'efectivo' | 'bizum' | 'tarjeta' | 'domiciliacion'

// Valores precargados estándar en España. Todos editables en el formulario.
const DEFAULTS = {
  iva: 21,
  irpf: 0,
  formaPago: 'transferencia' as FormaPago,
  diasVencimiento: 30,
}

function diasDespues(iso: string, dias: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

export default function NuevaFacturaModal({ clientes, facturasRectificables, serieDefault, modo = 'crear', facturaId, onClose, onCreated }: Props) {
  const runAction = useAction()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(modo === 'editar')

  const hoy = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [clienteId, setClienteId] = useState<string>('')
  const [serie, setSerie] = useState<string>(serieDefault)
  const [fechaEmision, setFechaEmision] = useState(hoy)
  const [fechaVencimiento, setFechaVencimiento] = useState<string>(diasDespues(hoy, DEFAULTS.diasVencimiento))
  const [ivaPct, setIvaPct] = useState<number>(DEFAULTS.iva)
  const [irpfPct, setIrpfPct] = useState<number>(DEFAULTS.irpf)
  const [formaPago, setFormaPago] = useState<FormaPago>(DEFAULTS.formaPago)
  const [notas, setNotas] = useState<string>('')

  // Tipo de factura
  type TipoFactura = 'factura' | 'rectificativa' | 'abono'
  const [tipoFactura, setTipoFactura] = useState<TipoFactura>('factura')
  const [facturaRectificadaId, setFacturaRectificadaId] = useState<string>('')
  const [motivoRectificacion, setMotivoRectificacion] = useState<string>('')

  const esRectificativa = tipoFactura !== 'factura'
  const [lineas, setLineas] = useState<LineaInput[]>([
    { concepto: '', cantidad: 1, precio_unitario: 0, descuento_porcentaje: 0 },
  ])

  // En modo editar, cargar los datos
  useEffect(() => {
    if (modo !== 'editar' || !facturaId) return
    let cancelled = false
    ;(async () => {
      const r = await obtenerFactura(facturaId)
      if (cancelled || !('ok' in r) || !r.ok) {
        setLoading(false)
        return
      }
      const f = r.factura as {
        cliente_id: string | null
        serie: string
        fecha_emision: string
        fecha_vencimiento: string | null
        iva_porcentaje: number
        irpf_porcentaje: number
        forma_pago: FormaPago | null
        notas: string | null
        factura_rectificada_id: string | null
        motivo_rectificacion: string | null
      }
      setClienteId(f.cliente_id ?? '')
      setSerie(f.serie ?? serieDefault)
      setFechaEmision(f.fecha_emision)
      setFechaVencimiento(f.fecha_vencimiento ?? '')
      setIvaPct(Number(f.iva_porcentaje))
      setIrpfPct(Number(f.irpf_porcentaje))
      setFormaPago((f.forma_pago as FormaPago) ?? 'transferencia')
      setNotas(f.notas ?? '')
      if (f.factura_rectificada_id) {
        setTipoFactura(f.serie === 'A' ? 'abono' : 'rectificativa')
      } else {
        setTipoFactura('factura')
      }
      setFacturaRectificadaId(f.factura_rectificada_id ?? '')
      setMotivoRectificacion(f.motivo_rectificacion ?? '')
      const lineasArr = r.lineas as Array<{ concepto: string; cantidad: number; precio_unitario: number; descuento_porcentaje: number }>
      setLineas(
        lineasArr.map((l) => ({
          concepto: l.concepto,
          cantidad: Number(l.cantidad),
          precio_unitario: Number(l.precio_unitario),
          descuento_porcentaje: Number(l.descuento_porcentaje),
        })),
      )
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [modo, facturaId])

  function cambiarTipo(nuevo: TipoFactura) {
    setTipoFactura(nuevo)
    if (nuevo === 'rectificativa') setSerie('R')
    else if (nuevo === 'abono') setSerie('A')
    else {
      setSerie(serieDefault)
      setFacturaRectificadaId('')
      setMotivoRectificacion('')
    }
  }

  function onSelectFacturaRectificada(id: string) {
    setFacturaRectificadaId(id)
    // Auto-rellenar cliente con el de la factura original
    const original = facturasRectificables.find((f) => f.id === id)
    if (original) {
      const clienteOriginal = clientes.find((c) => (c.empresa || c.nombre) === original.cliente_nombre)
      if (clienteOriginal) setClienteId(clienteOriginal.id)
    }
  }

  function recalcularVencimiento(nuevaEmision: string) {
    setFechaEmision(nuevaEmision)
    if (!fechaVencimiento || fechaVencimiento === diasDespues(fechaEmision, DEFAULTS.diasVencimiento)) {
      setFechaVencimiento(diasDespues(nuevaEmision, DEFAULTS.diasVencimiento))
    }
  }

  // Cálculos en vivo
  const totales = useMemo(() => {
    const subtotales = lineas.map((l) => {
      const bruto = (Number(l.cantidad) || 0) * (Number(l.precio_unitario) || 0)
      const dto = bruto * ((Number(l.descuento_porcentaje) || 0) / 100)
      return +(bruto - dto).toFixed(2)
    })
    const base = +subtotales.reduce((a, b) => a + b, 0).toFixed(2)
    const iva = +(base * (ivaPct / 100)).toFixed(2)
    const irpf = +(base * (irpfPct / 100)).toFixed(2)
    const total = +(base + iva - irpf).toFixed(2)
    return { subtotales, base, iva, irpf, total }
  }, [lineas, ivaPct, irpfPct])

  function addLinea() {
    setLineas((prev) => [...prev, { concepto: '', cantidad: 1, precio_unitario: 0, descuento_porcentaje: 0 }])
  }
  function removeLinea(idx: number) {
    setLineas((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)))
  }
  function updateLinea(idx: number, patch: Partial<LineaInput>) {
    setLineas((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clienteId) return
    setSaving(true)

    if (esRectificativa && !facturaRectificadaId) {
      // Esto se valida visualmente con required pero por si acaso
      return
    }

    const input: FacturaInput = {
      cliente_id: clienteId,
      serie: serie.trim() || serieDefault,
      fecha_emision: fechaEmision,
      fecha_vencimiento: fechaVencimiento || null,
      iva_porcentaje: ivaPct,
      irpf_porcentaje: irpfPct,
      forma_pago: formaPago,
      notas: notas.trim() || null,
      lineas: lineas.map((l) => ({
        concepto: l.concepto.trim(),
        cantidad: Number(l.cantidad) || 0,
        precio_unitario: Number(l.precio_unitario) || 0,
        descuento_porcentaje: Number(l.descuento_porcentaje) || 0,
      })),
      factura_rectificada_id: esRectificativa ? facturaRectificadaId : null,
      motivo_rectificacion: esRectificativa ? (motivoRectificacion.trim() || null) : null,
    }

    const r = await runAction(
      modo === 'editar' ? 'Guardando factura' : 'Creando factura',
      () => (modo === 'editar' && facturaId ? editarFactura(facturaId, input) : crearFactura(input)),
      { successMessage: modo === 'editar' ? 'Factura actualizada' : 'Factura creada' },
    )

    setSaving(false)
    if (r.ok) onCreated()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[95dvh] flex flex-col">
        <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-roxborough text-xl text-gray-900">
            {modo === 'editar' ? 'Editar factura' : 'Nueva factura'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <span className="font-raleway text-gray-400">Cargando factura…</span>
          </div>
        ) : (
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {/* Cliente */}
          <Field label="Cliente" required>
            <select
              required
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="modal-input"
            >
              <option value="">Selecciona un cliente…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.empresa || c.nombre}{c.nif_cif ? ` — ${c.nif_cif}` : ''}
                </option>
              ))}
            </select>
            {clientes.length === 0 && (
              <p className="text-xs text-red-500 mt-1 font-raleway">No hay clientes. Crea uno primero en Clientes.</p>
            )}
          </Field>

          {/* Tipo de factura */}
          <div>
            <p className="font-raleway text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tipo de documento</p>
            <div className="grid grid-cols-3 gap-2">
              <TipoButton
                active={tipoFactura === 'factura'}
                disabled={modo === 'editar'}
                onClick={() => cambiarTipo('factura')}
                serie="F"
                label="Factura"
                hint="Venta normal"
                color="turquoise"
              />
              <TipoButton
                active={tipoFactura === 'rectificativa'}
                disabled={modo === 'editar'}
                onClick={() => cambiarTipo('rectificativa')}
                serie="R"
                label="Rectificativa"
                hint="Corrige errores"
                color="orange"
              />
              <TipoButton
                active={tipoFactura === 'abono'}
                disabled={modo === 'editar'}
                onClick={() => cambiarTipo('abono')}
                serie="A"
                label="Abono"
                hint="Devuelve dinero"
                color="coral"
              />
            </div>
            {modo === 'editar' && esRectificativa && (
              <p className="font-raleway text-xs text-gray-500 mt-2">El tipo no se puede cambiar en una factura ya emitida.</p>
            )}
          </div>

          {/* Datos de la rectificación / abono */}
          {esRectificativa && (
            <div className={`rounded-2xl border p-4 space-y-3 ${tipoFactura === 'abono' ? 'border-red-200 bg-red-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
              <Field label={tipoFactura === 'abono' ? 'Factura a abonar' : 'Factura que rectifica'} required>
                <select
                  required={esRectificativa}
                  value={facturaRectificadaId}
                  onChange={(e) => onSelectFacturaRectificada(e.target.value)}
                  disabled={modo === 'editar'}
                  className="modal-input disabled:opacity-50"
                >
                  <option value="">Selecciona la factura original…</option>
                  {facturasRectificables
                    .filter((f) => f.id !== facturaId)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.numero} — {f.cliente_nombre} ({moneyES(Number(f.total))})
                      </option>
                    ))}
                </select>
                {facturasRectificables.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1 font-raleway">No hay facturas para {tipoFactura === 'abono' ? 'abonar' : 'rectificar'} todavía.</p>
                )}
              </Field>
              <Field label={tipoFactura === 'abono' ? 'Motivo del abono' : 'Motivo de la rectificación'}>
                <textarea
                  value={motivoRectificacion}
                  onChange={(e) => setMotivoRectificacion(e.target.value)}
                  rows={2}
                  placeholder={tipoFactura === 'abono'
                    ? 'Ej: Cancelación del servicio. Devolución del importe abonado.'
                    : 'Ej: Error en el NIF del cliente. Corregimos los datos fiscales.'}
                  className="modal-input"
                />
                <p className="text-xs text-gray-500 mt-1 font-raleway">Aparece impreso en el PDF. Suele exigirlo Hacienda.</p>
              </Field>
              <p className="text-xs text-gray-600 font-raleway bg-white border border-gray-200 rounded-lg p-2.5 leading-relaxed">
                {tipoFactura === 'abono' ? (
                  <>
                    <strong>Para abonar:</strong> introduce las líneas con cantidades <strong>negativas</strong> (importe a devolver).
                    El total saldrá negativo y la factura cuenta como devolución.
                  </>
                ) : (
                  <>
                    <strong>Para corregir importes:</strong> introduce las líneas tal y como deberían haber sido. <br />
                    <strong>Para anular completamente:</strong> usa mejor un Abono con cantidades negativas.
                  </>
                )}
              </p>
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3 md:max-w-md">
            <Field label="Fecha emisión" required>
              <input
                type="date"
                required
                value={fechaEmision}
                onChange={(e) => recalcularVencimiento(e.target.value)}
                className="modal-input"
              />
            </Field>
            <Field label="Vencimiento">
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="modal-input"
              />
            </Field>
          </div>

          {/* Líneas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-raleway text-xs font-bold text-gray-500 uppercase tracking-widest">
                Conceptos
              </span>
              <button
                type="button"
                onClick={addLinea}
                className="text-xs font-raleway font-semibold text-henko-turquoise hover:text-henko-turquoise-light"
              >
                + Añadir línea
              </button>
            </div>

            <div className="space-y-3">
              {lineas.map((l, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 sm:col-span-5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-raleway">Concepto</label>
                      <input
                        type="text"
                        required
                        value={l.concepto}
                        onChange={(e) => updateLinea(idx, { concepto: e.target.value })}
                        placeholder="Sesión de coaching ejecutivo"
                        className="modal-input"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-raleway">Cant.</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={l.cantidad}
                        onChange={(e) => updateLinea(idx, { cantidad: Number(e.target.value) })}
                        className="modal-input"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-raleway">Precio</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={l.precio_unitario}
                        onChange={(e) => updateLinea(idx, { precio_unitario: Number(e.target.value) })}
                        className="modal-input"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-raleway">Dto.%</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={l.descuento_porcentaje}
                        onChange={(e) => updateLinea(idx, { descuento_porcentaje: Number(e.target.value) })}
                        className="modal-input"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2 text-right pb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-raleway">Subtotal</p>
                      <p className="font-raleway font-semibold text-gray-900 text-sm">
                        {moneyES(totales.subtotales[idx] ?? 0)}
                      </p>
                    </div>
                  </div>
                  {lineas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinea(idx)}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 font-raleway"
                    >
                      Quitar línea
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Impuestos y pago */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Field label="IVA (%)">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={ivaPct}
                onChange={(e) => setIvaPct(Number(e.target.value))}
                className="modal-input"
              />
            </Field>
            <Field label="IRPF (%)">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={irpfPct}
                onChange={(e) => setIrpfPct(Number(e.target.value))}
                className="modal-input"
              />
            </Field>
            <Field label="Forma de pago" wide>
              <select
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value as FormaPago)}
                className="modal-input"
              >
                {FORMAS_PAGO.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Notas */}
          <Field label="Notas (opcional)">
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Texto adicional que aparecerá en la factura"
              className="modal-input"
            />
          </Field>

          {/* Totales */}
          <div className="bg-henko-cream rounded-2xl p-5 border border-henko-greenblue/30">
            <div className="space-y-1.5 font-raleway text-sm">
              <Row label="Base imponible" value={moneyES(totales.base)} />
              <Row label={`IVA (${ivaPct}%)`} value={moneyES(totales.iva)} />
              {irpfPct > 0 && <Row label={`IRPF (-${irpfPct}%)`} value={'-' + moneyES(totales.irpf)} />}
              <div className="border-t border-henko-greenblue/30 pt-2 mt-2">
                <Row label="TOTAL" value={moneyES(totales.total)} bold />
              </div>
            </div>
          </div>
        </form>
        )}

        <div className="px-6 sm:px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-raleway font-semibold text-sm hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={onSubmit}
            disabled={saving || loading || !clienteId}
            className="px-6 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light disabled:opacity-40"
          >
            {saving ? 'Guardando…' : modo === 'editar' ? 'Guardar cambios' : 'Emitir factura'}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .modal-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgb(229, 231, 235);
          background: #fff;
          font-family: var(--font-raleway), Raleway, sans-serif;
          font-size: 0.875rem;
          color: rgb(17, 24, 39);
          outline: none;
          transition: border-color 0.15s;
        }
        .modal-input:focus { border-color: #1f8f9b; }
      `}</style>
    </div>
  )
}

function TipoButton({
  active,
  disabled,
  onClick,
  serie,
  label,
  hint,
  color,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  serie: string
  label: string
  hint: string
  color: 'turquoise' | 'orange' | 'coral'
}) {
  const palette = {
    turquoise: { border: 'border-henko-turquoise', bg: 'bg-henko-greenblue/20', text: 'text-henko-turquoise', badge: 'bg-henko-turquoise' },
    orange:    { border: 'border-henko-orange',    bg: 'bg-orange-50',          text: 'text-henko-orange',    badge: 'bg-henko-orange' },
    coral:     { border: 'border-henko-coral',     bg: 'bg-red-50',             text: 'text-henko-coral',     badge: 'bg-henko-coral' },
  }[color]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-2xl border-2 p-3 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        active
          ? `${palette.border} ${palette.bg}`
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold text-white ${active ? palette.badge : 'bg-gray-300'}`}>
          {serie}
        </span>
        <span className={`font-raleway font-semibold text-sm ${active ? palette.text : 'text-gray-700'}`}>{label}</span>
      </div>
      <p className="font-raleway text-[11px] text-gray-500 leading-tight">{hint}</p>
    </button>
  )
}

function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''}`}>
      <span className="font-raleway text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
        {label} {required && <span className="text-henko-coral">*</span>}
      </span>
      {children}
    </label>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold text-base text-gray-900' : 'text-gray-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function moneyES(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' €'
}
