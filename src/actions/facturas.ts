'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import { getCompanySettings, downloadAssetBytes } from '@/lib/company-settings'
import { buildFacturaPdf, type FacturaPdfData, type EmisorPdf } from '@/lib/pdf/factura'

type EstadoFactura = 'pendiente' | 'pagada' | 'vencida' | 'devuelta' | 'anulada'
type FormaPago = 'transferencia' | 'efectivo' | 'bizum' | 'tarjeta' | 'domiciliacion'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') return { error: 'Sin permisos' as const }
  return { user, profile }
}

export type LineaInput = {
  concepto: string
  cantidad: number
  precio_unitario: number
  descuento_porcentaje: number
}

export type FacturaInput = {
  cliente_id: string
  serie: string
  fecha_emision: string  // YYYY-MM-DD
  fecha_vencimiento: string | null
  iva_porcentaje: number
  irpf_porcentaje: number
  forma_pago: FormaPago | null
  notas: string | null
  lineas: LineaInput[]
  factura_rectificada_id?: string | null
  motivo_rectificacion?: string | null
}

function calcularTotales(lineas: LineaInput[], ivaPct: number, irpfPct: number) {
  const lineasConSubtotal = lineas.map((l) => {
    const bruto = l.cantidad * l.precio_unitario
    const dto = bruto * (l.descuento_porcentaje / 100)
    const subtotal = +(bruto - dto).toFixed(2)
    return { ...l, subtotal }
  })
  const base = +lineasConSubtotal.reduce((a, l) => a + l.subtotal, 0).toFixed(2)
  const ivaImporte = +(base * (ivaPct / 100)).toFixed(2)
  const irpfImporte = +(base * (irpfPct / 100)).toFixed(2)
  const total = +(base + ivaImporte - irpfImporte).toFixed(2)
  return { lineasConSubtotal, base, ivaImporte, irpfImporte, total }
}

// =============================================================================
// CREAR FACTURA
// =============================================================================
export async function crearFactura(input: FacturaInput) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  if (!input.cliente_id) return { error: 'Selecciona un cliente' }
  if (!input.lineas.length) return { error: 'Añade al menos una línea' }
  if (input.lineas.some((l) => !l.concepto.trim())) return { error: 'Todas las líneas necesitan concepto' }

  const admin = createAdminClient()

  // Datos del cliente (snapshot fiscal)
  const { data: cliente } = await admin
    .from('clientes')
    .select('id, nombre, email, nif_cif, direccion_fiscal, empresa')
    .eq('id', input.cliente_id)
    .maybeSingle()

  if (!cliente) return { error: 'Cliente no encontrado' }

  // Siguiente número (atómico vía función SQL, usando la serie elegida)
  const serieLimpia = (input.serie ?? '').trim() || null
  const { data: numData, error: numError } = await admin.rpc(
    'next_numero_factura' as never,
    { serie_input: serieLimpia } as never,
  )
  const numArr = numData as unknown as Array<{ numero: string; serie: string; anio: number; correlativo: number }> | null
  if (numError || !numArr || numArr.length === 0) {
    return { error: numError?.message ?? 'No se pudo generar el número de factura' }
  }
  const { numero, serie, anio, correlativo } = numArr[0]

  // Persistir la serie usada como default para la próxima vez
  if (serieLimpia) {
    await admin
      .from('company_settings' as never)
      .update({ serie_default: serieLimpia } as never)
      .eq('id', 1)
  }

  // Cálculos
  const { lineasConSubtotal, base, ivaImporte, irpfImporte, total } = calcularTotales(
    input.lineas,
    input.iva_porcentaje,
    input.irpf_porcentaje,
  )

  // Insert factura
  const { data: factura, error: insertError } = await admin
    .from('facturas' as never)
    .insert({
      numero,
      serie,
      anio,
      correlativo,
      cliente_id: input.cliente_id,
      cliente_nombre: cliente.empresa || cliente.nombre,
      cliente_nif: cliente.nif_cif,
      cliente_direccion: cliente.direccion_fiscal,
      cliente_email: cliente.email,
      fecha_emision: input.fecha_emision,
      fecha_vencimiento: input.fecha_vencimiento,
      base_imponible: base,
      iva_porcentaje: input.iva_porcentaje,
      iva_importe: ivaImporte,
      irpf_porcentaje: input.irpf_porcentaje,
      irpf_importe: irpfImporte,
      total,
      estado: 'pendiente' as EstadoFactura,
      forma_pago: input.forma_pago,
      notas: input.notas,
      factura_rectificada_id: input.factura_rectificada_id ?? null,
      motivo_rectificacion: input.motivo_rectificacion ?? null,
      creado_por: auth.user.id,
    } as never)
    .select('id, numero')
    .single()

  if (insertError || !factura) return { error: insertError?.message ?? 'Error al crear factura' }
  const facturaId = (factura as unknown as { id: string }).id

  // Insert líneas
  const { error: lineasError } = await admin
    .from('factura_lineas' as never)
    .insert(
      lineasConSubtotal.map((l, idx) => ({
        factura_id: facturaId,
        concepto: l.concepto,
        cantidad: l.cantidad,
        precio_unitario: l.precio_unitario,
        descuento_porcentaje: l.descuento_porcentaje,
        subtotal: l.subtotal,
        orden: idx,
      })) as never,
    )

  if (lineasError) {
    // Rollback factura
    await admin.from('facturas' as never).delete().eq('id', facturaId)
    return { error: lineasError.message }
  }

  // Generar PDF
  await regenerarPdfFactura(facturaId)

  await logAction({
    accion: 'factura.crear',
    recursoTipo: 'factura',
    recursoId: facturaId,
    recursoLabel: numero,
    metadata: { cliente: cliente.empresa || cliente.nombre, total },
  })

  revalidatePath('/dashboard/facturas')
  return { ok: true, id: facturaId, numero }
}

// =============================================================================
// REGENERAR PDF
// =============================================================================
export async function regenerarPdfFactura(facturaId: string) {
  const admin = createAdminClient()

  const { data: factura } = await admin
    .from('facturas' as never)
    .select('*')
    .eq('id', facturaId)
    .maybeSingle()

  if (!factura) return { error: 'Factura no encontrada' }
  const f = factura as unknown as {
    id: string
    numero: string
    serie: string
    cliente_nombre: string
    cliente_nif: string | null
    cliente_direccion: string | null
    cliente_email: string | null
    fecha_emision: string
    fecha_vencimiento: string | null
    base_imponible: number
    iva_porcentaje: number
    iva_importe: number
    irpf_porcentaje: number
    irpf_importe: number
    total: number
    estado: EstadoFactura
    forma_pago: FormaPago | null
    notas: string | null
    factura_rectificada_id: string | null
    motivo_rectificacion: string | null
  }

  // Si es rectificativa, leer el número de la factura original para mostrarlo
  let rectificaA: string | null = null
  if (f.factura_rectificada_id) {
    const { data: original } = await admin
      .from('facturas' as never)
      .select('numero')
      .eq('id', f.factura_rectificada_id)
      .maybeSingle()
    rectificaA = (original as { numero: string } | null)?.numero ?? null
  }

  const { data: lineas } = await admin
    .from('factura_lineas' as never)
    .select('concepto, cantidad, precio_unitario, descuento_porcentaje, subtotal, orden')
    .eq('factura_id', facturaId)
    .order('orden', { ascending: true })

  const settings = await getCompanySettings()
  const [logoBytes, firmaBytes, headerBytes, footerBytes] = await Promise.all([
    downloadAssetBytes(settings.logo_path),
    downloadAssetBytes(settings.firma_path),
    downloadAssetBytes(settings.header_path),
    downloadAssetBytes(settings.footer_path),
  ])

  const emisor: EmisorPdf = {
    nombre: settings.emisor_nombre,
    nif: settings.emisor_nif,
    direccion: settings.emisor_direccion,
    cp: settings.emisor_cp,
    ciudad: settings.emisor_ciudad,
    provincia: settings.emisor_provincia,
    pais: settings.emisor_pais,
    email: settings.emisor_email,
    telefono: settings.emisor_telefono,
    web: settings.emisor_web,
    iban: settings.emisor_iban,
    pieDePagina: settings.pie_pagina,
  }

  const data: FacturaPdfData = {
    numero: f.numero,
    fechaEmision: f.fecha_emision,
    fechaVencimiento: f.fecha_vencimiento,
    cliente: {
      nombre: f.cliente_nombre,
      nif: f.cliente_nif,
      direccion: f.cliente_direccion,
      email: f.cliente_email,
    },
    lineas: (lineas as unknown as { concepto: string; cantidad: number; precio_unitario: number; descuento_porcentaje: number; subtotal: number }[]) ?? [],
    baseImponible: Number(f.base_imponible),
    ivaPorcentaje: Number(f.iva_porcentaje),
    ivaImporte: Number(f.iva_importe),
    irpfPorcentaje: Number(f.irpf_porcentaje),
    irpfImporte: Number(f.irpf_importe),
    total: Number(f.total),
    estado: f.estado,
    formaPago: f.forma_pago,
    notas: f.notas,
    rectificaANumero: rectificaA,
    motivoRectificacion: f.motivo_rectificacion,
    tipoDocumento: f.serie === 'A' ? 'abono' : f.serie === 'R' ? 'rectificativa' : 'factura',
  }

  const pdfBytes = await buildFacturaPdf(data, emisor, { logoBytes, firmaBytes, headerBytes, footerBytes })

  const safeName = f.numero.replace(/[^\w\-]/g, '_')
  const storagePath = `factura-${safeName}.pdf`

  const { error: uploadError } = await admin.storage
    .from('facturas')
    .upload(storagePath, pdfBytes, { contentType: 'application/pdf', upsert: true })

  if (uploadError) return { error: uploadError.message }

  await admin
    .from('facturas' as never)
    .update({ pdf_path: storagePath } as never)
    .eq('id', facturaId)

  return { ok: true, path: storagePath }
}

// =============================================================================
// CAMBIAR ESTADO
// =============================================================================
export async function cambiarEstadoFactura(
  id: string,
  estado: EstadoFactura,
  extras?: { motivo_devolucion?: string | null; fecha_pago?: string | null; forma_pago?: FormaPago | null },
) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const admin = createAdminClient()
  const updates: Record<string, unknown> = { estado }

  if (estado === 'pagada') {
    updates.fecha_pago = extras?.fecha_pago ?? new Date().toISOString().slice(0, 10)
    if (extras?.forma_pago) updates.forma_pago = extras.forma_pago
  }
  if (estado === 'devuelta') {
    updates.fecha_devolucion = new Date().toISOString().slice(0, 10)
    updates.motivo_devolucion = extras?.motivo_devolucion ?? null
  }
  if (estado === 'pendiente') {
    updates.fecha_pago = null
    updates.fecha_devolucion = null
    updates.motivo_devolucion = null
  }

  const { data: previo } = await admin
    .from('facturas' as never)
    .select('numero, estado')
    .eq('id', id)
    .maybeSingle()

  const { error } = await admin
    .from('facturas' as never)
    .update(updates as never)
    .eq('id', id)

  if (error) return { error: error.message }

  // Regenerar PDF para que el sello refleje el nuevo estado
  await regenerarPdfFactura(id)

  await logAction({
    accion: 'factura.cambiar_estado',
    recursoTipo: 'factura',
    recursoId: id,
    recursoLabel: (previo as { numero: string } | null)?.numero ?? id,
    metadata: { de: (previo as { estado: string } | null)?.estado, a: estado },
  })

  revalidatePath('/dashboard/facturas')
  return { ok: true }
}

// =============================================================================
// EDITAR FACTURA
// =============================================================================
export async function editarFactura(id: string, input: FacturaInput) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  if (!input.lineas.length) return { error: 'Añade al menos una línea' }

  const admin = createAdminClient()

  const { data: cliente } = await admin
    .from('clientes')
    .select('id, nombre, email, nif_cif, direccion_fiscal, empresa')
    .eq('id', input.cliente_id)
    .maybeSingle()

  if (!cliente) return { error: 'Cliente no encontrado' }

  const { lineasConSubtotal, base, ivaImporte, irpfImporte, total } = calcularTotales(
    input.lineas,
    input.iva_porcentaje,
    input.irpf_porcentaje,
  )

  const { error: updateError } = await admin
    .from('facturas' as never)
    .update({
      cliente_id: input.cliente_id,
      cliente_nombre: cliente.empresa || cliente.nombre,
      cliente_nif: cliente.nif_cif,
      cliente_direccion: cliente.direccion_fiscal,
      cliente_email: cliente.email,
      fecha_emision: input.fecha_emision,
      fecha_vencimiento: input.fecha_vencimiento,
      iva_porcentaje: input.iva_porcentaje,
      iva_importe: ivaImporte,
      irpf_porcentaje: input.irpf_porcentaje,
      irpf_importe: irpfImporte,
      base_imponible: base,
      total,
      forma_pago: input.forma_pago,
      notas: input.notas,
      motivo_rectificacion: input.motivo_rectificacion ?? null,
    } as never)
    .eq('id', id)

  if (updateError) return { error: updateError.message }

  // Reemplazar líneas
  await admin.from('factura_lineas' as never).delete().eq('factura_id', id)
  const { error: lineasError } = await admin
    .from('factura_lineas' as never)
    .insert(
      lineasConSubtotal.map((l, idx) => ({
        factura_id: id,
        concepto: l.concepto,
        cantidad: l.cantidad,
        precio_unitario: l.precio_unitario,
        descuento_porcentaje: l.descuento_porcentaje,
        subtotal: l.subtotal,
        orden: idx,
      })) as never,
    )

  if (lineasError) return { error: lineasError.message }

  await regenerarPdfFactura(id)

  await logAction({
    accion: 'factura.editar',
    recursoTipo: 'factura',
    recursoId: id,
    metadata: { total },
  })

  revalidatePath('/dashboard/facturas')
  return { ok: true }
}

// =============================================================================
// ELIMINAR FACTURA (solo borrador o anulada — facturas "vivas" no se borran)
// =============================================================================
export async function eliminarFactura(id: string) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const admin = createAdminClient()

  const { data: factura } = await admin
    .from('facturas' as never)
    .select('numero, estado, pdf_path')
    .eq('id', id)
    .maybeSingle()

  if (!factura) return { error: 'Factura no encontrada' }
  const f = factura as unknown as { numero: string; estado: EstadoFactura; pdf_path: string | null }

  if (f.estado !== 'anulada') {
    return { error: 'Solo se pueden eliminar facturas anuladas. Anula primero la factura.' }
  }

  if (f.pdf_path) {
    await admin.storage.from('facturas').remove([f.pdf_path])
  }

  const { error } = await admin.from('facturas' as never).delete().eq('id', id)
  if (error) return { error: error.message }

  await logAction({
    accion: 'factura.eliminar',
    recursoTipo: 'factura',
    recursoId: id,
    recursoLabel: f.numero,
  })

  revalidatePath('/dashboard/facturas')
  return { ok: true }
}

// =============================================================================
// OBTENER FACTURA + LÍNEAS (para modo edición)
// =============================================================================
export async function obtenerFactura(id: string) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const admin = createAdminClient()

  const { data: factura } = await admin
    .from('facturas' as never)
    .select('id, numero, serie, cliente_id, fecha_emision, fecha_vencimiento, iva_porcentaje, irpf_porcentaje, forma_pago, notas, estado, factura_rectificada_id, motivo_rectificacion')
    .eq('id', id)
    .maybeSingle()

  if (!factura) return { error: 'Factura no encontrada' }

  const { data: lineas } = await admin
    .from('factura_lineas' as never)
    .select('concepto, cantidad, precio_unitario, descuento_porcentaje')
    .eq('factura_id', id)
    .order('orden', { ascending: true })

  return { ok: true, factura, lineas: lineas ?? [] }
}

// =============================================================================
// URL FIRMADA PARA DESCARGAR PDF
// =============================================================================
export async function getFacturaPdfUrl(id: string) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const admin = createAdminClient()

  const { data: factura } = await admin
    .from('facturas' as never)
    .select('pdf_path')
    .eq('id', id)
    .maybeSingle()

  let pdfPath = (factura as { pdf_path: string | null } | null)?.pdf_path ?? null

  // Si no hay PDF aún, generarlo
  if (!pdfPath) {
    const r = await regenerarPdfFactura(id)
    if ('error' in r) return r
    pdfPath = r.path
  }

  const { data: signed, error } = await admin.storage
    .from('facturas')
    .createSignedUrl(pdfPath!, 60 * 10)

  if (error || !signed) return { error: error?.message ?? 'No se pudo generar URL' }

  return { ok: true, url: signed.signedUrl }
}
