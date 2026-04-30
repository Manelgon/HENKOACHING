export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          accion: string
          actor_email: string | null
          actor_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          recurso_id: string | null
          recurso_label: string | null
          recurso_tipo: string
        }
        Insert: {
          accion: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recurso_id?: string | null
          recurso_label?: string | null
          recurso_tipo: string
        }
        Update: {
          accion?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recurso_id?: string | null
          recurso_label?: string | null
          recurso_tipo?: string
        }
        Relationships: []
      }
      blog_categorias: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          id: number
          nombre: string
          orden: number | null
          slug: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: number
          nombre: string
          orden?: number | null
          slug: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: number
          nombre?: string
          orden?: number | null
          slug?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: { post_id: string; tag_id: number }
        Insert: { post_id: string; tag_id: number }
        Update: { post_id?: string; tag_id?: number }
        Relationships: []
      }
      blog_posts: {
        Row: {
          autor_id: string | null
          categoria_id: number | null
          contenido: string
          created_at: string | null
          deleted_at: string | null
          estado: Database["public"]["Enums"]["estado_post"]
          extracto: string | null
          fecha_publicacion: string | null
          id: string
          imagen_alt: string | null
          imagen_portada: string | null
          meta_descripcion: string | null
          meta_titulo: string | null
          slug: string
          tiempo_lectura: number | null
          titulo: string
          updated_at: string | null
          vistas: number | null
        }
        Insert: {
          autor_id?: string | null
          categoria_id?: number | null
          contenido: string
          created_at?: string | null
          deleted_at?: string | null
          estado?: Database["public"]["Enums"]["estado_post"]
          extracto?: string | null
          fecha_publicacion?: string | null
          id?: string
          imagen_alt?: string | null
          imagen_portada?: string | null
          meta_descripcion?: string | null
          meta_titulo?: string | null
          slug: string
          tiempo_lectura?: number | null
          titulo: string
          updated_at?: string | null
          vistas?: number | null
        }
        Update: {
          autor_id?: string | null
          categoria_id?: number | null
          contenido?: string
          created_at?: string | null
          deleted_at?: string | null
          estado?: Database["public"]["Enums"]["estado_post"]
          extracto?: string | null
          fecha_publicacion?: string | null
          id?: string
          imagen_alt?: string | null
          imagen_portada?: string | null
          meta_descripcion?: string | null
          meta_titulo?: string | null
          slug?: string
          tiempo_lectura?: number | null
          titulo?: string
          updated_at?: string | null
          vistas?: number | null
        }
        Relationships: []
      }
      blog_tags: {
        Row: {
          created_at: string | null
          id: number
          nombre: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          nombre: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: number
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      candidato_educacion: {
        Row: {
          ano_fin: string | null
          candidato_id: string
          centro: string
          created_at: string | null
          id: string
          orden: number | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ano_fin?: string | null
          candidato_id: string
          centro: string
          created_at?: string | null
          id?: string
          orden?: number | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ano_fin?: string | null
          candidato_id?: string
          centro?: string
          created_at?: string | null
          id?: string
          orden?: number | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      candidato_experiencias: {
        Row: {
          candidato_id: string
          cargo: string
          created_at: string | null
          descripcion: string | null
          desde: string | null
          empresa: string
          hasta: string | null
          id: string
          orden: number | null
          updated_at: string | null
        }
        Insert: {
          candidato_id: string
          cargo: string
          created_at?: string | null
          descripcion?: string | null
          desde?: string | null
          empresa: string
          hasta?: string | null
          id?: string
          orden?: number | null
          updated_at?: string | null
        }
        Update: {
          candidato_id?: string
          cargo?: string
          created_at?: string | null
          descripcion?: string | null
          desde?: string | null
          empresa?: string
          hasta?: string | null
          id?: string
          orden?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      candidato_idiomas: {
        Row: {
          candidato_id: string
          created_at: string | null
          id: string
          idioma: string
          nivel: Database["public"]["Enums"]["nivel_idioma"]
          orden: number | null
        }
        Insert: {
          candidato_id: string
          created_at?: string | null
          id?: string
          idioma: string
          nivel: Database["public"]["Enums"]["nivel_idioma"]
          orden?: number | null
        }
        Update: {
          candidato_id?: string
          created_at?: string | null
          id?: string
          idioma?: string
          nivel?: Database["public"]["Enums"]["nivel_idioma"]
          orden?: number | null
        }
        Relationships: []
      }
      candidato_profiles: {
        Row: {
          cargo_actual: string | null
          created_at: string | null
          disponibilidad: string | null
          linkedin_url: string | null
          pretension_salarial: string | null
          resumen: string | null
          ubicacion: string | null
          updated_at: string | null
          user_id: string
          web_url: string | null
        }
        Insert: {
          cargo_actual?: string | null
          created_at?: string | null
          disponibilidad?: string | null
          linkedin_url?: string | null
          pretension_salarial?: string | null
          resumen?: string | null
          ubicacion?: string | null
          updated_at?: string | null
          user_id: string
          web_url?: string | null
        }
        Update: {
          cargo_actual?: string | null
          created_at?: string | null
          disponibilidad?: string | null
          linkedin_url?: string | null
          pretension_salarial?: string | null
          resumen?: string | null
          ubicacion?: string | null
          updated_at?: string | null
          user_id?: string
          web_url?: string | null
        }
        Relationships: []
      }
      cliente_archivos: {
        Row: {
          cliente_id: string
          created_at: string | null
          deleted_at: string | null
          id: string
          nombre_archivo: string
          storage_path: string
          subido_por: string | null
          tamano_bytes: number | null
          tipo: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          nombre_archivo: string
          storage_path: string
          subido_por?: string | null
          tamano_bytes?: number | null
          tipo?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          nombre_archivo?: string
          storage_path?: string
          subido_por?: string | null
          tamano_bytes?: number | null
          tipo?: string | null
        }
        Relationships: []
      }
      cliente_notas: {
        Row: {
          autor_id: string | null
          cliente_id: string
          contenido: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          autor_id?: string | null
          cliente_id: string
          contenido: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          autor_id?: string | null
          cliente_id?: string
          contenido?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cliente_sesiones: {
        Row: {
          cliente_id: string
          created_at: string | null
          duracion: number | null
          fecha: string
          id: string
          notas: string | null
          realizada: boolean | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          duracion?: number | null
          fecha: string
          id?: string
          notas?: string | null
          realizada?: boolean | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          duracion?: number | null
          fecha?: string
          id?: string
          notas?: string | null
          realizada?: boolean | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          creado_por: string | null
          created_at: string | null
          deleted_at: string | null
          direccion_fiscal: string | null
          email: string
          empresa: string | null
          estado: Database["public"]["Enums"]["estado_cliente"]
          fecha_conversion: string | null
          fecha_inicio: string | null
          id: string
          importe: number | null
          lead_id: string | null
          linkedin_url: string | null
          nif_cif: string | null
          nombre: string
          origen: string | null
          proxima_sesion: string | null
          servicio_contratado:
            | Database["public"]["Enums"]["servicio_contratado"]
            | null
          tarifa: Database["public"]["Enums"]["tarifa_tipo"] | null
          telefono: string | null
          updated_at: string | null
          web_url: string | null
        }
        Insert: {
          creado_por?: string | null
          created_at?: string | null
          deleted_at?: string | null
          direccion_fiscal?: string | null
          email: string
          empresa?: string | null
          estado?: Database["public"]["Enums"]["estado_cliente"]
          fecha_conversion?: string | null
          fecha_inicio?: string | null
          id?: string
          importe?: number | null
          lead_id?: string | null
          linkedin_url?: string | null
          nif_cif?: string | null
          nombre: string
          origen?: string | null
          proxima_sesion?: string | null
          servicio_contratado?:
            | Database["public"]["Enums"]["servicio_contratado"]
            | null
          tarifa?: Database["public"]["Enums"]["tarifa_tipo"] | null
          telefono?: string | null
          updated_at?: string | null
          web_url?: string | null
        }
        Update: {
          creado_por?: string | null
          created_at?: string | null
          deleted_at?: string | null
          direccion_fiscal?: string | null
          email?: string
          empresa?: string | null
          estado?: Database["public"]["Enums"]["estado_cliente"]
          fecha_conversion?: string | null
          fecha_inicio?: string | null
          id?: string
          importe?: number | null
          lead_id?: string | null
          linkedin_url?: string | null
          nif_cif?: string | null
          nombre?: string
          origen?: string | null
          proxima_sesion?: string | null
          servicio_contratado?:
            | Database["public"]["Enums"]["servicio_contratado"]
            | null
          tarifa?: Database["public"]["Enums"]["tarifa_tipo"] | null
          telefono?: string | null
          updated_at?: string | null
          web_url?: string | null
        }
        Relationships: []
      }
      cvs: {
        Row: {
          candidato_id: string
          created_at: string | null
          deleted_at: string | null
          es_principal: boolean | null
          id: string
          nombre_archivo: string
          storage_path: string
          tamano_bytes: number | null
        }
        Insert: {
          candidato_id: string
          created_at?: string | null
          deleted_at?: string | null
          es_principal?: boolean | null
          id?: string
          nombre_archivo: string
          storage_path: string
          tamano_bytes?: number | null
        }
        Update: {
          candidato_id?: string
          created_at?: string | null
          deleted_at?: string | null
          es_principal?: boolean | null
          id?: string
          nombre_archivo?: string
          storage_path?: string
          tamano_bytes?: number | null
        }
        Relationships: []
      }
      empresas: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          descripcion: string | null
          id: string
          logo_url: string | null
          nombre: string
          owner_user_id: string | null
          slug: string
          ubicacion: string | null
          updated_at: string | null
          web_url: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          id?: string
          logo_url?: string | null
          nombre: string
          owner_user_id?: string | null
          slug: string
          ubicacion?: string | null
          updated_at?: string | null
          web_url?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          id?: string
          logo_url?: string | null
          nombre?: string
          owner_user_id?: string | null
          slug?: string
          ubicacion?: string | null
          updated_at?: string | null
          web_url?: string | null
        }
        Relationships: []
      }
      jornadas: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: number
          nombre: string
          orden: number | null
          slug: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: number
          nombre: string
          orden?: number | null
          slug: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: number
          nombre?: string
          orden?: number | null
          slug?: string
        }
        Relationships: []
      }
      lead_notas: {
        Row: {
          autor_id: string | null
          contenido: string
          created_at: string | null
          id: string
          lead_id: string
          updated_at: string | null
        }
        Insert: {
          autor_id?: string | null
          contenido: string
          created_at?: string | null
          id?: string
          lead_id: string
          updated_at?: string | null
        }
        Update: {
          autor_id?: string | null
          contenido?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          archivado: boolean | null
          asunto: string | null
          creado_manualmente: boolean | null
          creado_por: string | null
          created_at: string | null
          email: string
          estado: Database["public"]["Enums"]["estado_lead"]
          id: string
          leido: boolean | null
          mensaje: string
          nombre: string
          origen: string | null
          servicio_interes: string | null
          telefono: string | null
          tipo: Database["public"]["Enums"]["tipo_lead"]
          updated_at: string | null
        }
        Insert: {
          archivado?: boolean | null
          asunto?: string | null
          creado_manualmente?: boolean | null
          creado_por?: string | null
          created_at?: string | null
          email: string
          estado?: Database["public"]["Enums"]["estado_lead"]
          id?: string
          leido?: boolean | null
          mensaje: string
          nombre: string
          origen?: string | null
          servicio_interes?: string | null
          telefono?: string | null
          tipo: Database["public"]["Enums"]["tipo_lead"]
          updated_at?: string | null
        }
        Update: {
          archivado?: boolean | null
          asunto?: string | null
          creado_manualmente?: boolean | null
          creado_por?: string | null
          created_at?: string | null
          email?: string
          estado?: Database["public"]["Enums"]["estado_lead"]
          id?: string
          leido?: boolean | null
          mensaje?: string
          nombre?: string
          origen?: string | null
          servicio_interes?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_lead"]
          updated_at?: string | null
        }
        Relationships: []
      }
      modalidades: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: number
          nombre: string
          orden: number | null
          slug: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: number
          nombre: string
          orden?: number | null
          slug: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: number
          nombre?: string
          orden?: number | null
          slug?: string
        }
        Relationships: []
      }
      ofertas: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          descripcion: string
          empresa_id: string
          estado: Database["public"]["Enums"]["estado_oferta"]
          fecha_expiracion: string | null
          fecha_publicacion: string | null
          id: string
          jornada_id: number | null
          modalidad_id: number | null
          ofrecemos: string[] | null
          publicado_por: string | null
          requisitos: string[] | null
          salario_max: number | null
          salario_min: number | null
          salario_texto: string | null
          sector_id: number | null
          slug: string
          titulo: string
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          descripcion: string
          empresa_id: string
          estado?: Database["public"]["Enums"]["estado_oferta"]
          fecha_expiracion?: string | null
          fecha_publicacion?: string | null
          id?: string
          jornada_id?: number | null
          modalidad_id?: number | null
          ofrecemos?: string[] | null
          publicado_por?: string | null
          requisitos?: string[] | null
          salario_max?: number | null
          salario_min?: number | null
          salario_texto?: string | null
          sector_id?: number | null
          slug: string
          titulo: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string
          empresa_id?: string
          estado?: Database["public"]["Enums"]["estado_oferta"]
          fecha_expiracion?: string | null
          fecha_publicacion?: string | null
          id?: string
          jornada_id?: number | null
          modalidad_id?: number | null
          ofrecemos?: string[] | null
          publicado_por?: string | null
          requisitos?: string[] | null
          salario_max?: number | null
          salario_min?: number | null
          salario_texto?: string | null
          sector_id?: number | null
          slug?: string
          titulo?: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apellidos: string | null
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          id: string
          nombre: string | null
          role: Database["public"]["Enums"]["user_role"]
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          apellidos?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          id: string
          nombre?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          apellidos?: string | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          nombre?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sectores: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: number
          nombre: string
          orden: number | null
          slug: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: number
          nombre: string
          orden?: number | null
          slug: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: number
          nombre?: string
          orden?: number | null
          slug?: string
        }
        Relationships: []
      }
      solicitud_eventos: {
        Row: {
          cambiado_por: string | null
          created_at: string | null
          estado_anterior:
            | Database["public"]["Enums"]["estado_solicitud"]
            | null
          estado_nuevo: Database["public"]["Enums"]["estado_solicitud"]
          id: string
          nota: string | null
          solicitud_id: string
        }
        Insert: {
          cambiado_por?: string | null
          created_at?: string | null
          estado_anterior?:
            | Database["public"]["Enums"]["estado_solicitud"]
            | null
          estado_nuevo: Database["public"]["Enums"]["estado_solicitud"]
          id?: string
          nota?: string | null
          solicitud_id: string
        }
        Update: {
          cambiado_por?: string | null
          created_at?: string | null
          estado_anterior?:
            | Database["public"]["Enums"]["estado_solicitud"]
            | null
          estado_nuevo?: Database["public"]["Enums"]["estado_solicitud"]
          id?: string
          nota?: string | null
          solicitud_id?: string
        }
        Relationships: []
      }
      solicitud_notas: {
        Row: {
          autor_id: string | null
          contenido: string
          created_at: string | null
          id: string
          solicitud_id: string
          updated_at: string | null
        }
        Insert: {
          autor_id?: string | null
          contenido: string
          created_at?: string | null
          id?: string
          solicitud_id: string
          updated_at?: string | null
        }
        Update: {
          autor_id?: string | null
          contenido?: string
          created_at?: string | null
          id?: string
          solicitud_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      solicitudes: {
        Row: {
          candidato_id: string
          created_at: string | null
          cv_id: string | null
          estado: Database["public"]["Enums"]["estado_solicitud"]
          id: string
          mensaje: string | null
          oferta_id: string
          updated_at: string | null
        }
        Insert: {
          candidato_id: string
          created_at?: string | null
          cv_id?: string | null
          estado?: Database["public"]["Enums"]["estado_solicitud"]
          id?: string
          mensaje?: string | null
          oferta_id: string
          updated_at?: string | null
        }
        Update: {
          candidato_id?: string
          created_at?: string | null
          cv_id?: string | null
          estado?: Database["public"]["Enums"]["estado_solicitud"]
          id?: string
          mensaje?: string | null
          oferta_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      blog_posts_publicados: {
        Row: {
          autor_id: string | null
          categoria_id: number | null
          contenido: string | null
          created_at: string | null
          deleted_at: string | null
          estado: Database["public"]["Enums"]["estado_post"] | null
          extracto: string | null
          fecha_publicacion: string | null
          id: string | null
          imagen_alt: string | null
          imagen_portada: string | null
          meta_descripcion: string | null
          meta_titulo: string | null
          slug: string | null
          tiempo_lectura: number | null
          titulo: string | null
          updated_at: string | null
          vistas: number | null
        }
        Relationships: []
      }
      ofertas_publicadas: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          descripcion: string | null
          empresa_id: string | null
          estado: Database["public"]["Enums"]["estado_oferta"] | null
          fecha_expiracion: string | null
          fecha_publicacion: string | null
          id: string | null
          jornada_id: number | null
          modalidad_id: number | null
          ofrecemos: string[] | null
          publicado_por: string | null
          requisitos: string[] | null
          salario_max: number | null
          salario_min: number | null
          salario_texto: string | null
          sector_id: number | null
          slug: string | null
          titulo: string | null
          ubicacion: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calcular_tiempo_lectura: { Args: { contenido: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      is_candidato: { Args: never; Returns: boolean }
      is_recruiter: { Args: never; Returns: boolean }
      slugify: { Args: { "": string }; Returns: string }
    }
    Enums: {
      estado_cliente: "activo" | "pausado" | "finalizado"
      estado_lead:
        | "nuevo"
        | "pendiente"
        | "contactado"
        | "en_conversacion"
        | "descartado"
      estado_oferta: "borrador" | "publicada" | "pausada" | "cerrada"
      estado_post: "borrador" | "publicado" | "archivado"
      estado_solicitud:
        | "nuevo"
        | "revisando"
        | "entrevista"
        | "descartado"
        | "contratado"
      nivel_idioma: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Nativo"
      servicio_contratado:
        | "operaciones"
        | "reclutamiento"
        | "liderazgo"
        | "integral"
      tarifa_tipo: "mensual" | "proyecto" | "sesion"
      tipo_lead: "contacto_general" | "consulta_servicio"
      user_role: "admin" | "recruiter" | "candidato" | "empresa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_cliente: ["activo", "pausado", "finalizado"],
      estado_lead: [
        "nuevo",
        "pendiente",
        "contactado",
        "en_conversacion",
        "descartado",
      ],
      estado_oferta: ["borrador", "publicada", "pausada", "cerrada"],
      estado_post: ["borrador", "publicado", "archivado"],
      estado_solicitud: [
        "nuevo",
        "revisando",
        "entrevista",
        "descartado",
        "contratado",
      ],
      nivel_idioma: ["A1", "A2", "B1", "B2", "C1", "C2", "Nativo"],
      servicio_contratado: [
        "operaciones",
        "reclutamiento",
        "liderazgo",
        "integral",
      ],
      tarifa_tipo: ["mensual", "proyecto", "sesion"],
      tipo_lead: ["contacto_general", "consulta_servicio"],
      user_role: ["admin", "recruiter", "candidato", "empresa"],
    },
  },
} as const

export type EstadoSolicitud = Database["public"]["Enums"]["estado_solicitud"]
export type EstadoOferta = Database["public"]["Enums"]["estado_oferta"]
export type EstadoLead = Database["public"]["Enums"]["estado_lead"]
export type EstadoCliente = Database["public"]["Enums"]["estado_cliente"]
export type ServicioContratado = Database["public"]["Enums"]["servicio_contratado"]
export type TarifaTipo = Database["public"]["Enums"]["tarifa_tipo"]
export type UserRole = Database["public"]["Enums"]["user_role"]
export type TipoLead = Database["public"]["Enums"]["tipo_lead"]
export type NivelIdioma = Database["public"]["Enums"]["nivel_idioma"]
