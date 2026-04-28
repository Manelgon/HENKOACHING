'use server'

import { createClient } from '@/lib/supabase/server'
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
  const { error } = await supabase.from('leads').insert({
    tipo: input.tipo,
    nombre: input.nombre,
    email: input.email,
    telefono: input.telefono || null,
    asunto: input.asunto || null,
    mensaje: input.mensaje,
    servicio_interes: input.servicio_interes || null,
    origen: 'web',
  })

  if (error) return { error: error.message }
  return { ok: true }
}
