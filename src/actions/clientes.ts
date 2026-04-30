'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import type {
  EstadoCliente,
  ServicioContratado,
  TarifaTipo,
} from '@/lib/supabase/database.types'

type ClienteInput = {
  nombre: string
  email: string
  telefono?: string | null
  empresa?: string | null
  nif_cif?: string | null
  direccion_fiscal?: string | null
  servicio_contratado?: ServicioContratado | null
  fecha_inicio?: string | null
  importe?: number | null
  tarifa?: TarifaTipo | null
  proxima_sesion?: string | null
  linkedin_url?: string | null
  web_url?: string | null
  estado?: EstadoCliente
  origen?: string | null
}

// =============================================================================
// CONVERTIR LEAD → CLIENTE (mueve el lead, lo archiva y crea el cliente)
// =============================================================================
export async function convertirLeadACliente(leadId: string, input: ClienteInput) {
  if (!input.nombre.trim() || !input.email.trim()) {
    return { error: 'Nombre y email son obligatorios' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Obtener lead para heredar origen y validar existencia
  const { data: lead } = await supabase
    .from('leads')
    .select('id, nombre, email, origen, archivado')
    .eq('id', leadId)
    .single()

  if (!lead) return { error: 'Lead no encontrado' }

  // Crear cliente
  const { data: cliente, error: errCli } = await supabase
    .from('clientes')
    .insert({
      lead_id: leadId,
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono ?? null,
      empresa: input.empresa ?? null,
      nif_cif: input.nif_cif ?? null,
      direccion_fiscal: input.direccion_fiscal ?? null,
      servicio_contratado: input.servicio_contratado ?? null,
      fecha_inicio: input.fecha_inicio ?? null,
      importe: input.importe ?? null,
      tarifa: input.tarifa ?? null,
      proxima_sesion: input.proxima_sesion ?? null,
      linkedin_url: input.linkedin_url ?? null,
      web_url: input.web_url ?? null,
      estado: input.estado ?? 'activo',
      origen: input.origen ?? lead.origen ?? null,
      creado_por: user.id,
    })
    .select('id')
    .single()

  if (errCli) return { error: errCli.message }

  // Archivar el lead (se mueve, ya no aparece en activos)
  const { error: errLead } = await supabase
    .from('leads')
    .update({ archivado: true })
    .eq('id', leadId)

  if (errLead) {
    // Rollback: borrar cliente recién creado
    await supabase.from('clientes').delete().eq('id', cliente!.id)
    return { error: errLead.message }
  }

  await logAction({
    accion: 'cliente.convertir_desde_lead',
    recursoTipo: 'cliente',
    recursoId: cliente?.id ?? null,
    recursoLabel: `${input.nombre} <${input.email}>`,
    metadata: { lead_id: leadId, servicio: input.servicio_contratado ?? null, importe: input.importe ?? null },
  })

  revalidatePath('/dashboard/leads')
  revalidatePath('/dashboard/clientes')
  return { ok: true, id: cliente?.id }
}

// =============================================================================
// CREAR CLIENTE MANUALMENTE (sin lead previo)
// =============================================================================
export async function crearClienteManual(input: ClienteInput) {
  if (!input.nombre.trim() || !input.email.trim()) {
    return { error: 'Nombre y email son obligatorios' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert({
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono ?? null,
      empresa: input.empresa ?? null,
      nif_cif: input.nif_cif ?? null,
      direccion_fiscal: input.direccion_fiscal ?? null,
      servicio_contratado: input.servicio_contratado ?? null,
      fecha_inicio: input.fecha_inicio ?? null,
      importe: input.importe ?? null,
      tarifa: input.tarifa ?? null,
      proxima_sesion: input.proxima_sesion ?? null,
      linkedin_url: input.linkedin_url ?? null,
      web_url: input.web_url ?? null,
      estado: input.estado ?? 'activo',
      origen: input.origen ?? null,
      creado_por: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await logAction({
    accion: 'cliente.crear_manual',
    recursoTipo: 'cliente',
    recursoId: cliente?.id ?? null,
    recursoLabel: `${input.nombre} <${input.email}>`,
    metadata: { servicio: input.servicio_contratado ?? null, importe: input.importe ?? null },
  })

  revalidatePath('/dashboard/clientes')
  return { ok: true, id: cliente?.id }
}

// =============================================================================
// EDITAR CLIENTE
// =============================================================================
export async function editarCliente(id: string, input: ClienteInput) {
  if (!input.nombre.trim() || !input.email.trim()) {
    return { error: 'Nombre y email son obligatorios' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('clientes')
    .update({
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono ?? null,
      empresa: input.empresa ?? null,
      nif_cif: input.nif_cif ?? null,
      direccion_fiscal: input.direccion_fiscal ?? null,
      servicio_contratado: input.servicio_contratado ?? null,
      fecha_inicio: input.fecha_inicio ?? null,
      importe: input.importe ?? null,
      tarifa: input.tarifa ?? null,
      proxima_sesion: input.proxima_sesion ?? null,
      linkedin_url: input.linkedin_url ?? null,
      web_url: input.web_url ?? null,
      estado: input.estado ?? 'activo',
      origen: input.origen ?? null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'cliente.editar',
    recursoTipo: 'cliente',
    recursoId: id,
    recursoLabel: `${input.nombre} <${input.email}>`,
  })

  revalidatePath('/dashboard/clientes')
  revalidatePath(`/dashboard/clientes/${id}`)
  return { ok: true }
}

// =============================================================================
// CAMBIAR ESTADO DEL CLIENTE
// =============================================================================
export async function cambiarEstadoCliente(id: string, nuevoEstado: EstadoCliente) {
  const supabase = await createClient()

  const { data: actual } = await supabase
    .from('clientes')
    .select('estado, nombre, email')
    .eq('id', id)
    .single()

  if (!actual) return { error: 'Cliente no encontrado' }

  const { error } = await supabase
    .from('clientes')
    .update({ estado: nuevoEstado })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'cliente.cambiar_estado',
    recursoTipo: 'cliente',
    recursoId: id,
    recursoLabel: `${actual.nombre} <${actual.email}>`,
    metadata: { de: actual.estado, a: nuevoEstado },
  })

  revalidatePath('/dashboard/clientes')
  revalidatePath(`/dashboard/clientes/${id}`)
  return { ok: true }
}

// =============================================================================
// ELIMINAR (soft delete)
// =============================================================================
export async function eliminarCliente(id: string) {
  const supabase = await createClient()

  const { data: actual } = await supabase
    .from('clientes')
    .select('nombre, email')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('clientes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'cliente.eliminar',
    recursoTipo: 'cliente',
    recursoId: id,
    recursoLabel: actual ? `${actual.nombre} <${actual.email}>` : id,
  })

  revalidatePath('/dashboard/clientes')
  return { ok: true }
}

// =============================================================================
// NOTAS DEL CLIENTE
// =============================================================================
export async function crearNotaCliente(clienteId: string, contenido: string) {
  if (!contenido.trim()) return { error: 'La nota no puede estar vacía' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('cliente_notas').insert({
    cliente_id: clienteId,
    autor_id: user.id,
    contenido: contenido.trim(),
  })

  if (error) return { error: error.message }

  await logAction({
    accion: 'cliente.nota_crear',
    recursoTipo: 'cliente',
    recursoId: clienteId,
    metadata: { longitud: contenido.length },
  })

  revalidatePath(`/dashboard/clientes/${clienteId}`)
  return { ok: true }
}

export async function eliminarNotaCliente(notaId: string) {
  const supabase = await createClient()

  const { data: nota } = await supabase
    .from('cliente_notas')
    .select('cliente_id')
    .eq('id', notaId)
    .single()

  const { error } = await supabase.from('cliente_notas').delete().eq('id', notaId)
  if (error) return { error: error.message }

  await logAction({
    accion: 'cliente.nota_eliminar',
    recursoTipo: 'cliente',
    recursoId: nota?.cliente_id ?? null,
  })

  if (nota?.cliente_id) revalidatePath(`/dashboard/clientes/${nota.cliente_id}`)
  return { ok: true }
}

// =============================================================================
// SESIONES
// =============================================================================
export async function crearSesion(clienteId: string, input: {
  fecha: string
  tipo?: string
  duracion?: number
  notas?: string
  realizada?: boolean
}) {
  if (!input.fecha) return { error: 'La fecha es obligatoria' }

  const supabase = await createClient()

  const { data: nueva, error } = await supabase
    .from('cliente_sesiones')
    .insert({
      cliente_id: clienteId,
      fecha: input.fecha,
      tipo: input.tipo ?? null,
      duracion: input.duracion ?? null,
      notas: input.notas ?? null,
      realizada: input.realizada ?? false,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await logAction({
    accion: 'cliente.sesion_crear',
    recursoTipo: 'cliente',
    recursoId: clienteId,
    metadata: { sesion_id: nueva?.id, fecha: input.fecha, tipo: input.tipo ?? null },
  })

  revalidatePath(`/dashboard/clientes/${clienteId}`)
  return { ok: true, id: nueva?.id }
}

export async function actualizarSesion(sesionId: string, input: {
  fecha?: string
  tipo?: string
  duracion?: number
  notas?: string
  realizada?: boolean
}) {
  const supabase = await createClient()

  const { data: sesion } = await supabase
    .from('cliente_sesiones')
    .select('cliente_id')
    .eq('id', sesionId)
    .single()

  const { error } = await supabase
    .from('cliente_sesiones')
    .update(input)
    .eq('id', sesionId)

  if (error) return { error: error.message }

  await logAction({
    accion: 'cliente.sesion_editar',
    recursoTipo: 'cliente',
    recursoId: sesion?.cliente_id ?? null,
    metadata: { sesion_id: sesionId, cambios: input },
  })

  if (sesion?.cliente_id) revalidatePath(`/dashboard/clientes/${sesion.cliente_id}`)
  return { ok: true }
}

export async function eliminarSesion(sesionId: string) {
  const supabase = await createClient()

  const { data: sesion } = await supabase
    .from('cliente_sesiones')
    .select('cliente_id')
    .eq('id', sesionId)
    .single()

  const { error } = await supabase.from('cliente_sesiones').delete().eq('id', sesionId)
  if (error) return { error: error.message }

  await logAction({
    accion: 'cliente.sesion_eliminar',
    recursoTipo: 'cliente',
    recursoId: sesion?.cliente_id ?? null,
    metadata: { sesion_id: sesionId },
  })

  if (sesion?.cliente_id) revalidatePath(`/dashboard/clientes/${sesion.cliente_id}`)
  return { ok: true }
}

// =============================================================================
// ARCHIVOS (subir/eliminar/firmar URL)
// =============================================================================
export async function subirArchivoCliente(clienteId: string, formData: FormData) {
  const file = formData.get('file') as File | null
  const tipo = (formData.get('tipo') as string | null) ?? 'otro'

  if (!file || file.size === 0) return { error: 'No se ha seleccionado ningún archivo' }
  if (file.size > 10 * 1024 * 1024) return { error: 'El archivo supera 10MB' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const extension = file.name.split('.').pop() ?? 'bin'
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${clienteId}/${Date.now()}-${safeName}`

  const admin = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const { error: upErr } = await admin.storage
    .from('cliente-archivos')
    .upload(path, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (upErr) return { error: upErr.message }

  const { error: insErr } = await supabase.from('cliente_archivos').insert({
    cliente_id: clienteId,
    nombre_archivo: file.name,
    storage_path: path,
    tipo,
    tamano_bytes: file.size,
    subido_por: user.id,
  })

  if (insErr) {
    await admin.storage.from('cliente-archivos').remove([path])
    return { error: insErr.message }
  }

  await logAction({
    accion: 'cliente.archivo_subir',
    recursoTipo: 'cliente',
    recursoId: clienteId,
    metadata: { nombre: file.name, tipo, bytes: file.size, extension },
  })

  revalidatePath(`/dashboard/clientes/${clienteId}`)
  return { ok: true }
}

export async function eliminarArchivoCliente(archivoId: string) {
  const supabase = await createClient()

  const { data: archivo } = await supabase
    .from('cliente_archivos')
    .select('cliente_id, storage_path, nombre_archivo')
    .eq('id', archivoId)
    .single()

  if (!archivo) return { error: 'Archivo no encontrado' }

  const admin = createAdminClient()
  await admin.storage.from('cliente-archivos').remove([archivo.storage_path])

  const { error } = await supabase
    .from('cliente_archivos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', archivoId)

  if (error) return { error: error.message }

  await logAction({
    accion: 'cliente.archivo_eliminar',
    recursoTipo: 'cliente',
    recursoId: archivo.cliente_id,
    metadata: { nombre: archivo.nombre_archivo },
  })

  revalidatePath(`/dashboard/clientes/${archivo.cliente_id}`)
  return { ok: true }
}

export async function getArchivoSignedUrl(archivoId: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: archivo } = await supabase
    .from('cliente_archivos')
    .select('storage_path')
    .eq('id', archivoId)
    .single()

  if (!archivo) return { error: 'Archivo no encontrado' }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('cliente-archivos')
    .createSignedUrl(archivo.storage_path, 60 * 5)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
