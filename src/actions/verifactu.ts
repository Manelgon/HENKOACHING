'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import { validarIdFiscal } from '@/lib/verifactu/nif'
import { requireAdmin } from '@/lib/auth/require-admin'

// Validacion Zod: estos campos viajan al XML AEAT, un valor malformado
// contamina permanentemente todos los registros posteriores.
const configVerifactuSchema = z.object({
  verifactu_productor_nombre: z.string().trim().max(120, 'Maximo 120 caracteres'),
  verifactu_productor_nif: z.string().trim().refine(
    (s) => s === '' || validarIdFiscal(s).valido,
    'NIF del productor invalido',
  ),
  verifactu_sistema_nombre: z.string().trim().min(1, 'Obligatorio').max(30, 'Maximo 30 caracteres (limite AEAT)'),
  verifactu_sistema_id: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{1,2}$/, 'Debe ser 1-2 caracteres alfanumericos (limite AEAT)'),
  verifactu_version: z.string().trim().min(1, 'Obligatorio').max(50, 'Maximo 50 caracteres'),
  verifactu_numero_instalacion: z.string().trim().min(1, 'Obligatorio').max(100, 'Maximo 100 caracteres (limite AEAT)'),
})

export type ConfigVerifactuInput = z.input<typeof configVerifactuSchema>

export async function guardarConfigVerifactu(input: ConfigVerifactuInput) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const parsed = configVerifactuSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { error: `${first.path.join('.')}: ${first.message}` }
  }
  const data = parsed.data

  const admin = createAdminClient()
  const { error } = await admin
    .from('company_settings' as never)
    .update(data as never)
    .eq('id', 1)

  if (error) return { error: error.message }

  await logAction({
    accion: 'verifactu.configurar',
    recursoTipo: 'company_settings',
    recursoId: '1',
  })

  revalidatePath('/dashboard/verifactu')
  return { ok: true }
}

// =============================================================================
// REINTENTAR ENVÍO de un registro en error
// =============================================================================
// Marca el registro como 'pendiente' y limpia el último error. El job de envío
// AEAT (F4) lo recogerá en su siguiente ciclo. No vuelve a enviar aquí mismo
// porque el envío real requiere certificado digital + firma XAdES, que se
// implementan en F4. Hasta entonces este botón solo resetea el estado.
export async function reintentarEnvioVerifactu(registroId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const admin = createAdminClient()

  const { data: previo } = await admin
    .from('verifactu_registros' as never)
    .select('numero_factura, estado_envio')
    .eq('id', registroId)
    .maybeSingle()

  if (!previo) return { error: 'Registro no encontrado' }
  const r = previo as { numero_factura: string; estado_envio: string }

  if (r.estado_envio !== 'error' && r.estado_envio !== 'rechazado') {
    return { error: 'Solo se puede reintentar un registro en error o rechazado' }
  }

  const { error } = await admin
    .from('verifactu_registros' as never)
    .update({ estado_envio: 'pendiente', ultimo_error: null } as never)
    .eq('id', registroId)

  if (error) return { error: error.message }

  await logAction({
    accion: 'verifactu.reintentar',
    recursoTipo: 'verifactu_registro',
    recursoId: registroId,
    recursoLabel: r.numero_factura,
    metadata: { estado_previo: r.estado_envio },
  })

  revalidatePath('/dashboard/verifactu')
  return { ok: true }
}

// =============================================================================
// LEER XML + RESPUESTA AEAT de un registro
// =============================================================================
export async function getRegistroVerifactu(registroId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const admin = createAdminClient()
  const { data } = await admin
    .from('verifactu_registros' as never)
    .select('id, num_registro, tipo, numero_factura, fecha_hora_generacion, huella, huella_anterior, estado_envio, ultimo_error, intentos, enviado_at, csv_aeat, xml_payload, respuesta_aeat')
    .eq('id', registroId)
    .maybeSingle()

  if (!data) return { error: 'Registro no encontrado' }

  return {
    ok: true,
    registro: data as {
      id: string
      num_registro: number
      tipo: 'alta' | 'anulacion'
      numero_factura: string
      fecha_hora_generacion: string
      huella: string
      huella_anterior: string | null
      estado_envio: string
      ultimo_error: string | null
      intentos: number
      enviado_at: string | null
      csv_aeat: string | null
      xml_payload: string | null
      respuesta_aeat: string | null
    },
  }
}

// =============================================================================
// BACKUP VERIFICABLE: export NDJSON de TODOS los registros Veri*factu.
// =============================================================================
// Cada línea es un JSON con metadata + xml_payload + respuesta_aeat de un
// registro. El conjunto sirve para:
//   - cumplir el plazo de conservación (6 años) fuera de Supabase.
//   - reconstruir la cadena en caso de migración de proveedor.
//   - presentarlo a la AEAT en una inspección.
//
// Se calcula también una huella global SHA-256 sobre el orden de huellas
// individuales que va al final del fichero, así si alguien edita una línea
// el hash global ya no cuadra.
export async function exportarBackupVerifactu() {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('verifactu_registros' as never)
    .select('id, num_registro, tipo, factura_id, nif_emisor, numero_factura, fecha_emision, tipo_factura_aeat, cuota_total, importe_total, fecha_hora_generacion, huella, huella_anterior, estado_envio, csv_aeat, intentos, enviado_at, ultimo_error, xml_payload, respuesta_aeat, created_at')
    .order('num_registro', { ascending: true })

  if (error) return { error: error.message }
  const filas = (data as Array<Record<string, unknown>>) ?? []

  const { createHash } = await import('node:crypto')
  const cadena = filas.map((r) => String(r.huella ?? '')).join('|')
  const huellaGlobal = createHash('sha256').update(cadena, 'utf8').digest('hex').toUpperCase()

  const ahora = new Date().toISOString()
  const lineas: string[] = [
    JSON.stringify({
      _meta: 'backup-verifactu',
      generado_en: ahora,
      total_registros: filas.length,
      huella_global_sha256: huellaGlobal,
    }),
    ...filas.map((r) => JSON.stringify(r)),
  ]

  await logAction({
    accion: 'verifactu.export_backup',
    recursoTipo: 'verifactu_registros',
    recursoId: 'all',
    metadata: { total_registros: filas.length, huella_global: huellaGlobal },
  })

  return {
    ok: true,
    ndjson: lineas.join('\n') + '\n',
    totalRegistros: filas.length,
    huellaGlobal,
    generadoEn: ahora,
  }
}
