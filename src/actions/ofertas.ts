'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit/log-action'

export type OfertaInput = {
  id?: string
  titulo: string
  empresa_nombre: string
  ubicacion: string
  modalidad_id: number
  jornada_id: number
  sector_id: number
  salario_texto: string
  descripcion: string
  requisitos?: string[]
  ofrecemos?: string[]
  estado: 'borrador' | 'publicada' | 'pausada' | 'cerrada'
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function ensureEmpresa(nombre: string): Promise<string> {
  const supabase = await createClient()
  const slug = slugify(nombre)

  const { data: existing } = await supabase
    .from('empresas')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from('empresas')
    .insert({ slug, nombre })
    .select('id')
    .single()

  if (error || !data) throw new Error('No se pudo crear empresa: ' + error?.message)
  return data.id
}

export async function crearOferta(input: OfertaInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  try {
    const empresa_id = await ensureEmpresa(input.empresa_nombre)
    const slug = `${slugify(input.titulo)}-${Date.now().toString(36)}`

    const { data: nueva, error } = await supabase.from('ofertas').insert({
      slug,
      titulo: input.titulo,
      empresa_id,
      ubicacion: input.ubicacion,
      modalidad_id: input.modalidad_id,
      jornada_id: input.jornada_id,
      sector_id: input.sector_id,
      salario_texto: input.salario_texto,
      descripcion: input.descripcion,
      requisitos: input.requisitos ?? [],
      ofrecemos: input.ofrecemos ?? [],
      estado: input.estado,
      fecha_publicacion: input.estado === 'publicada' ? new Date().toISOString() : null,
      publicado_por: user.id,
    }).select('id').single()

    if (error) return { error: error.message }

    await logAction({
      accion: 'oferta.crear',
      recursoTipo: 'oferta',
      recursoId: nueva?.id ?? null,
      recursoLabel: input.titulo,
      metadata: { estado: input.estado, empresa: input.empresa_nombre },
    })

    revalidatePath('/dashboard/ofertas')
    revalidatePath('/empleo')
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function actualizarOferta(id: string, input: OfertaInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  try {
    const empresa_id = await ensureEmpresa(input.empresa_nombre)

    const { error } = await supabase
      .from('ofertas')
      .update({
        titulo: input.titulo,
        empresa_id,
        ubicacion: input.ubicacion,
        modalidad_id: input.modalidad_id,
        jornada_id: input.jornada_id,
        sector_id: input.sector_id,
        salario_texto: input.salario_texto,
        descripcion: input.descripcion,
        requisitos: input.requisitos ?? [],
        ofrecemos: input.ofrecemos ?? [],
        estado: input.estado,
      })
      .eq('id', id)

    if (error) return { error: error.message }

    await logAction({
      accion: 'oferta.editar',
      recursoTipo: 'oferta',
      recursoId: id,
      recursoLabel: input.titulo,
      metadata: { estado: input.estado },
    })

    revalidatePath('/dashboard/ofertas')
    revalidatePath('/empleo')
    revalidatePath(`/empleo/${id}`)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function cambiarEstadoOferta(id: string, estado: 'borrador' | 'publicada' | 'pausada' | 'cerrada') {
  const supabase = await createClient()

  const { data: anterior } = await supabase
    .from('ofertas')
    .select('titulo, estado')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase
    .from('ofertas')
    .update({
      estado,
      fecha_publicacion: estado === 'publicada' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'oferta.cambiar_estado',
    recursoTipo: 'oferta',
    recursoId: id,
    recursoLabel: anterior?.titulo ?? null,
    metadata: { estado_anterior: anterior?.estado ?? null, estado_nuevo: estado },
  })

  revalidatePath('/dashboard/ofertas')
  revalidatePath('/empleo')
  return { ok: true }
}

export async function eliminarOferta(id: string) {
  const supabase = await createClient()

  const { data: oferta } = await supabase
    .from('ofertas')
    .select('titulo')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase
    .from('ofertas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'oferta.eliminar',
    recursoTipo: 'oferta',
    recursoId: id,
    recursoLabel: oferta?.titulo ?? null,
  })

  revalidatePath('/dashboard/ofertas')
  revalidatePath('/empleo')
  return { ok: true }
}
