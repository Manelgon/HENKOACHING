'use client'

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import { cambiarEstadoArticulo, eliminarArticulo } from '@/actions/blog'
import type { EstadoPost, BlogPostListItem } from '../types'
import { ESTADOS_BLOG, getEstadoMeta } from './estados'

type Tab = EstadoPost

type Filtros = {
  categoria: number | 'todas'
  busqueda: string
}

type Props = {
  posts: BlogPostListItem[]
  categorias: { id: number; slug: string; nombre: string }[]
}

export default function BlogTable({ posts, categorias }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()
  const [tab, setTab] = useState<Tab>('borrador')
  const [filtros, setFiltros] = useState<Filtros>({ categoria: 'todas', busqueda: '' })

  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      activeTabRef.current.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    }
  }, [tab])

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { borrador: 0, publicado: 0, archivado: 0 }
    for (const p of posts) c[p.estado]++
    return c
  }, [posts])

  const filtered = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase()
    return posts.filter((p) => {
      if (p.estado !== tab) return false
      if (filtros.categoria !== 'todas' && p.categoria?.id !== filtros.categoria) return false
      if (q) {
        const hay = `${p.titulo} ${p.extracto ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [posts, filtros, tab])

  const pagination = usePagination(filtered, 20)

  async function cambiarEstado(id: string, estado: EstadoPost) {
    const result = await runAction(
      'Actualizando artículo',
      () => cambiarEstadoArticulo(id, estado),
      {
        successMessage:
          estado === 'publicado' ? 'Artículo publicado' :
          estado === 'archivado' ? 'Artículo archivado' :
          'Artículo enviado a borrador',
      },
    )
    if (result.ok) router.refresh()
  }

  async function eliminar(id: string) {
    const ok = await confirm({
      title: 'Eliminar artículo',
      description: '¿Eliminar este artículo? Quedará archivado y oculto de la web.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    const result = await runAction(
      'Eliminando artículo',
      () => eliminarArticulo(id),
      { successMessage: 'Artículo eliminado' },
    )
    if (result.ok) router.refresh()
  }

  return (
    <>
      {/* Tabs por estado */}
      <div className="flex items-end justify-between gap-4 mb-6 border-b border-gray-200">
        <div
          ref={tabsContainerRef}
          className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0 scrollbar-thin scroll-smooth"
          style={{ scrollSnapType: 'x proximity', WebkitOverflowScrolling: 'touch' }}
        >
          {ESTADOS_BLOG.map((e) => (
            <TabButton
              key={e.value}
              ref={tab === e.value ? activeTabRef : undefined}
              active={tab === e.value}
              onClick={() => setTab(e.value)}
              label={e.label}
              count={counts[e.value]}
              dotColor={e.dot}
            />
          ))}
        </div>
      </div>

      {/* Toolbar: filtros */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Buscar por título o extracto…"
            value={filtros.busqueda}
            onChange={(e) => setFiltros((f) => ({ ...f, busqueda: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
          />
          <select
            value={filtros.categoria}
            onChange={(e) =>
              setFiltros((f) => ({
                ...f,
                categoria: e.target.value === 'todas' ? 'todas' : Number(e.target.value),
              }))
            }
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 md:px-8 py-16 md:py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h10M4 18h7" />
            </svg>
          </div>
          <p className="font-roxborough text-xl text-gray-400 mb-2">
            {posts.length === 0 ? 'Aún no hay artículos' : 'Ningún artículo coincide con los filtros'}
          </p>
          <p className="font-raleway text-gray-400 text-sm font-light">
            {posts.length === 0 ? 'Crea tu primer artículo y empieza tu blog.' : 'Prueba a quitar filtros.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 border-b border-gray-100 bg-gray-50">
            <span className="col-span-5 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Título</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
            <span className="col-span-1 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</span>
          </div>

          {pagination.paginated.map((p) => {
            const fecha = p.fecha_publicacion ?? p.updated_at ?? p.created_at
            const fechaCorta = fecha
              ? new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'
            const estado = getEstadoMeta(p.estado)

            return (
              <div key={p.id} className="border-b border-gray-100 last:border-0">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 items-center hover:bg-gray-50 transition-colors">
                  <Link href={`/dashboard/blog/${p.id}`} className="col-span-5 flex items-center gap-3 min-w-0">
                    {p.imagen_portada ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagen_portada} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-raleway font-semibold text-gray-900 truncate">{p.titulo}</p>
                      {p.tiempo_lectura ? (
                        <p className="font-raleway text-xs text-gray-400">{p.tiempo_lectura} min lectura · {p.vistas ?? 0} vistas</p>
                      ) : null}
                    </div>
                  </Link>
                  <span className="col-span-2 font-raleway text-xs text-gray-500 truncate">{p.categoria?.nombre ?? '—'}</span>
                  <span className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold ${estado.bg} ${estado.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                      {estado.label}
                    </span>
                  </span>
                  <span className="col-span-2 font-raleway text-xs text-gray-400">{fechaCorta}</span>
                  <span className="col-span-1 flex items-center justify-end gap-1">
                    <ActionButtons estado={p.estado} onPublish={() => cambiarEstado(p.id, 'publicado')} onDraft={() => cambiarEstado(p.id, 'borrador')} onArchive={() => cambiarEstado(p.id, 'archivado')} onDelete={() => eliminar(p.id)} />
                  </span>
                </div>

                {/* Móvil */}
                <div className="md:hidden px-4 py-4">
                  <Link href={`/dashboard/blog/${p.id}`} className="flex items-start gap-3 mb-3">
                    {p.imagen_portada ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagen_portada} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-raleway font-semibold text-gray-900 text-sm mb-0.5 line-clamp-2">{p.titulo}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-raleway font-semibold ${estado.bg} ${estado.color}`}>
                          <span className={`w-1 h-1 rounded-full ${estado.dot}`} />
                          {estado.label}
                        </span>
                        {p.categoria && <span className="text-[10px] text-gray-400 font-raleway">{p.categoria.nombre}</span>}
                        <span className="text-[10px] text-gray-400 font-raleway">{fechaCorta}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ActionButtons estado={p.estado} onPublish={() => cambiarEstado(p.id, 'publicado')} onDraft={() => cambiarEstado(p.id, 'borrador')} onArchive={() => cambiarEstado(p.id, 'archivado')} onDelete={() => eliminar(p.id)} compact />
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
    </>
  )
}

function ActionButtons({
  estado,
  onPublish,
  onDraft,
  onArchive,
  onDelete,
  compact,
}: {
  estado: EstadoPost
  onPublish: () => void
  onDraft: () => void
  onArchive: () => void
  onDelete: () => void
  compact?: boolean
}) {
  const cls = compact
    ? 'px-2.5 py-1 rounded-lg text-xs font-raleway font-semibold transition-colors'
    : 'px-2.5 py-1 rounded-lg text-xs font-raleway font-semibold transition-colors'

  if (estado === 'borrador') {
    return (
      <>
        <button onClick={onPublish} className={`${cls} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}>Publicar</button>
        <button onClick={onDelete} className={`${cls} bg-red-50 text-red-500 hover:bg-red-100`}>Eliminar</button>
      </>
    )
  }
  if (estado === 'publicado') {
    return (
      <>
        <button onClick={onDraft} className={`${cls} bg-amber-50 text-amber-700 hover:bg-amber-100`}>Despublicar</button>
        <button onClick={onArchive} className={`${cls} bg-gray-100 text-gray-600 hover:bg-gray-200`}>Archivar</button>
      </>
    )
  }
  return (
    <>
      <button onClick={onDraft} className={`${cls} bg-henko-turquoise/10 text-henko-turquoise hover:bg-henko-turquoise/20`}>Recuperar</button>
      <button onClick={onDelete} className={`${cls} bg-red-50 text-red-500 hover:bg-red-100`}>Eliminar</button>
    </>
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
      <span className={`text-xs font-normal px-1.5 py-0.5 rounded-full ${
        active ? 'bg-henko-turquoise/10 text-henko-turquoise' : 'bg-gray-100 text-gray-400'
      }`}>
        {count}
      </span>
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-henko-turquoise rounded-full" />}
    </button>
  )
})
