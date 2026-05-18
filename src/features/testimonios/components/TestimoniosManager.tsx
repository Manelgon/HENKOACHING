'use client'

import { useEffect, useMemo, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import {
  crearTestimonio,
  actualizarTestimonio,
  eliminarTestimonio,
  alternarVisibilidad,
  type TestimonioInput,
} from '@/actions/testimonios'
import type { Database } from '@/lib/supabase/database.types'

type Testimonio = Database['public']['Tables']['testimonios']['Row']

const FUENTES = ['google', 'linkedin', 'email', 'manual'] as const

const FUENTE_LABEL: Record<string, string> = {
  google: 'Google',
  linkedin: 'LinkedIn',
  email: 'Email',
  manual: 'Manual',
}

const EMPTY: TestimonioInput = {
  texto: '',
  nombre: '',
  rol: '',
  sector: '',
  rating: 5,
  fuente: 'google',
  fecha: '',
  orden: 0,
  visible: true,
}

function formatFecha(fecha: string | null, withYear = true) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return fecha
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

function Stars({ n, size = 'sm' }: { n: number | null; size?: 'sm' | 'md' }) {
  if (!n) return <span className="text-gray-300">—</span>
  const cls = size === 'md' ? 'text-base' : 'text-xs'
  return (
    <span className={`text-yellow-500 whitespace-nowrap ${cls}`} aria-label={`${n} de 5`}>
      {'★'.repeat(n)}<span className="text-gray-200">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

export default function TestimoniosManager({ testimonios }: { testimonios: Testimonio[] }) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()
  const [pending, startTransition] = useTransition()

  const [tab, setTab] = useState<'all' | 'visibles' | 'ocultos'>('all')
  const [filtros, setFiltros] = useState<{ fuente: string | 'todas'; busqueda: string }>({
    fuente: 'todas',
    busqueda: '',
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TestimonioInput>(EMPTY)
  const [formError, setFormError] = useState<string | null>(null)

  const counts = useMemo(() => {
    let visibles = 0
    let ocultos = 0
    for (const t of testimonios) (t.visible ? visibles++ : ocultos++)
    return { all: testimonios.length, visibles, ocultos }
  }, [testimonios])

  const filtered = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase()
    return testimonios.filter((t) => {
      if (tab === 'visibles' && !t.visible) return false
      if (tab === 'ocultos' && t.visible) return false
      if (filtros.fuente !== 'todas' && (t.fuente ?? 'manual') !== filtros.fuente) return false
      if (q) {
        const hay = `${t.nombre} ${t.rol ?? ''} ${t.sector ?? ''} ${t.texto}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [testimonios, tab, filtros])

  const pagination = usePagination(filtered, 20)

  const selected = useMemo(
    () => (selectedId ? testimonios.find((t) => t.id === selectedId) ?? null : null),
    [selectedId, testimonios],
  )

  function resetForm() {
    setForm(EMPTY)
    setEditingId(null)
    setShowForm(false)
    setFormError(null)
  }

  function openCreate() {
    setForm(EMPTY)
    setEditingId(null)
    setFormError(null)
    setShowForm(true)
    setSelectedId(null)
  }

  function openEdit(t: Testimonio) {
    setEditingId(t.id)
    setForm({
      texto: t.texto,
      nombre: t.nombre,
      rol: t.rol ?? '',
      sector: t.sector ?? '',
      rating: t.rating ?? 5,
      fuente: t.fuente ?? 'manual',
      fecha: t.fecha ?? '',
      orden: t.orden,
      visible: t.visible,
    })
    setFormError(null)
    setShowForm(true)
    setSelectedId(null)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    startTransition(async () => {
      const result = editingId
        ? await actualizarTestimonio(editingId, form)
        : await crearTestimonio(form)
      if ('error' in result) {
        setFormError(result.error)
        return
      }
      resetForm()
      router.refresh()
    })
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: 'Eliminar testimonio',
      description: '¿Eliminar este testimonio? Quedará archivado (soft delete) y dejará de mostrarse en la web.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    const result = await runAction(
      'Eliminando testimonio',
      () => eliminarTestimonio(id),
      { successMessage: 'Testimonio eliminado' },
    )
    if (result.ok) {
      setSelectedId(null)
      router.refresh()
    }
  }

  async function handleToggle(id: string, currentlyVisible: boolean) {
    const result = await runAction(
      currentlyVisible ? 'Ocultando testimonio' : 'Mostrando testimonio',
      () => alternarVisibilidad(id, !currentlyVisible),
      { silentSuccess: true },
    )
    if (result.ok) router.refresh()
  }

  // Cerrar drawer con Escape
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  return (
    <>
      {/* Botón nuevo (móvil) */}
      <div className="md:hidden mb-3 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
        >
          + Nuevo testimonio
        </button>
      </div>

      {/* Tabs + botón nuevo (desktop) */}
      <div className="flex items-end justify-between gap-4 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
          <TabButton active={tab === 'all'} onClick={() => setTab('all')} label="Todos" count={counts.all} />
          <TabButton active={tab === 'visibles'} onClick={() => setTab('visibles')} label="Visibles" count={counts.visibles} dotColor="bg-green-500" />
          <TabButton active={tab === 'ocultos'} onClick={() => setTab('ocultos')} label="Ocultos" count={counts.ocultos} dotColor="bg-gray-400" />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="hidden md:inline-flex mb-2 flex-shrink-0 px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors whitespace-nowrap"
        >
          + Nuevo testimonio
        </button>
      </div>

      {/* Toolbar: filtros */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, texto, sector…"
            value={filtros.busqueda}
            onChange={(e) => setFiltros((f) => ({ ...f, busqueda: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
          />
          <select
            value={filtros.fuente}
            onChange={(e) => setFiltros((f) => ({ ...f, fuente: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
          >
            <option value="todas">Todas las fuentes</option>
            {FUENTES.map((f) => (
              <option key={f} value={f}>{FUENTE_LABEL[f]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 md:px-8 py-16 md:py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h6M7 16h8M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
          </div>
          <p className="font-roxborough text-xl text-gray-400 mb-2">
            {testimonios.length === 0 ? 'Sin testimonios todavía' : 'Ningún testimonio coincide con los filtros'}
          </p>
          <p className="font-raleway text-gray-400 text-sm font-light">
            {testimonios.length === 0 ? 'Crea el primero pegando una reseña de Google, LinkedIn o email.' : 'Prueba a cambiar o quitar filtros.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Cabecera desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 border-b border-gray-100 bg-gray-50">
            <span className="col-span-1 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">#</span>
            <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Autor</span>
            <span className="col-span-4 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Testimonio</span>
            <span className="col-span-1 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Fuente</span>
            <span className="col-span-1 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Rating</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</span>
          </div>

          {pagination.paginated.map((t) => (
            <div key={t.id} className={`border-b border-gray-100 last:border-0 ${!t.visible ? 'bg-gray-50/40' : ''}`}>
              {/* Fila desktop */}
              <div
                className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedId(t.id)}
              >
                <span className="col-span-1 font-raleway text-sm text-gray-400 tabular-nums">{t.orden}</span>
                <span className="col-span-3 min-w-0">
                  <span className="block font-raleway font-semibold text-gray-900 truncate">{t.nombre}</span>
                  {(t.rol || t.sector) && (
                    <span className="block font-raleway text-xs text-gray-500 truncate">
                      {t.rol}{t.rol && t.sector ? ' · ' : ''}{t.sector}
                    </span>
                  )}
                </span>
                <span className="col-span-4 font-raleway text-sm text-gray-600 italic line-clamp-2 leading-snug">
                  &ldquo;{t.texto}&rdquo;
                </span>
                <span className="col-span-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-raleway font-semibold bg-henko-turquoise/10 text-henko-turquoise">
                    {FUENTE_LABEL[t.fuente ?? 'manual'] ?? t.fuente}
                  </span>
                </span>
                <span className="col-span-1"><Stars n={t.rating} /></span>
                <span className="col-span-2">
                  {t.visible ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold bg-green-50 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold bg-gray-100 text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      Oculto
                    </span>
                  )}
                </span>
              </div>

              {/* Tarjeta móvil */}
              <div
                className="md:hidden px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedId(t.id)}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <p className="font-raleway font-semibold text-gray-900 text-sm truncate min-w-0">
                    {t.nombre}
                  </p>
                  <Stars n={t.rating} />
                </div>
                {(t.rol || t.sector) && (
                  <p className="font-raleway text-xs text-gray-500 truncate mb-2">
                    {t.rol}{t.rol && t.sector ? ' · ' : ''}{t.sector}
                  </p>
                )}
                <p className="font-raleway text-sm text-gray-600 italic line-clamp-2 leading-snug mb-2">
                  &ldquo;{t.texto}&rdquo;
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-raleway font-semibold bg-henko-turquoise/10 text-henko-turquoise">
                    {FUENTE_LABEL[t.fuente ?? 'manual'] ?? t.fuente}
                  </span>
                  {t.visible ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-raleway font-semibold bg-green-50 text-green-700">
                      <span className="w-1 h-1 rounded-full bg-green-500" />
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-raleway font-semibold bg-gray-100 text-gray-500">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      Oculto
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

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

      {/* Drawer detalle */}
      {selected && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-roxborough text-2xl text-gray-900 truncate">{selected.nombre}</h3>
                {(selected.rol || selected.sector) && (
                  <p className="font-raleway text-sm text-gray-500 mt-0.5 truncate">
                    {selected.rol}{selected.rol && selected.sector ? ' · ' : ''}{selected.sector}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Cerrar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-raleway font-semibold bg-henko-turquoise/10 text-henko-turquoise">
                  {FUENTE_LABEL[selected.fuente ?? 'manual'] ?? selected.fuente}
                </span>
                <Stars n={selected.rating} size="md" />
                {selected.visible ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold bg-green-50 text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Visible en la web
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold bg-gray-100 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Oculto
                  </span>
                )}
              </div>

              <blockquote className="font-roxborough italic text-[17px] text-gray-800 leading-relaxed border-l-4 border-henko-turquoise/40 pl-5">
                &ldquo;{selected.texto}&rdquo;
              </blockquote>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm pt-2 border-t border-gray-100">
                <div>
                  <dt className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Fecha</dt>
                  <dd className="font-raleway text-gray-700">{formatFecha(selected.fecha)}</dd>
                </div>
                <div>
                  <dt className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Orden</dt>
                  <dd className="font-raleway text-gray-700 tabular-nums">{selected.orden}</dd>
                </div>
                <div>
                  <dt className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Creado</dt>
                  <dd className="font-raleway text-gray-700">{formatFecha(selected.created_at)}</dd>
                </div>
                <div>
                  <dt className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Actualizado</dt>
                  <dd className="font-raleway text-gray-700">{formatFecha(selected.updated_at)}</dd>
                </div>
              </dl>
            </div>

            <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 px-6 py-4 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleDelete(selected.id)}
                disabled={pending}
                className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-raleway font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Eliminar
              </button>
              <button
                type="button"
                onClick={() => handleToggle(selected.id, selected.visible)}
                disabled={pending}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-raleway font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {selected.visible ? 'Ocultar' : 'Mostrar'}
              </button>
              <button
                type="button"
                onClick={() => openEdit(selected)}
                disabled={pending}
                className="px-5 py-2 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors disabled:opacity-50"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal formulario */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={resetForm}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 md:px-8 py-5 flex items-center justify-between">
              <h2 className="font-roxborough text-2xl text-gray-900">
                {editingId ? 'Editar testimonio' : 'Nuevo testimonio'}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="px-6 md:px-8 py-6 space-y-5">
              {formError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-800">
                  {formError}
                </div>
              )}

              <div>
                <label className="font-raleway text-xs font-bold mb-1.5 block text-gray-500 uppercase tracking-widest">
                  Texto del testimonio *
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.texto}
                  onChange={(e) => setForm({ ...form, texto: e.target.value })}
                  maxLength={1000}
                  placeholder="Pega aquí el texto de la reseña (Google, LinkedIn, email...)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white resize-y leading-relaxed"
                />
                <p className="text-xs text-gray-400 mt-1">{form.texto.length}/1000</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-raleway text-xs font-bold mb-1.5 block text-gray-500 uppercase tracking-widest">Nombre *</label>
                  <input
                    required
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="María Llull"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-raleway text-xs font-bold mb-1.5 block text-gray-500 uppercase tracking-widest">Rol / Cargo</label>
                  <input
                    type="text"
                    value={form.rol ?? ''}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                    placeholder="CEO, empresa familiar"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-raleway text-xs font-bold mb-1.5 block text-gray-500 uppercase tracking-widest">Sector</label>
                  <input
                    type="text"
                    value={form.sector ?? ''}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    placeholder="Servicios profesionales"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-raleway text-xs font-bold mb-1.5 block text-gray-500 uppercase tracking-widest">Fuente</label>
                  <select
                    value={form.fuente ?? 'manual'}
                    onChange={(e) => setForm({ ...form, fuente: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
                  >
                    {FUENTES.map((f) => (
                      <option key={f} value={f}>{FUENTE_LABEL[f]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-raleway text-xs font-bold mb-1.5 block text-gray-500 uppercase tracking-widest">Fecha</label>
                  <input
                    type="date"
                    value={form.fecha ?? ''}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="font-raleway text-xs font-bold mb-1.5 block text-gray-500 uppercase tracking-widest">Rating</label>
                  <select
                    value={form.rating ?? 5}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}  ({n}/5)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-raleway text-xs font-bold mb-1.5 block text-gray-500 uppercase tracking-widest">Orden</label>
                  <input
                    type="number"
                    value={form.orden ?? 0}
                    onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Menor = primero</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-3">
                  <input
                    type="checkbox"
                    checked={form.visible ?? true}
                    onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                    className="w-4 h-4 accent-henko-turquoise"
                  />
                  <span className="font-raleway text-sm text-gray-700">Visible en la web</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 px-6 md:px-8 py-4 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-raleway font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-5 py-2 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light disabled:opacity-50 transition-colors"
              >
                {pending ? 'Guardando…' : editingId ? 'Actualizar' : 'Crear testimonio'}
              </button>
            </div>
          </form>
        </div>
      )}
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

function TabButton({ active, onClick, label, count, dotColor }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
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
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-henko-turquoise rounded-full" />
      )}
    </button>
  )
}
