import 'server-only'
import { create } from 'xmlbuilder2'
import type { TipoFacturaAeat } from './tipo-factura'
import type { SistemaInformatico } from './sistema-informatico'
import { fmtImporte, fmtFechaEsp, fmtFechaHoraUtc } from './format'

// Esquema oficial Suministro LR (sede AEAT).
const NS_SUM  = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd'
const NS_SUM1 = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd'


// =============================================================================
// REGISTRO DE ALTA
// =============================================================================
export type EncadenamientoAlta =
  | { primerRegistro: true }
  | {
      primerRegistro: false
      anterior: {
        emisorNif: string
        numero: string
        fechaEmision: string  // YYYY-MM-DD
        huella: string
      }
    }

export type InputXmlAlta = {
  emisor: { nombreRazon: string; nif: string }
  factura: {
    numero: string
    fechaEmision: string  // YYYY-MM-DD
    tipoFacturaAeat: TipoFacturaAeat
    cliente: { nombreRazon: string; nif: string | null }
    descripcionOperacion: string
    baseImponible: number
    ivaPorcentaje: number
    ivaImporte: number
    importeTotal: number
    rectificativa?: {
      tipo: 'S' | 'I'  // S=sustitutiva, I=por diferencias
      original: { emisorNif: string; numero: string; fechaEmision: string }
    }
  }
  encadenamiento: EncadenamientoAlta
  sistemaInformatico: SistemaInformatico
  fechaHoraGeneracion: Date
  huella: string
}

export function construirXmlAlta(input: InputXmlAlta): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
  const root = doc.ele(NS_SUM, 'sum:RegFactuSistemaFacturacion')
    .att('xmlns:sum', NS_SUM)
    .att('xmlns:sum1', NS_SUM1)

  // Cabecera
  const cabecera = root.ele('sum:Cabecera')
  const obligado = cabecera.ele('sum1:ObligadoEmision')
  obligado.ele('sum1:NombreRazon').txt(input.emisor.nombreRazon)
  obligado.ele('sum1:NIF').txt(input.emisor.nif)

  // RegistroFactura > RegistroAlta
  const regFactura = root.ele('sum:RegistroFactura')
  const alta = regFactura.ele('sum1:RegistroAlta')

  alta.ele('sum1:IDVersion').txt('1.0')

  const idFactura = alta.ele('sum1:IDFactura')
  idFactura.ele('sum1:IDEmisorFactura').txt(input.emisor.nif)
  idFactura.ele('sum1:NumSerieFactura').txt(input.factura.numero)
  idFactura.ele('sum1:FechaExpedicionFactura').txt(fmtFechaEsp(input.factura.fechaEmision))

  alta.ele('sum1:NombreRazonEmisor').txt(input.emisor.nombreRazon)
  alta.ele('sum1:TipoFactura').txt(input.factura.tipoFacturaAeat)

  // Rectificativa: tipo + factura original
  if (input.factura.rectificativa) {
    alta.ele('sum1:TipoRectificativa').txt(input.factura.rectificativa.tipo)
    const fr = alta.ele('sum1:FacturasRectificadas').ele('sum1:IDFacturaRectificada')
    fr.ele('sum1:IDEmisorFactura').txt(input.factura.rectificativa.original.emisorNif)
    fr.ele('sum1:NumSerieFactura').txt(input.factura.rectificativa.original.numero)
    fr.ele('sum1:FechaExpedicionFactura').txt(fmtFechaEsp(input.factura.rectificativa.original.fechaEmision))
  }

  alta.ele('sum1:DescripcionOperacion').txt(input.factura.descripcionOperacion)

  // Destinatario (cliente)
  if (input.factura.cliente.nif) {
    const dest = alta.ele('sum1:Destinatarios').ele('sum1:IDDestinatario')
    dest.ele('sum1:NombreRazon').txt(input.factura.cliente.nombreRazon)
    dest.ele('sum1:NIF').txt(input.factura.cliente.nif)
  }

  // Desglose (un único bloque para el tipo de IVA aplicado)
  const desglose = alta.ele('sum1:Desglose').ele('sum1:DetalleDesglose')
  desglose.ele('sum1:Impuesto').txt('01')               // 01 = IVA
  desglose.ele('sum1:ClaveRegimen').txt('01')           // 01 = Régimen general
  desglose.ele('sum1:CalificacionOperacion').txt('S1')  // S1 = Sujeta no exenta
  desglose.ele('sum1:TipoImpositivo').txt(fmtImporte(input.factura.ivaPorcentaje))
  desglose.ele('sum1:BaseImponibleOimporteNoSujeto').txt(fmtImporte(input.factura.baseImponible))
  desglose.ele('sum1:CuotaRepercutida').txt(fmtImporte(input.factura.ivaImporte))

  alta.ele('sum1:CuotaTotal').txt(fmtImporte(input.factura.ivaImporte))
  alta.ele('sum1:ImporteTotal').txt(fmtImporte(input.factura.importeTotal))

  // Encadenamiento
  const enc = alta.ele('sum1:Encadenamiento')
  if (input.encadenamiento.primerRegistro) {
    enc.ele('sum1:PrimerRegistro').txt('S')
  } else {
    const ant = enc.ele('sum1:RegistroAnterior')
    ant.ele('sum1:IDEmisorFactura').txt(input.encadenamiento.anterior.emisorNif)
    ant.ele('sum1:NumSerieFactura').txt(input.encadenamiento.anterior.numero)
    ant.ele('sum1:FechaExpedicionFactura').txt(fmtFechaEsp(input.encadenamiento.anterior.fechaEmision))
    ant.ele('sum1:Huella').txt(input.encadenamiento.anterior.huella)
  }

  // Sistema informático (productor)
  const si = alta.ele('sum1:SistemaInformatico')
  si.ele('sum1:NombreRazon').txt(input.sistemaInformatico.nombreRazon)
  if (input.sistemaInformatico.nif) si.ele('sum1:NIF').txt(input.sistemaInformatico.nif)
  si.ele('sum1:NombreSistemaInformatico').txt(input.sistemaInformatico.nombreSistemaInformatico)
  si.ele('sum1:IdSistemaInformatico').txt(input.sistemaInformatico.idSistemaInformatico)
  si.ele('sum1:Version').txt(input.sistemaInformatico.version)
  si.ele('sum1:NumeroInstalacion').txt(input.sistemaInformatico.numeroInstalacion)
  si.ele('sum1:TipoUsoPosibleSoloVerifactu').txt(input.sistemaInformatico.tipoUsoPosibleSoloVerifactu)
  si.ele('sum1:TipoUsoPosibleMultiOT').txt(input.sistemaInformatico.tipoUsoPosibleMultiOT)
  si.ele('sum1:IndicadorMultiplesOT').txt(input.sistemaInformatico.indicadorMultiplesOT)

  alta.ele('sum1:FechaHoraHusoGenRegistro').txt(fmtFechaHoraUtc(input.fechaHoraGeneracion))
  alta.ele('sum1:TipoHuella').txt('01')  // 01 = SHA-256
  alta.ele('sum1:Huella').txt(input.huella)

  return doc.end({ prettyPrint: true })
}


// =============================================================================
// REGISTRO DE ANULACIÓN
// =============================================================================
export type InputXmlAnulacion = {
  emisor: { nombreRazon: string; nif: string }
  factura: {
    numero: string
    fechaEmision: string
  }
  encadenamiento: EncadenamientoAlta
  sistemaInformatico: SistemaInformatico
  fechaHoraGeneracion: Date
  huella: string
}

export function construirXmlAnulacion(input: InputXmlAnulacion): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
  const root = doc.ele(NS_SUM, 'sum:RegFactuSistemaFacturacion')
    .att('xmlns:sum', NS_SUM)
    .att('xmlns:sum1', NS_SUM1)

  // Cabecera
  const cabecera = root.ele('sum:Cabecera')
  const obligado = cabecera.ele('sum1:ObligadoEmision')
  obligado.ele('sum1:NombreRazon').txt(input.emisor.nombreRazon)
  obligado.ele('sum1:NIF').txt(input.emisor.nif)

  // RegistroFactura > RegistroAnulacion
  const regFactura = root.ele('sum:RegistroFactura')
  const anul = regFactura.ele('sum1:RegistroAnulacion')

  anul.ele('sum1:IDVersion').txt('1.0')

  const idFactura = anul.ele('sum1:IDFactura')
  idFactura.ele('sum1:IDEmisorFacturaAnulada').txt(input.emisor.nif)
  idFactura.ele('sum1:NumSerieFacturaAnulada').txt(input.factura.numero)
  idFactura.ele('sum1:FechaExpedicionFacturaAnulada').txt(fmtFechaEsp(input.factura.fechaEmision))

  // Encadenamiento
  const enc = anul.ele('sum1:Encadenamiento')
  if (input.encadenamiento.primerRegistro) {
    enc.ele('sum1:PrimerRegistro').txt('S')
  } else {
    const ant = enc.ele('sum1:RegistroAnterior')
    ant.ele('sum1:IDEmisorFactura').txt(input.encadenamiento.anterior.emisorNif)
    ant.ele('sum1:NumSerieFactura').txt(input.encadenamiento.anterior.numero)
    ant.ele('sum1:FechaExpedicionFactura').txt(fmtFechaEsp(input.encadenamiento.anterior.fechaEmision))
    ant.ele('sum1:Huella').txt(input.encadenamiento.anterior.huella)
  }

  // Sistema informático
  const si = anul.ele('sum1:SistemaInformatico')
  si.ele('sum1:NombreRazon').txt(input.sistemaInformatico.nombreRazon)
  if (input.sistemaInformatico.nif) si.ele('sum1:NIF').txt(input.sistemaInformatico.nif)
  si.ele('sum1:NombreSistemaInformatico').txt(input.sistemaInformatico.nombreSistemaInformatico)
  si.ele('sum1:IdSistemaInformatico').txt(input.sistemaInformatico.idSistemaInformatico)
  si.ele('sum1:Version').txt(input.sistemaInformatico.version)
  si.ele('sum1:NumeroInstalacion').txt(input.sistemaInformatico.numeroInstalacion)
  si.ele('sum1:TipoUsoPosibleSoloVerifactu').txt(input.sistemaInformatico.tipoUsoPosibleSoloVerifactu)
  si.ele('sum1:TipoUsoPosibleMultiOT').txt(input.sistemaInformatico.tipoUsoPosibleMultiOT)
  si.ele('sum1:IndicadorMultiplesOT').txt(input.sistemaInformatico.indicadorMultiplesOT)

  anul.ele('sum1:FechaHoraHusoGenRegistro').txt(fmtFechaHoraUtc(input.fechaHoraGeneracion))
  anul.ele('sum1:TipoHuella').txt('01')
  anul.ele('sum1:Huella').txt(input.huella)

  return doc.end({ prettyPrint: true })
}
