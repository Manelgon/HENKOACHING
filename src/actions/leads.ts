'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit/log-action'
import type { EstadoLead, TipoLead } from '@/lib/supabase/database.types'

// =============================================================================
// CREAR LEAD (público — desde formulario web)
// =============================================================================
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
    metadata: { tipo: input.tipo, origen: 'web', servicio_interes: input.servicio_interes ?? null },
    actorEmail: input.email,
  })

  return { ok: true }
}

// =============================================================================
// CREAR LEAD MANUALMENTE (desde admin — origen Instagram, llamada, etc.)
// =============================================================================
export async function crearLeadManual(input: {
  tipo: TipoLead
  nombre: string
  email: string
  telefono?: string
  asunto?: string
  mensaje: string
  servicio_interes?: string
  origen: string
  estado?: EstadoLead
}) {
  if (!input.nombre.trim() || !input.email.trim() || !input.mensaje.trim() || !input.origen.trim()) {
    return { error: 'Faltan campos obligatorios' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: nuevo, error } = await supabase.from('leads').insert({
    tipo: input.tipo,
    nombre: input.nombre,
    email: input.email,
    telefono: input.telefono || null,
    asunto: input.asunto || null,
    mensaje: input.mensaje,
    servicio_interes: input.servicio_interes || null,
    origen: input.origen,
    estado: input.estado ?? 'pendiente',
    creado_manualmente: true,
    creado_por: user.id,
  }).select('id').single()

  if (error) return { error: error.message }

  await logAction({
    accion: 'lead.crear_manual',
    recursoTipo: 'lead',
    recursoId: nuevo?.id ?? null,
    recursoLabel: `${input.nombre} <${input.email}>`,
    metadata: { origen: input.origen, estado: input.estado ?? 'pendiente' },
  })

  revalidatePath('/dashboard/leads')
  return { ok: true, id: nuevo?.id }
}

// =============================================================================
// CAMBIAR ESTADO (incluye auto: nuevo → pendiente al abrir)
// =============================================================================
export async function cambiarEstadoLead(id: string, nuevoEstado: EstadoLead) {
  const supabase = await createClient()

  const { data: actual } = await supabase
    .from('leads')
    .select('estado, nombre, email')
    .eq('id', id)
    .single()

  if (!actual) return { error: 'Lead no encontrado' }
  if (actual.estado === nuevoEstado) return { ok: true }

  const { error } = await supabase
    .from('leads')
    .update({ estado: nuevoEstado })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'lead.cambiar_estado',
    recursoTipo: 'lead',
    recursoId: id,
    recursoLabel: `${actual.nombre} <${actual.email}>`,
    metadata: { de: actual.estado, a: nuevoEstado },
  })

  revalidatePath('/dashboard/leads')
  return { ok: true }
}

// =============================================================================
// MARCAR LEÍDO + auto-pasar de 'nuevo' a 'pendiente' al primer click
// =============================================================================
export async function abrirLead(id: string) {
  const supabase = await createClient()

  const { data: actual } = await supabase
    .from('leads')
    .select('estado, leido, nombre, email')
    .eq('id', id)
    .single()

  if (!actual) return { error: 'Lead no encontrado' }

  const updates: { leido?: boolean; estado?: EstadoLead } = {}
  if (!actual.leido) updates.leido = true
  if (actual.estado === 'nuevo') updates.estado = 'pendiente'

  if (Object.keys(updates).length === 0) return { ok: true }

  const { error } = await supabase.from('leads').update(updates).eq('id', id)
  if (error) return { error: error.message }

  if (updates.estado) {
    await logAction({
      accion: 'lead.cambiar_estado',
      recursoTipo: 'lead',
      recursoId: id,
      recursoLabel: `${actual.nombre} <${actual.email}>`,
      metadata: { de: 'nuevo', a: 'pendiente', motivo: 'auto-abrir' },
    })
  }

  revalidatePath('/dashboard/leads')
  return { ok: true }
}

// =============================================================================
// ARCHIVAR LEAD
// =============================================================================
export async function archivarLead(id: string) {
  const supabase = await createClient()

  const { data: actual } = await supabase
    .from('leads')
    .select('nombre, email')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('leads')
    .update({ archivado: true })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'lead.archivar',
    recursoTipo: 'lead',
    recursoId: id,
    recursoLabel: actual ? `${actual.nombre} <${actual.email}>` : id,
  })

  revalidatePath('/dashboard/leads')
  return { ok: true }
}

// =============================================================================
// EDITAR DATOS DEL LEAD
// =============================================================================
export async function editarLead(id: string, input: {
  nombre?: string
  email?: string
  telefono?: string | null
  asunto?: string | null
  mensaje?: string
  servicio_interes?: string | null
  origen?: string | null
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .update({
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono ?? null,
      asunto: input.asunto ?? null,
      mensaje: input.mensaje,
      servicio_interes: input.servicio_interes ?? null,
      origen: input.origen ?? null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'lead.editar',
    recursoTipo: 'lead',
    recursoId: id,
    recursoLabel: `${input.nombre} <${input.email}>`,
  })

  revalidatePath('/dashboard/leads')
  return { ok: true }
}

// =============================================================================
// NOTAS DEL LEAD
// =============================================================================
export async function crearNotaLead(leadId: string, contenido: string) {
  if (!contenido.trim()) return { error: 'La nota no puede estar vacía' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('lead_notas').insert({
    lead_id: leadId,
    autor_id: user.id,
    contenido: contenido.trim(),
  })

  if (error) return { error: error.message }

  await logAction({
    accion: 'lead.nota_crear',
    recursoTipo: 'lead',
    recursoId: leadId,
    metadata: { longitud: contenido.length },
  })

  revalidatePath('/dashboard/leads')
  return { ok: true }
}

export async function eliminarNotaLead(notaId: string) {
  const supabase = await createClient()

  const { data: nota } = await supabase
    .from('lead_notas')
    .select('lead_id')
    .eq('id', notaId)
    .single()

  const { error } = await supabase.from('lead_notas').delete().eq('id', notaId)
  if (error) return { error: error.message }

  await logAction({
    accion: 'lead.nota_eliminar',
    recursoTipo: 'lead',
    recursoId: nota?.lead_id ?? null,
  })

  revalidatePath('/dashboard/leads')
  return { ok: true }
}
