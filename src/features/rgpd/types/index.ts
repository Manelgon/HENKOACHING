export type RgpdDocId =
  | 'ropa'
  | 'runbook'
  | 'politica_ia'
  | 'formacion_ia'
  | 'dpia_checklist'
  | 'subencargados'
  | 'responsable_incidentes'

export interface RgpdDocumento {
  id: RgpdDocId
  titulo: string
  descripcion: string
  contenido: Record<string, unknown>
  actualizado_at: string | null
  actualizado_por: string | null
  created_at: string
}

export interface ActividadRopa {
  nombre: string
  finalidad: string
  base_legal: string
  categorias_datos: string
  destinatarios: string
  transferencias_internacionales: string
  plazo_conservacion: string
}

export interface ContenidoRopa {
  actividades: ActividadRopa[]
}

export interface PasoRunbook {
  orden: number
  titulo: string
  descripcion: string
}

export interface ContenidoRunbook {
  pasos: PasoRunbook[]
  contacto_responsable: string
  enlace_aepd: string
}

export interface HerramientaIa {
  nombre: string
  uso: string
  datos_permitidos: string
  datos_prohibidos: string
}

export interface ContenidoPoliticaIa {
  herramientas_permitidas: HerramientaIa[]
  reglas_generales: string[]
  aprobacion_nuevas_integraciones: string
  ultima_revision: string
}

export interface RegistroFormacion {
  persona: string
  fecha: string
  curso: string
  horas: string
}

export interface ContenidoFormacionIa {
  registros: RegistroFormacion[]
}

export interface CriterioDpia {
  criterio: string
  aplica: boolean
  nota: string
}

export interface ContenidoDpiaChecklist {
  decision: 'requerida' | 'no_requerida'
  fecha_decision: string
  razonamiento: string
  criterios: CriterioDpia[]
}

export interface Subencargado {
  nombre: string
  servicio: string
  pais: string
  dpa_firmado: boolean
  enlace_dpa: string
  datos_tratados: string
}

export interface ContenidoSubencargados {
  subencargados: Subencargado[]
}

export interface ContenidoResponsableIncidentes {
  nombre: string
  email: string
  telefono: string
  nif: string
  rol: string
  procedimiento: string
  ultima_revision: string
}

export interface DerechoArco {
  id: string
  nombre: string
  email: string
  tipo_derecho: 'acceso' | 'rectificacion' | 'supresion' | 'portabilidad' | 'oposicion' | 'limitacion'
  descripcion: string
  estado: 'pendiente' | 'en_proceso' | 'resuelta'
  resolucion_at: string | null
  notas_admin: string | null
  created_at: string
}
