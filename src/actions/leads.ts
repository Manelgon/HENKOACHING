'use server'

import { createClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit/log-action'
import type { TipoLead } from '@/lib/supabase/database.types'

export async function crearLead(input: {
  tipo: TipoLead
  nombre: string
  email: string
  telefono?: string
  asunto?: string
  mensaje: string
  servicio_interes?: string
}) {
  if (!input.nombre.trim() || !input.email.trim() || !input.mensaje.trim()) {
    return { error: 'Faltan campos obligatorios' }
  }

  const supabase = await createClient()
  const { data: nuevo, error } = await supabase.from('leads').insert({
    tipo: input.tipo,
    nombre: input.nombre,
    email: input.email,
    telefono: input.telefono || null,
    asunto: input.asunto || null,
    mensaje: input.mensaje,
    servicio_interes: input.servicio_interes || null,
    origen: 'web',
  }).select('id').single()

  if (error) return { error: error.message }

  await logAction({
    accion: 'lead.crear',
    recursoTipo: 'lead',
    recursoId: nuevo?.id ?? null,
    recursoLabel: `${input.nombre} <${input.email}>`,
    metadata: { tipo: input.tipo, servicio_interes: input.servicio_interes ?? null },
    actorEmail: input.email,
  })

  return { ok: true }
}
