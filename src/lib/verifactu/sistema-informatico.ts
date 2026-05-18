import 'server-only'

// Identificación del software productor que AEAT exige en cada registro
// (Anexo I de la Orden HAC/1177/2024 - bloque SistemaInformatico).
//
// AEAT distingue dos roles:
//   · Obligado tributario / emisor: quien factura (Jennifer).
//   · Productor del software: quien desarrolla el sistema de facturación.
//
// En este proyecto el software se usa solo internamente, por lo que productor
// y emisor coinciden. Por defecto se rellenan con los datos del emisor; si en
// el futuro existiera una entidad de software separada, se puede sobreescribir
// con variables de entorno VERIFACTU_PRODUCTOR_*.
//
// Los campos puramente técnicos (idSistemaInformatico, version, numeroInstalacion)
// no salen de ninguna identidad: son del propio software. Tienen defaults
// razonables y env vars opcionales por si hay que rotarlos.

export type SistemaInformatico = {
  nombreRazon: string
  nif: string
  nombreSistemaInformatico: string
  idSistemaInformatico: string  // 2 caracteres alfanuméricos
  version: string               // hasta 50 caracteres
  numeroInstalacion: string     // identifica la instalación concreta del software
  tipoUsoPosibleSoloVerifactu: 'S' | 'N'
  tipoUsoPosibleMultiOT: 'S' | 'N'
  indicadorMultiplesOT: 'S' | 'N'
}

export type SistemaInformaticoInput = {
  emisor: { nombreRazon: string; nif: string }
  bd: {
    verifactu_productor_nombre: string
    verifactu_productor_nif: string
    verifactu_sistema_nombre: string
    verifactu_sistema_id: string
    verifactu_version: string
    verifactu_numero_instalacion: string
  }
}

// Prioridad por campo:  BD > env var > default código.
// Productor nombre/NIF: si BD y env están vacíos, se cae al emisor.
export function getSistemaInformatico(input: SistemaInformaticoInput): SistemaInformatico {
  const { emisor, bd } = input
  return {
    nombreRazon:              bd.verifactu_productor_nombre?.trim() || process.env.VERIFACTU_PRODUCTOR_NOMBRE?.trim() || emisor.nombreRazon,
    nif:                      bd.verifactu_productor_nif?.trim()    || process.env.VERIFACTU_PRODUCTOR_NIF?.trim()    || emisor.nif,
    nombreSistemaInformatico: bd.verifactu_sistema_nombre?.trim()   || process.env.VERIFACTU_SISTEMA_NOMBRE?.trim()   || 'Henkoaching Facturación',
    idSistemaInformatico:     bd.verifactu_sistema_id?.trim()       || process.env.VERIFACTU_SISTEMA_ID?.trim()       || 'HK',
    version:                  bd.verifactu_version?.trim()          || process.env.VERIFACTU_VERSION?.trim()          || '1.0',
    numeroInstalacion:        bd.verifactu_numero_instalacion?.trim()|| process.env.VERIFACTU_NUMERO_INSTALACION?.trim()|| 'HK-01',
    tipoUsoPosibleSoloVerifactu: 'S',
    tipoUsoPosibleMultiOT: 'N',
    indicadorMultiplesOT: 'N',
  }
}
