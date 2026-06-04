import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanySettings } from '@/lib/company-settings'
import BackupButton from '@/features/verifactu/components/BackupButton'
import RegistrosVerifactuTable from '@/features/verifactu/components/RegistrosVerifactuTable'
import { getVerifactuEntorno } from '@/lib/verifactu/env'

export const metadata = {
  title: 'Veri*factu — Henkoaching',
}

export const dynamic = 'force-dynamic'

type TipoFiltro = 'todos' | 'alta' | 'anulacion'
type EstadoEnvio = 'pendiente' | 'enviado' | 'aceptado' | 'rechazado' | 'error'
type EstadoFiltro = 'todos' | EstadoEnvio


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

  const { data: registrosRaw } = await query
  const registros = (registrosRaw as RegistroLista[] | null) ?? []

  return (
    <div className="w-full">
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
      <section className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-roxborough text-xl text-gray-900 mb-1">Registros encadenados</h2>
            <p className="font-raleway text-xs text-gray-500">
              {registros.length} resultado{registros.length === 1 ? '' : 's'}
              {(tipoFiltro !== 'todos' || estadoFiltro !== 'todos' || q) && ' (filtrado)'}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <form method="GET" className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nº factura…"
              className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
            />
            <select name="tipo" defaultValue={tipoFiltro === 'todos' ? '' : tipoFiltro}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise">
              <option value="">Todos los tipos</option>
              <option value="alta">Alta</option>
              <option value="anulacion">Anulación</option>
            </select>
            <select name="estado" defaultValue={estadoFiltro === 'todos' ? '' : estadoFiltro}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="enviado">Enviado</option>
              <option value="aceptado">Aceptado</option>
              <option value="rechazado">Rechazado</option>
              <option value="error">Error</option>
            </select>
            <button type="submit"
              className="px-5 py-2.5 rounded-full bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-all">
              Filtrar
            </button>
            {(tipoFiltro !== 'todos' || estadoFiltro !== 'todos' || q) && (
              <a href="/dashboard/verifactu" className="font-raleway text-xs text-gray-400 hover:text-henko-turquoise transition-colors">
                Limpiar
              </a>
            )}
          </div>
        </form>

        <RegistrosVerifactuTable registros={registros} />
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
