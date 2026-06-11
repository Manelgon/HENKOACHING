'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRecruiter } from '@/lib/auth/require-recruiter'
import { logAction } from '@/lib/audit/log-action'
import { getOfertaPorSlug } from '@/features/empleo/queries'
import { slugify } from '@/shared/utils/slug'

export async function getOfertaDetalleAction(slug: string) {
  return getOfertaPorSlug(slug)
}

export type OfertaInput = {
  id?: string
  titulo: string
  empresa_nombre: string
  empresa_oculta: boolean
  ubicacion: string
  modalidad_id: number | null
  jornada_id: number | null
  sector_id: number | null
  salario_texto: string
  reporta_a: string
  contrato: string
  descripcion: string
  funciones?: string[]
  requisitos?: string[]
  competencias?: string[]
  ofrecemos?: string[]
  estado: 'borrador' | 'publicada' | 'pausada' | 'cerrada'
  fecha_expiracion?: string | null
}

async function ensureClienteEmpresa(nombre: string): Promise<string> {
  const supabase = await createClient()
  const slug = slugify(nombre)

  const { data: existing } = await supabase
    .from('clientes')
    .select('id')
    .eq('tipo', 'empresa')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from('clientes')
    .insert({ tipo: 'empresa', slug, nombre })
    .select('id')
    .single()

  if (error || !data) throw new Error('No se pudo crear cliente-empresa: ' + error?.message)
  return data.id
}

export async function crearOferta(input: OfertaInput) {
  const auth = await requireRecruiter()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  try {
    const cliente_id = await ensureClienteEmpresa(input.empresa_nombre)
    const slug = `${slugify(input.titulo)}-${Date.now().toString(36)}`

    const { data: nueva, error } = await supabase.from('ofertas').insert({
      slug,
      titulo: input.titulo,
      cliente_id,
      empresa_oculta: input.empresa_oculta,
      ubicacion: input.ubicacion,
      modalidad_id: input.modalidad_id,
      jornada_id: input.jornada_id,
      sector_id: input.sector_id,
      salario_texto: input.salario_texto,
      reporta_a: input.reporta_a || null,
      contrato: input.contrato || null,
      descripcion: input.descripcion,
      funciones: input.funciones ?? [],
      requisitos: input.requisitos ?? [],
      competencias: input.competencias ?? [],
      ofrecemos: input.ofrecemos ?? [],
      estado: input.estado,
      fecha_publicacion: input.estado === 'publicada' ? new Date().toISOString() : null,
      fecha_expiracion: input.fecha_expiracion ? new Date(input.fecha_expiracion).toISOString() : null,
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
  const auth = await requireRecruiter()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  try {
    const cliente_id = await ensureClienteEmpresa(input.empresa_nombre)

    const { data: actualizada, error } = await supabase
      .from('ofertas')
      .update({
        titulo: input.titulo,
        cliente_id,
        empresa_oculta: input.empresa_oculta,
        ubicacion: input.ubicacion,
        modalidad_id: input.modalidad_id,
        jornada_id: input.jornada_id,
        sector_id: input.sector_id,
        salario_texto: input.salario_texto,
        reporta_a: input.reporta_a || null,
        contrato: input.contrato || null,
        descripcion: input.descripcion,
        funciones: input.funciones ?? [],
        requisitos: input.requisitos ?? [],
        competencias: input.competencias ?? [],
        ofrecemos: input.ofrecemos ?? [],
        estado: input.estado,
        fecha_expiracion: input.fecha_expiracion ? new Date(input.fecha_expiracion).toISOString() : null,
      })
      .eq('id', id)
      .select('slug')
      .single()

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
    if (actualizada?.slug) revalidatePath(`/empleo/${actualizada.slug}`)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function cambiarEstadoOferta(id: string, estado: 'borrador' | 'publicada' | 'pausada' | 'cerrada') {
  const auth = await requireRecruiter()
  if (!auth.ok) return { error: auth.error }

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
  const auth = await requireRecruiter()
  if (!auth.ok) return { error: auth.error }

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
