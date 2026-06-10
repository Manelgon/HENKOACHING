'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { logAction } from '@/lib/audit/log-action'

type Result<T = undefined> = { ok: true; data?: T } | { error: string }

export type TestimonioInput = {
  texto: string
  nombre: string
  rol?: string
  sector?: string
  rating?: number
  fuente?: string
  fecha?: string
  orden?: number
  visible?: boolean
}

function revalidar() {
  revalidatePath('/dashboard/testimonios')
  revalidatePath('/')
}

function validar(input: TestimonioInput): string | null {
  if (!input.texto?.trim()) return 'El texto del testimonio es obligatorio'
  if (input.texto.trim().length < 10) return 'El testimonio es demasiado corto'
  if (input.texto.length > 1000) return 'El testimonio no puede superar 1000 caracteres'
  if (!input.nombre?.trim()) return 'El nombre es obligatorio'
  if (input.rating != null && (input.rating < 1 || input.rating > 5)) return 'El rating debe estar entre 1 y 5'
  return null
}

export async function crearTestimonio(input: TestimonioInput): Promise<Result<{ id: string }>> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }
  const err = validar(input)
  if (err) return { error: err }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('testimonios')
    .insert({
      texto: input.texto.trim(),
      nombre: input.nombre.trim(),
      rol: input.rol?.trim() || null,
      sector: input.sector?.trim() || null,
      rating: input.rating ?? null,
      fuente: input.fuente?.trim() || 'manual',
      fecha: input.fecha || null,
      orden: input.orden ?? 0,
      visible: input.visible ?? true,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await logAction({
    accion: 'testimonio.crear',
    recursoTipo: 'testimonio',
    recursoId: data.id,
    recursoLabel: input.nombre.trim(),
    metadata: { visible: input.visible ?? true },
  })

  revalidar()
  return { ok: true, data: { id: data.id } }
}

export async function actualizarTestimonio(id: string, input: TestimonioInput): Promise<Result> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }
  const err = validar(input)
  if (err) return { error: err }

  const supabase = await createClient()
  const { error } = await supabase
    .from('testimonios')
    .update({
      texto: input.texto.trim(),
      nombre: input.nombre.trim(),
      rol: input.rol?.trim() || null,
      sector: input.sector?.trim() || null,
      rating: input.rating ?? null,
      fuente: input.fuente?.trim() || 'manual',
      fecha: input.fecha || null,
      orden: input.orden ?? 0,
      visible: input.visible ?? true,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'testimonio.editar',
    recursoTipo: 'testimonio',
    recursoId: id,
    recursoLabel: input.nombre.trim(),
    metadata: { visible: input.visible ?? true },
  })

  revalidar()
  return { ok: true }
}

export async function eliminarTestimonio(id: string): Promise<Result> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('testimonios')
    .update({ deleted_at: new Date().toISOString(), visible: false })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'testimonio.eliminar',
    recursoTipo: 'testimonio',
    recursoId: id,
  })

  revalidar()
  return { ok: true }
}

export async function alternarVisibilidad(id: string, visible: boolean): Promise<Result> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('testimonios')
    .update({ visible })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: visible ? 'testimonio.mostrar' : 'testimonio.ocultar',
    recursoTipo: 'testimonio',
    recursoId: id,
  })

  revalidar()
  return { ok: true }
}
