import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanySettings } from '@/lib/company-settings'
import { calcularHuellaAlta, calcularHuellaAnulacion } from './hash'
import { tipoFacturaAeatDeSerie } from './tipo-factura'
import { urlVerificacion } from './qr'
import { construirXmlAlta, construirXmlAnulacion, type EncadenamientoAlta } from './xml-builder'
import { getSistemaInformatico } from './sistema-informatico'
import { validarIdFiscal } from './nif'

type FacturaRegistro = {
  id: string
  numero: string
  serie: string
  fecha_emision: string
  iva_importe: number
  base_imponible: number
  iva_porcentaje: number
  total: number
  cliente_nombre: string
  cliente_nif: string | null
  factura_rectificada_id: string | null
  motivo_rectificacion: string | null
}

async function leerFactura(id: string): Promise<FacturaRegistro | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('facturas' as never)
    .select('id, numero, serie, fecha_emision, iva_importe, base_imponible, iva_porcentaje, total, cliente_nombre, cliente_nif, factura_rectificada_id, motivo_rectificacion')
    .eq('id', id)
    .maybeSingle()
  return (data as FacturaRegistro | null) ?? null
}

async function leerFacturaOriginal(id: string): Promise<{ numero: string; fecha_emision: string } | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('facturas' as never)
    .select('numero, fecha_emision')
    .eq('id', id)
    .maybeSingle()
  return (data as { numero: string; fecha_emision: string } | null) ?? null
}

async function leerDescripcionDesdeLineas(facturaId: string): Promise<string> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('factura_lineas' as never)
    .select('concepto')
    .eq('factura_id', facturaId)
    .order('orden', { ascending: true })
  const conceptos = (data as { concepto: string }[] | null) ?? []
  const texto = conceptos.map((c) => c.concepto).filter(Boolean).join(' · ').trim()
  // AEAT limita DescripcionOperacion a 500 caracteres
  return (texto || 'Prestación de servicios').slice(0, 500)
}

type AnteriorCompleto = {
  emisorNif: string
  numero: string
  fechaEmision: string
  huella: string
}

async function leerUltimoRegistro(): Promise<AnteriorCompleto | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('verifactu_registros' as never)
    .select('huella, nif_emisor, numero_factura, fecha_emision')
    .order('num_registro', { ascending: false })
    .limit(1)
    .maybeSingle()
  const r = data as { huella: string; nif_emisor: string; numero_factura: string; fecha_emision: string } | null
  if (!r) return null
  return {
    emisorNif: r.nif_emisor,
    numero: r.numero_factura,
    fechaEmision: r.fecha_emision,
    huella: r.huella,
  }
}

function encadenamientoDesdeAnterior(anterior: AnteriorCompleto | null): EncadenamientoAlta {
  if (!anterior) return { primerRegistro: true }
  return { primerRegistro: false, anterior }
}


export type ResultadoRegistro = { ok: true; registroId: string; huella: string; qrUrl: string } | { error: string }


export async function registrarAlta(facturaId: string, intentos = 0): Promise<ResultadoRegistro> {
  const admin = createAdminClient()

  const factura = await leerFactura(facturaId)
  if (!factura) return { error: 'Factura no encontrada' }

  const settings = await getCompanySettings()
  if (!settings.emisor_nif) return { error: 'Falta NIF del emisor en ajustes' }
  if (!settings.emisor_nombre) return { error: 'Falta nombre del emisor en ajustes' }

  const nifEmisor = validarIdFiscal(settings.emisor_nif)
  if (!nifEmisor.valido) return { error: `NIF del emisor inválido: ${nifEmisor.error}` }

  // Cliente: si trae NIF, debe ser válido. Si no trae (consumidor final), se permite.
  let nifClienteNormalizado: string | null = null
  if (factura.cliente_nif) {
    const nifCliente = validarIdFiscal(factura.cliente_nif)
    if (!nifCliente.valido) return { error: `NIF del cliente inválido: ${nifCliente.error}` }
    nifClienteNormalizado = nifCliente.normalizado
  }

  const anterior = await leerUltimoRegistro()
  const fechaHoraGeneracion = new Date()
  const tipoFacturaAeat = tipoFacturaAeatDeSerie(factura.serie)
  const cuotaTotal = Number(factura.iva_importe)
  // AEAT: ImporteTotal = base + IVA (sin restar IRPF). El IRPF es retención
  // del pagador, no reduce el importe fiscal de la operación.
  const importeTotal = +(Number(factura.base_imponible) + Number(factura.iva_importe)).toFixed(2)

  const { huella } = calcularHuellaAlta({
    nifEmisor: nifEmisor.normalizado,
    numeroFactura: factura.numero,
    fechaEmision: factura.fecha_emision,
    tipoFacturaAeat,
    cuotaTotal,
    importeTotal,
    huellaAnterior: anterior?.huella ?? null,
    fechaHoraGeneracion,
  })

  // Datos extra para el XML
  const descripcion = await leerDescripcionDesdeLineas(facturaId)
  let rectificativa: InputXmlAltaRectificativa | undefined
  if (factura.factura_rectificada_id && (factura.serie === 'R' || factura.serie === 'A')) {
    const original = await leerFacturaOriginal(factura.factura_rectificada_id)
    if (original) {
      rectificativa = {
        tipo: 'S', // Sustitutiva (Henkoaching no usa "por diferencias")
        original: {
          emisorNif: nifEmisor.normalizado,
          numero: original.numero,
          fechaEmision: original.fecha_emision,
        },
      }
    }
  }

  const xmlPayload = construirXmlAlta({
    emisor: { nombreRazon: settings.emisor_nombre, nif: nifEmisor.normalizado },
    factura: {
      numero: factura.numero,
      fechaEmision: factura.fecha_emision,
      tipoFacturaAeat,
      cliente: { nombreRazon: factura.cliente_nombre, nif: nifClienteNormalizado },
      descripcionOperacion: descripcion,
      baseImponible: Number(factura.base_imponible),
      ivaPorcentaje: Number(factura.iva_porcentaje),
      ivaImporte: cuotaTotal,
      importeTotal,
      rectificativa,
    },
    encadenamiento: encadenamientoDesdeAnterior(anterior),
    sistemaInformatico: getSistemaInformatico({
      emisor: { nombreRazon: settings.emisor_nombre, nif: nifEmisor.normalizado },
      bd: settings,
    }),
    fechaHoraGeneracion,
    huella,
  })

  const { data: registro, error } = await admin
    .from('verifactu_registros' as never)
    .insert({
      factura_id: facturaId,
      tipo: 'alta',
      huella,
      huella_anterior: anterior?.huella ?? null,
      hash_factura: huella,
      nif_emisor: nifEmisor.normalizado,
      numero_factura: factura.numero,
      fecha_emision: factura.fecha_emision,
      tipo_factura_aeat: tipoFacturaAeat,
      cuota_total: cuotaTotal,
      importe_total: importeTotal,
      fecha_hora_generacion: fechaHoraGeneracion.toISOString(),
      xml_payload: xmlPayload,
    } as never)
    .select('id')
    .single()

  if (error || !registro) {
    // 23505 = unique_violation: otra factura tomo nuestro slot de huella_anterior.
    // Reintentar leyendo el ultimo registro de nuevo.
    if (intentos < 3 && (error as { code?: string } | null)?.code === '23505') {
      return registrarAlta(facturaId, intentos + 1)
    }
    if ((error as { code?: string } | null)?.code === '23505') {
      return { error: 'Conflicto de concurrencia persistente al registrar la factura. Reintenta en unos segundos.' }
    }
    return { error: error?.message ?? 'No se pudo crear el registro Verifactu' }
  }

  const registroId = (registro as { id: string }).id
  const qrUrl = urlVerificacion(facturaId, huella)

  await admin
    .from('facturas' as never)
    .update({ verifactu_alta_id: registroId, qr_url: qrUrl } as never)
    .eq('id', facturaId)

  return { ok: true, registroId, huella, qrUrl }
}


export async function registrarAnulacion(facturaId: string, intentos = 0): Promise<ResultadoRegistro> {
  const admin = createAdminClient()

  const factura = await leerFactura(facturaId)
  if (!factura) return { error: 'Factura no encontrada' }

  const settings = await getCompanySettings()
  if (!settings.emisor_nif) return { error: 'Falta NIF del emisor en ajustes' }
  if (!settings.emisor_nombre) return { error: 'Falta nombre del emisor en ajustes' }

  const nifEmisor = validarIdFiscal(settings.emisor_nif)
  if (!nifEmisor.valido) return { error: `NIF del emisor inválido: ${nifEmisor.error}` }

  const anterior = await leerUltimoRegistro()
  const fechaHoraGeneracion = new Date()

  const { huella } = calcularHuellaAnulacion({
    nifEmisor: nifEmisor.normalizado,
    numeroFactura: factura.numero,
    fechaEmision: factura.fecha_emision,
    huellaAnterior: anterior?.huella ?? null,
    fechaHoraGeneracion,
  })

  const tipoFacturaAeat = tipoFacturaAeatDeSerie(factura.serie)

  const xmlPayload = construirXmlAnulacion({
    emisor: { nombreRazon: settings.emisor_nombre, nif: nifEmisor.normalizado },
    factura: { numero: factura.numero, fechaEmision: factura.fecha_emision },
    encadenamiento: encadenamientoDesdeAnterior(anterior),
    sistemaInformatico: getSistemaInformatico({
      emisor: { nombreRazon: settings.emisor_nombre, nif: nifEmisor.normalizado },
      bd: settings,
    }),
    fechaHoraGeneracion,
    huella,
  })

  const { data: registro, error } = await admin
    .from('verifactu_registros' as never)
    .insert({
      factura_id: facturaId,
      tipo: 'anulacion',
      huella,
      huella_anterior: anterior?.huella ?? null,
      hash_factura: huella,
      nif_emisor: nifEmisor.normalizado,
      numero_factura: factura.numero,
      fecha_emision: factura.fecha_emision,
      tipo_factura_aeat: tipoFacturaAeat,
      cuota_total: Number(factura.iva_importe),
      importe_total: +(Number(factura.base_imponible) + Number(factura.iva_importe)).toFixed(2),
      fecha_hora_generacion: fechaHoraGeneracion.toISOString(),
      xml_payload: xmlPayload,
    } as never)
    .select('id')
    .single()

  if (error || !registro) {
    if (intentos < 3 && (error as { code?: string } | null)?.code === '23505') {
      return registrarAnulacion(facturaId, intentos + 1)
    }
    if ((error as { code?: string } | null)?.code === '23505') {
      return { error: 'Conflicto de concurrencia persistente al anular la factura. Reintenta en unos segundos.' }
    }
    return { error: error?.message ?? 'No se pudo registrar la anulación Verifactu' }
  }

  const registroId = (registro as { id: string }).id

  await admin
    .from('facturas' as never)
    .update({ verifactu_anulacion_id: registroId } as never)
    .eq('id', facturaId)

  return { ok: true, registroId, huella, qrUrl: '' }
}

// Tipo auxiliar para no exportar implícitamente la forma del input rectificativa
type InputXmlAltaRectificativa = NonNullable<Parameters<typeof construirXmlAlta>[0]['factura']['rectificativa']>
