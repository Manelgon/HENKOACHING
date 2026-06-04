import type { EstadoSolicitud } from '@/lib/supabase/database.types'

export type CandidatoRow = {
  id: string
  nombre: string | null
  apellidos: string | null
  email: string
  telefono: string | null
  cargo_actual: string | null
  cargo_experiencia: string | null
  empresa_experiencia: string | null
  exp_es_actual: boolean
  ubicacion: string | null
  created_at: string | null
  solicitudes_count: number
  es_nuevo: boolean
  tipo_jornada: string | null
  modalidad_trabajo: string | null
  sectores_interes: string[] | null
  tiene_cv: boolean
  cv_storage_path: string | null
  tiene_experiencia: boolean
  tiene_educacion: boolean
}

export type Experiencia = {
  id: string
  empresa: string
  cargo: string
  desde: string | null
  hasta: string | null
  descripcion: string | null
}

export type Educacion = {
  id: string
  centro: string
  titulo: string
  ano_fin: string | null
}

export type Idioma = {
  id: string
  idioma: string
  nivel: string
}

export type CvDoc = {
  id: string
  nombre_archivo: string
  storage_path: string
  es_principal: boolean | null
}

export type SolicitudCandidato = {
  id: string
  estado: EstadoSolicitud
  mensaje: string | null
  created_at: string | null
  oferta_titulo: string
  oferta_id: string
}

export type NotaInterna = {
  id: string
  contenido: string
  created_at: string
  autor_id: string | null
  autor_nombre: string | null
}

export type CandidatoPerfil = {
  id: string
  nombre: string | null
  apellidos: string | null
  email: string
  telefono: string | null
  cargo_actual: string | null
  ubicacion: string | null
  localidad: string | null
  cp: string | null
  resumen: string | null
  linkedin_url: string | null
  web_url: string | null
  disponibilidad: string | null
  pretension_salarial: string | null
  tipo_jornada: string | null
  modalidad_trabajo: string | null
  tipo_contrato: string | null
  sectores_interes: string[] | null
  fecha_nacimiento: string | null
  acepto_privacidad_at: string | null
  consent_text: string | null
  archivado: boolean
  experiencias: Experiencia[]
  educacion: Educacion[]
  idiomas: Idioma[]
  cvs: CvDoc[]
  solicitudes: SolicitudCandidato[]
  notas: NotaInterna[]
}
