'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'

type Lead = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  asunto: string | null
  mensaje: string
  servicio_interes: string | null
  leido: boolean | null
  archivado: boolean | null
  created_at: string | null
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter()
  const runAction = useAction()
  const [expandido, setExpandido] = useState<string | null>(null)
  const pagination = usePagination(leads, 20)

  async function marcarLeido(id: string, leido: boolean) {
    const supabase = createClient()
    const result = await runAction(
      leido ? 'Marcando como leído' : 'Marcando como no leído',
      async () => {
        const { error } = await supabase.from('leads').update({ leido }).eq('id', id)
        if (error) throw new Error(error.message)
        return null
      },
      { silentSuccess: true },
    )
    if (result.ok) router.refresh()
  }

  async function archivar(id: string) {
    if (!confirm('¿Archivar este lead?')) return
    const supabase = createClient()
    const result = await runAction(
      'Archivando lead',
      async () => {
        const { error } = await supabase.from('leads').update({ archivado: true }).eq('id', id)
        if (error) throw new Error(error.message)
        return null
      },
      { successMessage: 'Lead archivado' },
    )
    if (result.ok) router.refresh()
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-8 py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-roxborough text-xl text-gray-400 mb-2">Sin mensajes todavía</p>
        <p className="font-raleway text-gray-400 text-sm font-light">Cuando alguien rellene el formulario, aparecerá aquí.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-100 bg-gray-50">
        <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</span>
        <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Email</span>
        <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Asunto</span>
        <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Mensaje</span>
        <span className="col-span-1 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
      </div>

      {pagination.paginated.map((l) => {
        const fecha = l.created_at
          ? new Date(l.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
          : ''
        const open = expandido === l.id
        return (
          <div key={l.id} className={`border-b border-gray-100 last:border-0 ${!l.leido ? 'bg-henko-greenblue/10' : ''}`}>
            <div
              className="grid grid-cols-12 gap-4 px-8 py-4 items-start cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                setExpandido(open ? null : l.id)
                if (!l.leido) marcarLeido(l.id, true)
              }}
            >
              <span className="col-span-3 font-raleway font-semibold text-gray-900">
                {!l.leido && <span className="inline-block w-2 h-2 rounded-full bg-henko-turquoise mr-2" />}
                {l.nombre}
              </span>
              <span className="col-span-3 font-raleway text-sm text-gray-600 truncate">{l.email}</span>
              <span className="col-span-2 font-raleway text-sm text-gray-600 truncate">{l.asunto || l.servicio_interes || '—'}</span>
              <span className="col-span-3 font-raleway text-sm text-gray-500 truncate">{l.mensaje}</span>
              <span className="col-span-1 font-raleway text-xs text-gray-400">{fecha}</span>
            </div>
            {open && (
              <div className="px-8 pb-6 text-sm text-gray-700 font-raleway">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {l.telefono && <p><b className="text-gray-400">Teléfono:</b> {l.telefono}</p>}
                  {l.servicio_interes && <p><b className="text-gray-400">Servicio:</b> {l.servicio_interes}</p>}
                </div>
                <p className="bg-gray-50 rounded-2xl px-5 py-4 leading-relaxed whitespace-pre-line">{l.mensaje}</p>
                <div className="flex gap-3 mt-4">
                  <a
                    href={`mailto:${l.email}`}
                    className="text-xs text-henko-turquoise font-semibold hover:underline"
                  >
                    Responder
                  </a>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); marcarLeido(l.id, !l.leido) }}
                    className="text-xs text-gray-500 hover:text-gray-900"
                  >
                    Marcar como {l.leido ? 'no leído' : 'leído'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); archivar(l.id) }}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Archivar
                  </button>
                </div>
              </div>
            )}
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
  )
}
