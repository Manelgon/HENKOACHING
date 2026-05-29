import type { EstadoSolicitud } from '@/lib/supabase/database.types'

export type CandidatoRow = {
  id: string           // profiles.id
  nombre: string | null
  apellidos: string | null
  email: string
  telefono: string | null
  cargo_actual: string | null
  ubicacion: string | null
  created_at: string | null
  solicitudes_count: number
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

export type CandidatoPerfil = {
  id: string
  nombre: string | null
  apellidos: string | null
  email: string
  telefono: string | null
  cargo_actual: string | null
  ubicacion: string | null
  resumen: string | null
  linkedin_url: string | null
  web_url: string | null
  disponibilidad: string | null
  pretension_salarial: string | null
  experiencias: Experiencia[]
  educacion: Educacion[]
  idiomas: Idioma[]
  cvs: CvDoc[]
  solicitudes: SolicitudCandidato[]
}
