'use client'

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import { useSortable } from '@/shared/hooks/useSortable'
import { useUrlState } from '@/shared/hooks/useUrlState'
import SortHeader from '@/shared/components/SortHeader'
import { actualizarFacturaNoFiscal, cambiarEstadoFactura, eliminarFactura, getFacturaPdfUrl, getVerifactuXml } from '@/actions/facturas'
import { ESTADOS_FACTURA, getEstadoMeta, isVencida, type EstadoFactura } from './estados'
import NuevaFacturaModal from './NuevaFacturaModal'
import FacturaDrawer from './FacturaDrawer'
import type { FacturaRow, ClienteOption } from '@/app/(main)/dashboard/facturas/page'

type Props = {
  facturas: FacturaRow[]
  clientes: ClienteOption[]
  serieDefault: string
  emisorListo: boolean
}

type Tab = EstadoFactura | 'todas'
type TipoRectificacion = 'rectificativa' | 'abono'
type FormaPago = 'transferencia' | 'efectivo' | 'bizum' | 'tarjeta' | 'domiciliacion'

const TABS: Array<{ value: Tab; label: string; dot?: string }> = [
  { value: 'todas', label: 'Todas' },
  ...ESTADOS_FACTURA.map((e) => ({ value: e.value, label: e.label, dot: e.dot })),
]

export default function FacturasView({ facturas, clientes, serieDefault, emisorListo }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()

  const [tab, setTab] = useUrlState<Tab>('estado', 'todas', TABS.map(t => t.value))
  const [busqueda, setBusqueda] = useUrlState<string>('q', '')
  const [showNew, setShowNew] = useState(false)
  const [rectificarDe, setRectificarDe] = useState<{ id: string; tipo: TipoRectificacion } | null>(null)
  const [drawerId, setDrawerId] = useState<string | null>(null)

  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      activeTabRef.current.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    }
  }, [tab])

  // Calcular estado dinámico (marcar vencidas en vuelo)
  const conEstadoCalculado = useMemo(
    () =>
      facturas.map((f) => ({
        ...f,
        estado_calc: isVencida(f.fecha_vencimiento, f.estado) ? ('vencida' as EstadoFactura) : f.estado,
      })),
    [facturas],
  )

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { todas: 0, pendiente: 0, pagada: 0, vencida: 0, devuelta: 0, anulada: 0 }
    for (const f of conEstadoCalculado) {
      c.todas++
      c[f.estado_calc]++
    }
    return c
  }, [conEstadoCalculado])

  const filtered = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return conEstadoCalculado.filter((f) => {
      if (tab !== 'todas' && f.estado_calc !== tab) return false
      if (q) {
        const hay = `${f.numero} ${f.cliente_nombre} ${f.cliente_nif ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [conEstadoCalculado, tab, busqueda])

  type FacturaCalc = (typeof filtered)[0]
  const { sorted, sortKey, sortDir, toggleSort } = useSortable<FacturaCalc>(filtered, 'fecha_emision', 'desc')
  const pagination = usePagination(sorted, 20)

  // Facturas que pueden ser rectificadas/abonadas: no sean ya rectificativas/abonos ni anuladas
  const facturasRectificables = useMemo(
    () =>
      facturas
        .filter((f) => !f.numero.startsWith('R') && !f.numero.startsWith('A') && f.estado !== 'anulada')
        .map((f) => ({
          id: f.id,
          numero: f.numero,
          cliente_id: f.cliente_id,
          cliente_nombre: f.cliente_nombre,
          total: f.total,
          fecha_emision: f.fecha_emision,
          estado: f.estado,
        })),
    [facturas],
  )

  // Totales del filtro actual
  const totales = useMemo(() => {
    return filtered.reduce(
      (acc, f) => {
        acc.base += Number(f.base_imponible)
        acc.total += Number(f.total)
        return acc
      },
      { base: 0, total: 0 },
    )
  }, [filtered])

  const drawerFactura = useMemo(() => conEstadoCalculado.find((f) => f.id === drawerId) ?? null, [conEstadoCalculado, drawerId])

  async function cambiarEstado(id: string, estado: EstadoFactura, extras?: Parameters<typeof cambiarEstadoFactura>[2]) {
    const r = await runAction('Actualizando factura', () => cambiarEstadoFactura(id, estado, extras), {
      successMessage: 'Factura actualizada',
    })
    if (r.ok) router.refresh()
  }

  async function descargarPdf(id: string) {
    const r = await runAction('Generando PDF', () => getFacturaPdfUrl(id), { silentSuccess: true })
    if (r.ok && r.data && 'url' in r.data && r.data.url) {
      window.open(r.data.url, '_blank')
    }
  }

  async function descargarXmlVerifactu(id: string) {
    const r = await runAction('Generando XML Verifactu', () => getVerifactuXml(id), { silentSuccess: true })
    if (!r.ok || !r.data || !('alta' in r.data)) return
    const { numero, alta, anulacion } = r.data
    if (!alta) return
    const safeName = numero.replace(/[^\w\-]/g, '_')
    descargarBlob(alta, `verifactu-${safeName}-alta.xml`)
    if (anulacion) descargarBlob(anulacion, `verifactu-${safeName}-anulacion.xml`)
  }

  function descargarBlob(contenido: string, nombre: string) {
    const blob = new Blob([contenido], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombre
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function actualizarNoFiscal(
    id: string,
    input: { notas: string | null; fecha_vencimiento: string | null; forma_pago: FormaPago | null },
  ) {
    const r = await runAction('Guardando cambios', () => actualizarFacturaNoFiscal(id, input), {
      successMessage: 'Factura actualizada',
    })
    if (r.ok) router.refresh()
  }

  async function eliminar(id: string, numero: string) {
    const ok = await confirm({
      title: 'Eliminar factura',
      description: `¿Eliminar definitivamente la factura ${numero}? Solo se permite si está anulada.`,
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    const r = await runAction('Eliminando factura', () => eliminarFactura(id), { successMessage: 'Factura eliminada' })
    if (r.ok) {
      setDrawerId(null)
      router.refresh()
    }
  }

  return (
    <>
      {!emisorListo && (
        <div className="mb-6 bg-henko-yellow/30 border border-henko-yellow rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3">
          <span className="font-raleway text-sm text-gray-800">
            <strong>Antes de emitir facturas:</strong> completa los datos del emisor (nombre y NIF como mínimo).
          </span>
          <Link
            href="/dashboard/ajustes"
            className="ml-auto px-4 py-1.5 rounded-xl bg-henko-turquoise text-white text-sm font-raleway font-semibold hover:bg-henko-turquoise-light"
          >
            Ir a ajustes
          </Link>
        </div>
      )}

      {/* Móvil: botón crear arriba */}
      <div className="md:hidden mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setShowNew(true)}
          disabled={!emisorListo}
          className="px-4 py-2 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors disabled:opacity-40"
        >
          + Nueva factura
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-end justify-between gap-4 mb-6 border-b border-gray-200">
        <div
          ref={tabsRef}
          className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0 scroll-smooth"
          style={{ scrollSnapType: 'x proximity', WebkitOverflowScrolling: 'touch' }}
        >
          {TABS.map((t) => (
            <TabButton
              key={t.value}
              ref={tab === t.value ? activeTabRef : undefined}
              active={tab === t.value}
              onClick={() => setTab(t.value)}
              label={t.label}
              count={counts[t.value]}
              dotColor={t.dot}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          disabled={!emisorListo}
          className="hidden md:inline-flex mb-2 flex-shrink-0 px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors disabled:opacity-40 whitespace-nowrap"
        >
          + Nueva factura
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Buscar por número, cliente o NIF…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="sm:col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
          />
          <div className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm text-gray-600 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{filtered.length} fact.</span>
            <span className="font-bold text-henko-turquoise">{moneyES(totales.total)}</span>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Header desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 border-b border-gray-100 bg-gray-50 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">
            <div className="col-span-2"><SortHeader label="Nº" sortKey="numero" activeSortKey={sortKey as string} sortDir={sortDir} onSort={k => toggleSort(k as keyof FacturaCalc)} /></div>
            <div className="col-span-3"><SortHeader label="Cliente" sortKey="cliente_nombre" activeSortKey={sortKey as string} sortDir={sortDir} onSort={k => toggleSort(k as keyof FacturaCalc)} /></div>
            <div className="col-span-2"><SortHeader label="Estado" sortKey="estado" activeSortKey={sortKey as string} sortDir={sortDir} onSort={k => toggleSort(k as keyof FacturaCalc)} /></div>
            <div className="col-span-2"><SortHeader label="Emisión" sortKey="fecha_emision" activeSortKey={sortKey as string} sortDir={sortDir} onSort={k => toggleSort(k as keyof FacturaCalc)} /></div>
            <div className="col-span-2 flex justify-end"><SortHeader label="Total" sortKey="total" activeSortKey={sortKey as string} sortDir={sortDir} onSort={k => toggleSort(k as keyof FacturaCalc)} /></div>
            <span className="col-span-1" />
          </div>

          {pagination.paginated.map((f) => {
            const estado = getEstadoMeta(f.estado_calc)
            const emisionTxt = f.fecha_emision
              ? new Date(f.fecha_emision).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
              : '-'

            return (
              <div key={f.id} className="border-b border-gray-100 last:border-0">
                {/* Fila desktop */}
                <div
                  className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setDrawerId(f.id)}
                >
                  <span className="col-span-2 font-raleway font-bold text-gray-900 font-mono flex items-center gap-1.5">
                    {f.numero}
                    {f.factura_rectificada_id && (
                      f.numero.startsWith('A')
                        ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-200" title="Abono">A</span>
                        : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-henko-orange border border-orange-200" title="Rectificativa">R</span>
                    )}
                  </span>
                  <span className="col-span-3 font-raleway text-gray-700 truncate">
                    {f.cliente_nombre}
                    {f.cliente_nif && (
                      <span className="block text-xs text-gray-400 truncate">{f.cliente_nif}</span>
                    )}
                  </span>
                  <span className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold ${estado.bg} ${estado.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                      {estado.label}
                    </span>
                  </span>
                  <span className="col-span-2 font-raleway text-xs text-gray-500">{emisionTxt}</span>
                  <span className="col-span-2 font-raleway font-bold text-gray-900 text-right">
                    {moneyES(Number(f.total))}
                  </span>
                  <span className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); descargarPdf(f.id) }}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-henko-turquoise transition-colors"
                      title="Descargar PDF"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </span>
                </div>

                {/* Tarjeta móvil */}
                <div
                  className="md:hidden px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setDrawerId(f.id)}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="font-raleway font-bold text-gray-900 font-mono">{f.numero}</p>
                    <p className="font-raleway font-bold text-gray-900">{moneyES(Number(f.total))}</p>
                  </div>
                  <p className="font-raleway text-sm text-gray-600 truncate mb-2">{f.cliente_nombre}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-raleway font-semibold ${estado.bg} ${estado.color}`}>
                      <span className={`w-1 h-1 rounded-full ${estado.dot}`} />
                      {estado.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-raleway">{emisionTxt}</span>
                  </div>
                </div>
              </div>
            )
          })}

          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            totalPages={pagination.totalPages}
            from={pagination.from}
            to={pagination.to}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </div>
      )}

      {/* Modal nueva factura */}
      {showNew && (
        <NuevaFacturaModal
          clientes={clientes}
          facturasRectificables={facturasRectificables}
          serieDefault={serieDefault}
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false)
            router.refresh()
          }}
        />
      )}

      {/* Modal rectificativa / abono (precargado desde una factura) */}
      {rectificarDe && (
        <NuevaFacturaModal
          clientes={clientes}
          facturasRectificables={facturasRectificables}
          serieDefault={serieDefault}
          rectificarFacturaId={rectificarDe.id}
          tipoRectificacionDefault={rectificarDe.tipo}
          onClose={() => setRectificarDe(null)}
          onCreated={() => {
            setRectificarDe(null)
            router.refresh()
          }}
        />
      )}

      {/* Drawer detalle */}
      {drawerFactura && (
        <FacturaDrawer
          factura={drawerFactura}
          facturaRectificadaNumero={
            drawerFactura.factura_rectificada_id
              ? facturas.find((f) => f.id === drawerFactura.factura_rectificada_id)?.numero ?? null
              : null
          }
          puedeRectificarse={facturasRectificables.some((f) => f.id === drawerFactura.id)}
          onClose={() => setDrawerId(null)}
          onCambiarEstado={(estado, extras) => cambiarEstado(drawerFactura.id, estado, extras)}
          onDescargar={() => descargarPdf(drawerFactura.id)}
          onDescargarXml={() => descargarXmlVerifactu(drawerFactura.id)}
          onRectificar={(tipo) => {
            setDrawerId(null)
            setRectificarDe({ id: drawerFactura.id, tipo })
          }}
          onActualizarNoFiscal={(input) => actualizarNoFiscal(drawerFactura.id, input)}
          onEliminar={() => eliminar(drawerFactura.id, drawerFactura.numero)}
        />
      )}
    </>
  )
}

function moneyES(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' €'
}

function EmptyState() {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 md:px-8 py-16 md:py-20 text-center">
      <div className="w-16 h-16 bg-henko-greenblue/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="font-roxborough text-xl text-gray-400 mb-2">Sin facturas en esta vista</p>
      <p className="font-raleway text-gray-400 text-sm font-light">Crea una nueva factura o cambia los filtros.</p>
    </div>
  )
}

type TabButtonProps = {
  active: boolean
  onClick: () => void
  label: string
  count: number
  dotColor?: string
}

const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(function TabButton(
  { active, onClick, label, count, dotColor },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      style={{ scrollSnapAlign: 'start' }}
      className={`relative px-3 md:px-4 py-3 font-raleway text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
        active ? 'text-henko-turquoise' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {label}
      <span className={`text-xs font-normal px-1.5 py-0.5 rounded-full ${active ? 'bg-henko-turquoise/10 text-henko-turquoise' : 'bg-gray-100 text-gray-400'}`}>
        {count}
      </span>
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-henko-turquoise rounded-full" />}
    </button>
  )
})
