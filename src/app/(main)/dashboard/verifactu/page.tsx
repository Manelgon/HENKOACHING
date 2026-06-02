import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanySettings } from '@/lib/company-settings'
import RegistroAcciones from '@/features/verifactu/components/RegistroAcciones'
import BackupButton from '@/features/verifactu/components/BackupButton'
import { getVerifactuEntorno } from '@/lib/verifactu/env'

export const metadata = {
  title: 'Veri*factu — Henkoaching',
}

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

type TipoFiltro = 'todos' | 'alta' | 'anulacion'
type EstadoEnvio = 'pendiente' | 'enviado' | 'aceptado' | 'rechazado' | 'error'
type EstadoFiltro = 'todos' | EstadoEnvio

const ESTADO_LABEL: Record<EstadoEnvio, { texto: string; clase: string }> = {
  pendiente:  { texto: 'Pendiente', clase: 'bg-gray-100 text-gray-700' },
  enviado:    { texto: 'Enviado',   clase: 'bg-blue-50 text-blue-700' },
  aceptado:   { texto: 'Aceptado',  clase: 'bg-emerald-50 text-emerald-700' },
  rechazado:  { texto: 'Rechazado', clase: 'bg-red-50 text-red-700' },
  error:      { texto: 'Error',     clase: 'bg-orange-50 text-orange-700' },
}

type RegistroLista = {
  id: string
  num_registro: number
  tipo: 'alta' | 'anulacion'
  numero_factura: string
  fecha_hora_generacion: string
  huella: string
  estado_envio: EstadoEnvio
  ultimo_error: string | null
}

export default async function VerifactuPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; estado?: string; q?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const sp = await searchParams
  const tipoFiltro: TipoFiltro =
    sp.tipo === 'alta' || sp.tipo === 'anulacion' ? sp.tipo : 'todos'
  const estadoFiltro: EstadoFiltro =
    sp.estado === 'pendiente' || sp.estado === 'enviado' || sp.estado === 'aceptado' ||
    sp.estado === 'rechazado' || sp.estado === 'error' ? sp.estado : 'todos'
  const q = (sp.q ?? '').trim()
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)

  const settings = await getCompanySettings()
  const admin = createAdminClient()
  const entorno = getVerifactuEntorno()

  // Estado de la cadena (sin filtros)
  const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const [{ count: totalRegistros }, { data: ultimoRow }, { count: estancadosCount }] = await Promise.all([
    admin.from('verifactu_registros' as never).select('*', { count: 'exact', head: true }),
    admin
      .from('verifactu_registros' as never)
      .select('huella, fecha_hora_generacion, num_registro, tipo, numero_factura')
      .order('num_registro', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('verifactu_registros' as never)
      .select('*', { count: 'exact', head: true })
      .in('estado_envio', ['pendiente', 'error'])
      .lt('fecha_hora_generacion', hace24h),
  ])

  const ultimo = ultimoRow as {
    huella: string
    fecha_hora_generacion: string
    num_registro: number
    tipo: 'alta' | 'anulacion'
    numero_factura: string
  } | null

  // Query con filtros
  let query = admin
    .from('verifactu_registros' as never)
    .select('id, num_registro, tipo, numero_factura, fecha_hora_generacion, huella, estado_envio, ultimo_error', {
      count: 'exact',
    })
    .order('num_registro', { ascending: false })

  if (tipoFiltro !== 'todos') query = query.eq('tipo', tipoFiltro)
  if (estadoFiltro !== 'todos') query = query.eq('estado_envio', estadoFiltro)
  if (q) query = query.ilike('numero_factura', `%${q}%`)

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { data: registrosRaw, count: registrosCount } = await query.range(from, to)
  const registros = (registrosRaw as RegistroLista[] | null) ?? []
  const totalPaginas = Math.max(1, Math.ceil((registrosCount ?? 0) / PAGE_SIZE))

  function urlConFiltros(overrides: Partial<{ tipo: string; estado: string; q: string; page: number }>) {
    const params = new URLSearchParams()
    const tipo = overrides.tipo ?? (tipoFiltro !== 'todos' ? tipoFiltro : '')
    const estado = overrides.estado ?? (estadoFiltro !== 'todos' ? estadoFiltro : '')
    const qVal = overrides.q ?? q
    const pageVal = overrides.page ?? page
    if (tipo) params.set('tipo', tipo)
    if (estado) params.set('estado', estado)
    if (qVal) params.set('q', qVal)
    if (pageVal && pageVal > 1) params.set('page', String(pageVal))
    const qs = params.toString()
    return qs ? `/dashboard/verifactu?${qs}` : '/dashboard/verifactu'
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Veri*factu</h1>
        <p className="font-raleway text-gray-500 font-light">
          Sistema informático de facturación verificable conforme al RD 1007/2023.
        </p>
      </div>

      {/* Alerta: registros estancados >24h sin enviar a AEAT */}
      {(estancadosCount ?? 0) > 0 && (
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-raleway text-sm font-semibold text-orange-800">
              {estancadosCount} {estancadosCount === 1 ? 'registro lleva' : 'registros llevan'} más de 24 h sin enviarse a la AEAT.
            </p>
            <p className="font-raleway text-xs text-orange-700 mt-1 leading-relaxed">
              Esto es normal mientras no esté activo el envío automático Veri*factu (requiere certificado FNMT).
              Filtra por estado <strong>pendiente</strong> o <strong>error</strong> en la tabla inferior para revisarlos.
            </p>
          </div>
        </div>
      )}

      {/* Estado de la cadena */}
      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-roxborough text-xl text-gray-900">Estado de la cadena</h2>
          <BackupButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Registros emitidos" value={String(totalRegistros ?? 0)} />
          <Stat
            label="Último registro"
            value={ultimo ? `Nº ${ultimo.num_registro}` : '—'}
            sub={ultimo ? `${ultimo.tipo === 'anulacion' ? 'Anulación' : 'Alta'} · ${ultimo.numero_factura}` : 'Sin registros todavía'}
          />
          <Stat
            label="Envío AEAT"
            value={entorno === 'prod' ? 'Producción' : 'Preproducción'}
            sub={entorno === 'prod'
              ? 'Endpoint real de la AEAT'
              : 'Sandbox · sin efectos fiscales'}
            tone={entorno === 'prod' ? undefined : 'muted'}
          />
        </div>

        {ultimo && (
          <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Última huella SHA-256
            </p>
            <p className="font-mono text-[11px] text-gray-700 break-all">{ultimo.huella}</p>
          </div>
        )}
      </section>

      {/* Lista de registros */}
      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
          <div>
            <h2 className="font-roxborough text-xl text-gray-900 mb-1">Registros encadenados</h2>
            <p className="font-raleway text-xs text-gray-500">
              {registrosCount ?? 0} resultado{(registrosCount ?? 0) === 1 ? '' : 's'}
              {(tipoFiltro !== 'todos' || estadoFiltro !== 'todos' || q) && ' (filtrado)'}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <form method="GET" className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 mb-5">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nº factura…"
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise"
          />
          <select
            name="tipo"
            defaultValue={tipoFiltro === 'todos' ? '' : tipoFiltro}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise"
          >
            <option value="">Todos los tipos</option>
            <option value="alta">Alta</option>
            <option value="anulacion">Anulación</option>
          </select>
          <select
            name="estado"
            defaultValue={estadoFiltro === 'todos' ? '' : estadoFiltro}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="enviado">Enviado</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
            <option value="error">Error</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light"
          >
            Filtrar
          </button>
        </form>

        {registros.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center">
            <p className="font-raleway text-sm text-gray-500">
              No hay registros que coincidan con los filtros.
            </p>
            {(tipoFiltro !== 'todos' || estadoFiltro !== 'todos' || q) && (
              <Link
                href="/dashboard/verifactu"
                className="inline-block mt-3 font-raleway text-xs text-henko-turquoise hover:underline"
              >
                Limpiar filtros
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full font-raleway text-sm">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="px-2 py-2 w-16">Nº</th>
                  <th className="px-2 py-2">Fecha / hora</th>
                  <th className="px-2 py-2">Tipo</th>
                  <th className="px-2 py-2">Factura</th>
                  <th className="px-2 py-2">Huella</th>
                  <th className="px-2 py-2">Envío AEAT</th>
                  <th className="px-2 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => {
                  const estadoMeta = ESTADO_LABEL[r.estado_envio]
                  const fecha = new Date(r.fecha_hora_generacion).toLocaleString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })
                  return (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-henko-cream/30">
                      <td className="px-2 py-3 font-mono text-gray-700">{r.num_registro}</td>
                      <td className="px-2 py-3 text-gray-600 whitespace-nowrap">{fecha}</td>
                      <td className="px-2 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.tipo === 'anulacion' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {r.tipo === 'anulacion' ? 'Anulación' : 'Alta'}
                        </span>
                      </td>
                      <td className="px-2 py-3 font-mono text-gray-700 text-xs">{r.numero_factura}</td>
                      <td className="px-2 py-3 font-mono text-[10px] text-gray-500" title={r.huella}>
                        {r.huella.slice(0, 12)}…
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${estadoMeta.clase}`} title={r.ultimo_error ?? undefined}>
                          {estadoMeta.texto}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <RegistroAcciones
                          registroId={r.id}
                          numeroFactura={r.numero_factura}
                          estadoEnvio={r.estado_envio}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <p className="font-raleway text-xs text-gray-500">
              Página {page} de {totalPaginas}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={urlConFiltros({ page: page - 1 })}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-raleway text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  ← Anterior
                </Link>
              )}
              {page < totalPaginas && (
                <Link
                  href={urlConFiltros({ page: page + 1 })}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-raleway text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Siguiente →
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

    </div>
  )
}


function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'muted' }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${tone === 'muted' ? 'bg-gray-50 border-gray-100' : 'bg-henko-cream/50 border-henko-greenblue/30'}`}>
      <p className="font-raleway text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className={`font-roxborough text-2xl ${tone === 'muted' ? 'text-gray-500' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="font-raleway text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}
