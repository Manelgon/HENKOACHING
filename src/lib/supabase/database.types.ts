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
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts_publicados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          autor_id: string | null
          canonical_url: string | null
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
          imagen_portada_alt: string | null
          keywords: string[] | null
          meta_descripcion: string | null
          meta_titulo: string | null
          og_image_url: string | null
          slug: string
          tiempo_lectura: number | null
          titulo: string
          updated_at: string | null
          vistas: number | null
        }
        Insert: {
          autor_id?: string | null
          canonical_url?: string | null
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
          imagen_portada_alt?: string | null
          keywords?: string[] | null
          meta_descripcion?: string | null
          meta_titulo?: string | null
          og_image_url?: string | null
          slug: string
          tiempo_lectura?: number | null
          titulo: string
          updated_at?: string | null
          vistas?: number | null
        }
        Update: {
          autor_id?: string | null
          canonical_url?: string | null
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
          imagen_portada_alt?: string | null
          keywords?: string[] | null
          meta_descripcion?: string | null
          meta_titulo?: string | null
          og_image_url?: string | null
          slug?: string
          tiempo_lectura?: number | null
          titulo?: string
          updated_at?: string | null
          vistas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "blog_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: { created_at: string | null; id: number; nombre: string; slug: string }
        Insert: { created_at?: string | null; id?: number; nombre: string; slug: string }
        Update: { created_at?: string | null; id?: number; nombre?: string; slug?: string }
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
        Relationships: [
          {
            foreignKeyName: "candidato_educacion_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidato_profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "candidato_experiencias_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidato_profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "candidato_idiomas_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidato_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      candidato_notas: {
        Row: {
          autor_id: string | null
          candidato_id: string
          contenido: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          autor_id?: string | null
          candidato_id: string
          contenido: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          autor_id?: string | null
          candidato_id?: string
          contenido?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidato_notas_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidato_notas_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidato_profiles: {
        Row: {
          acepto_privacidad_at: string | null
          cargo_actual: string | null
          consent_text: string | null
          cp: string | null
          created_at: string | null
          disponibilidad: string | null
          fecha_nacimiento: string | null
          linkedin_url: string | null
          localidad: string | null
          modalidad_trabajo: string | null
          pretension_salarial: string | null
          resumen: string | null
          sectores_interes: string[] | null
          tipo_contrato: string | null
          tipo_jornada: string | null
          ubicacion: string | null
          updated_at: string | null
          user_id: string
          web_url: string | null
        }
        Insert: {
          acepto_privacidad_at?: string | null
          cargo_actual?: string | null
          consent_text?: string | null
          cp?: string | null
          created_at?: string | null
          disponibilidad?: string | null
          fecha_nacimiento?: string | null
          linkedin_url?: string | null
          localidad?: string | null
          modalidad_trabajo?: string | null
          pretension_salarial?: string | null
          resumen?: string | null
          sectores_interes?: string[] | null
          tipo_contrato?: string | null
          tipo_jornada?: string | null
          ubicacion?: string | null
          updated_at?: string | null
          user_id: string
          web_url?: string | null
        }
        Update: {
          acepto_privacidad_at?: string | null
          cargo_actual?: string | null
          consent_text?: string | null
          cp?: string | null
          created_at?: string | null
          disponibilidad?: string | null
          fecha_nacimiento?: string | null
          linkedin_url?: string | null
          localidad?: string | null
          modalidad_trabajo?: string | null
          pretension_salarial?: string | null
          resumen?: string | null
          sectores_interes?: string[] | null
          tipo_contrato?: string | null
          tipo_jornada?: string | null
          ubicacion?: string | null
          updated_at?: string | null
          user_id?: string
          web_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidato_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "cliente_archivos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_archivos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "empresas_publicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_archivos_subido_por_fkey"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "cliente_notas_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_notas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_notas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "empresas_publicas"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "cliente_sesiones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_sesiones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "empresas_publicas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          creado_por: string | null
          created_at: string | null
          deleted_at: string | null
          owner_user_id: string | null
          descripcion: string | null
          direccion_fiscal: string | null
          email: string | null
          empresa: string | null
          estado: Database["public"]["Enums"]["estado_cliente"]
          fecha_conversion: string | null
          fecha_inicio: string | null
          id: string
          importe: number | null
          lead_id: string | null
          linkedin_url: string | null
          logo_url: string | null
          nif_cif: string | null
          nombre: string
          origen: string | null
          proxima_sesion: string | null
          servicio_contratado: Database["public"]["Enums"]["servicio_contratado"] | null
          slug: string | null
          tarifa: Database["public"]["Enums"]["tarifa_tipo"] | null
          telefono: string | null
          tipo: Database["public"]["Enums"]["tipo_cliente"]
          ubicacion: string | null
          updated_at: string | null
          web_url: string | null
        }
        Insert: {
          creado_por?: string | null
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          direccion_fiscal?: string | null
          email?: string | null
          empresa?: string | null
          estado?: Database["public"]["Enums"]["estado_cliente"]
          fecha_conversion?: string | null
          fecha_inicio?: string | null
          id?: string
          importe?: number | null
          lead_id?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          nif_cif?: string | null
          nombre: string
          origen?: string | null
          owner_user_id?: string | null
          proxima_sesion?: string | null
          servicio_contratado?: Database["public"]["Enums"]["servicio_contratado"] | null
          slug?: string | null
          tarifa?: Database["public"]["Enums"]["tarifa_tipo"] | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_cliente"]
          ubicacion?: string | null
          updated_at?: string | null
          web_url?: string | null
        }
        Update: {
          creado_por?: string | null
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          direccion_fiscal?: string | null
          email?: string | null
          empresa?: string | null
          estado?: Database["public"]["Enums"]["estado_cliente"]
          fecha_conversion?: string | null
          fecha_inicio?: string | null
          id?: string
          importe?: number | null
          lead_id?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          nif_cif?: string | null
          nombre?: string
          origen?: string | null
          owner_user_id?: string | null
          proxima_sesion?: string | null
          servicio_contratado?: Database["public"]["Enums"]["servicio_contratado"] | null
          slug?: string | null
          tarifa?: Database["public"]["Enums"]["tarifa_tipo"] | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_cliente"]
          ubicacion?: string | null
          updated_at?: string | null
          web_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          dias_vencimiento_default: number
          emisor_ciudad: string | null
          emisor_cp: string | null
          emisor_direccion: string | null
          emisor_email: string | null
          emisor_iban: string | null
          emisor_nif: string | null
          emisor_nombre: string | null
          emisor_pais: string | null
          emisor_provincia: string | null
          emisor_telefono: string | null
          emisor_web: string | null
          firma_path: string | null
          footer_path: string | null
          forma_pago_default: Database["public"]["Enums"]["forma_pago"] | null
          header_path: string | null
          id: number
          irpf_default: number
          iva_default: number
          logo_path: string | null
          prefijo_anio: boolean
          proximo_numero: number
          serie_default: string
          sobre_mi_path: string | null
          updated_at: string | null
          verifactu_numero_instalacion: string | null
          verifactu_productor_nif: string | null
          verifactu_productor_nombre: string | null
          verifactu_sistema_id: string | null
          verifactu_sistema_nombre: string | null
          verifactu_version: string | null
        }
        Insert: {
          dias_vencimiento_default?: number
          emisor_ciudad?: string | null
          emisor_cp?: string | null
          emisor_direccion?: string | null
          emisor_email?: string | null
          emisor_iban?: string | null
          emisor_nif?: string | null
          emisor_nombre?: string | null
          emisor_pais?: string | null
          emisor_provincia?: string | null
          emisor_telefono?: string | null
          emisor_web?: string | null
          firma_path?: string | null
          footer_path?: string | null
          forma_pago_default?: Database["public"]["Enums"]["forma_pago"] | null
          header_path?: string | null
          id?: number
          irpf_default?: number
          iva_default?: number
          logo_path?: string | null
          prefijo_anio?: boolean
          proximo_numero?: number
          serie_default?: string
          sobre_mi_path?: string | null
          updated_at?: string | null
          verifactu_numero_instalacion?: string | null
          verifactu_productor_nif?: string | null
          verifactu_productor_nombre?: string | null
          verifactu_sistema_id?: string | null
          verifactu_sistema_nombre?: string | null
          verifactu_version?: string | null
        }
        Update: {
          dias_vencimiento_default?: number
          emisor_ciudad?: string | null
          emisor_cp?: string | null
          emisor_direccion?: string | null
          emisor_email?: string | null
          emisor_iban?: string | null
          emisor_nif?: string | null
          emisor_nombre?: string | null
          emisor_pais?: string | null
          emisor_provincia?: string | null
          emisor_telefono?: string | null
          emisor_web?: string | null
          firma_path?: string | null
          footer_path?: string | null
          forma_pago_default?: Database["public"]["Enums"]["forma_pago"] | null
          header_path?: string | null
          id?: number
          irpf_default?: number
          iva_default?: number
          logo_path?: string | null
          prefijo_anio?: boolean
          proximo_numero?: number
          serie_default?: string
          sobre_mi_path?: string | null
          updated_at?: string | null
          verifactu_numero_instalacion?: string | null
          verifactu_productor_nif?: string | null
          verifactu_productor_nombre?: string | null
          verifactu_sistema_id?: string | null
          verifactu_sistema_nombre?: string | null
          verifactu_version?: string | null
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
        Relationships: [
          {
            foreignKeyName: "cvs_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidato_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      derechos_arco: {
        Row: {
          created_at: string
          descripcion: string
          email: string
          estado: 'pendiente' | 'en_proceso' | 'resuelta'
          id: string
          nombre: string
          notas_admin: string | null
          resolucion_at: string | null
          tipo_derecho: 'acceso' | 'rectificacion' | 'supresion' | 'portabilidad' | 'oposicion' | 'limitacion'
        }
        Insert: {
          created_at?: string
          descripcion: string
          email: string
          estado?: 'pendiente' | 'en_proceso' | 'resuelta'
          id?: string
          nombre: string
          notas_admin?: string | null
          resolucion_at?: string | null
          tipo_derecho: 'acceso' | 'rectificacion' | 'supresion' | 'portabilidad' | 'oposicion' | 'limitacion'
        }
        Update: {
          created_at?: string
          descripcion?: string
          email?: string
          estado?: 'pendiente' | 'en_proceso' | 'resuelta'
          id?: string
          nombre?: string
          notas_admin?: string | null
          resolucion_at?: string | null
          tipo_derecho?: 'acceso' | 'rectificacion' | 'supresion' | 'portabilidad' | 'oposicion' | 'limitacion'
        }
        Relationships: []
      }
      email_envios: {
        Row: {
          asunto: string
          created_at: string
          error: string | null
          estado: string
          html: string
          id: string
          intentos: number
          metadata: Json | null
          para: string
          sent_at: string | null
          tipo: string
        }
        Insert: {
          asunto: string
          created_at?: string
          error?: string | null
          estado?: string
          html: string
          id?: string
          intentos?: number
          metadata?: Json | null
          para: string
          sent_at?: string | null
          tipo: string
        }
        Update: {
          asunto?: string
          created_at?: string
          error?: string | null
          estado?: string
          html?: string
          id?: string
          intentos?: number
          metadata?: Json | null
          para?: string
          sent_at?: string | null
          tipo?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          id: number
          imap_encryption: string | null
          imap_host: string | null
          imap_password: string | null
          imap_port: number | null
          imap_user: string | null
          smtp_encryption: string | null
          smtp_from_name: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_user: string | null
          subject_cambio_estado: string | null
          subject_candidatura_admin: string | null
          subject_candidatura_candidato: string | null
          subject_confirmation: string | null
          subject_invite: string | null
          subject_lead_confirmacion: string | null
          subject_magic_link: string | null
          subject_recovery: string | null
          template_cambio_estado: string | null
          template_candidatura_admin: string | null
          template_candidatura_candidato: string | null
          template_confirmation: string | null
          template_invite: string | null
          template_lead_confirmacion: string | null
          template_magic_link: string | null
          template_recovery: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          imap_encryption?: string | null
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          imap_user?: string | null
          smtp_encryption?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          subject_cambio_estado?: string | null
          subject_candidatura_admin?: string | null
          subject_candidatura_candidato?: string | null
          subject_confirmation?: string | null
          subject_invite?: string | null
          subject_lead_confirmacion?: string | null
          subject_magic_link?: string | null
          subject_recovery?: string | null
          template_cambio_estado?: string | null
          template_candidatura_admin?: string | null
          template_candidatura_candidato?: string | null
          template_confirmation?: string | null
          template_invite?: string | null
          template_lead_confirmacion?: string | null
          template_magic_link?: string | null
          template_recovery?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          imap_encryption?: string | null
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          imap_user?: string | null
          smtp_encryption?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          subject_cambio_estado?: string | null
          subject_candidatura_admin?: string | null
          subject_candidatura_candidato?: string | null
          subject_confirmation?: string | null
          subject_invite?: string | null
          subject_lead_confirmacion?: string | null
          subject_magic_link?: string | null
          subject_recovery?: string | null
          template_cambio_estado?: string | null
          template_candidatura_admin?: string | null
          template_candidatura_candidato?: string | null
          template_confirmation?: string | null
          template_invite?: string | null
          template_lead_confirmacion?: string | null
          template_magic_link?: string | null
          template_recovery?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      factura_lineas: {
        Row: {
          cantidad: number
          concepto: string
          created_at: string | null
          descuento_porcentaje: number
          factura_id: string
          id: string
          orden: number
          precio_unitario: number
          subtotal: number
        }
        Insert: {
          cantidad?: number
          concepto: string
          created_at?: string | null
          descuento_porcentaje?: number
          factura_id: string
          id?: string
          orden?: number
          precio_unitario: number
          subtotal: number
        }
        Update: {
          cantidad?: number
          concepto?: string
          created_at?: string | null
          descuento_porcentaje?: number
          factura_id?: string
          id?: string
          orden?: number
          precio_unitario?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "factura_lineas_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas: {
        Row: {
          anio: number
          base_imponible: number
          cliente_direccion: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nif: string | null
          cliente_nombre: string
          correlativo: number
          creado_por: string | null
          created_at: string | null
          estado: Database["public"]["Enums"]["estado_factura"]
          factura_rectificada_id: string | null
          fecha_devolucion: string | null
          fecha_emision: string
          fecha_pago: string | null
          fecha_vencimiento: string | null
          forma_pago: Database["public"]["Enums"]["forma_pago"] | null
          id: string
          irpf_importe: number
          irpf_porcentaje: number
          iva_importe: number
          iva_porcentaje: number
          motivo_devolucion: string | null
          motivo_rectificacion: string | null
          notas: string | null
          numero: string
          pdf_path: string | null
          qr_url: string | null
          serie: string
          total: number
          updated_at: string | null
          verifactu_alta_id: string | null
          verifactu_anulacion_id: string | null
        }
        Insert: {
          anio: number
          base_imponible?: number
          cliente_direccion?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nif?: string | null
          cliente_nombre: string
          correlativo: number
          creado_por?: string | null
          created_at?: string | null
          estado?: Database["public"]["Enums"]["estado_factura"]
          factura_rectificada_id?: string | null
          fecha_devolucion?: string | null
          fecha_emision?: string
          fecha_pago?: string | null
          fecha_vencimiento?: string | null
          forma_pago?: Database["public"]["Enums"]["forma_pago"] | null
          id?: string
          irpf_importe?: number
          irpf_porcentaje?: number
          iva_importe?: number
          iva_porcentaje?: number
          motivo_devolucion?: string | null
          motivo_rectificacion?: string | null
          notas?: string | null
          numero: string
          pdf_path?: string | null
          qr_url?: string | null
          serie?: string
          total?: number
          updated_at?: string | null
          verifactu_alta_id?: string | null
          verifactu_anulacion_id?: string | null
        }
        Update: {
          anio?: number
          base_imponible?: number
          cliente_direccion?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nif?: string | null
          cliente_nombre?: string
          correlativo?: number
          creado_por?: string | null
          created_at?: string | null
          estado?: Database["public"]["Enums"]["estado_factura"]
          factura_rectificada_id?: string | null
          fecha_devolucion?: string | null
          fecha_emision?: string
          fecha_pago?: string | null
          fecha_vencimiento?: string | null
          forma_pago?: Database["public"]["Enums"]["forma_pago"] | null
          id?: string
          irpf_importe?: number
          irpf_porcentaje?: number
          iva_importe?: number
          iva_porcentaje?: number
          motivo_devolucion?: string | null
          motivo_rectificacion?: string | null
          notas?: string | null
          numero?: string
          pdf_path?: string | null
          qr_url?: string | null
          serie?: string
          total?: number
          updated_at?: string | null
          verifactu_alta_id?: string | null
          verifactu_anulacion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "empresas_publicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_factura_rectificada_id_fkey"
            columns: ["factura_rectificada_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_verifactu_alta_id_fkey"
            columns: ["verifactu_alta_id"]
            isOneToOne: false
            referencedRelation: "verifactu_registros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_verifactu_anulacion_id_fkey"
            columns: ["verifactu_anulacion_id"]
            isOneToOne: false
            referencedRelation: "verifactu_registros"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "lead_notas_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          acepto_privacidad: boolean
          acepto_privacidad_at: string | null
          archivado: boolean | null
          asunto: string | null
          consent_text: string | null
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
          acepto_privacidad?: boolean
          acepto_privacidad_at?: string | null
          archivado?: boolean | null
          asunto?: string | null
          consent_text?: string | null
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
          acepto_privacidad?: boolean
          acepto_privacidad_at?: string | null
          archivado?: boolean | null
          asunto?: string | null
          consent_text?: string | null
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
        Relationships: [
          {
            foreignKeyName: "leads_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          cliente_id: string
          competencias: string[]
          contrato: string | null
          created_at: string | null
          deleted_at: string | null
          descripcion: string
          empresa_oculta: boolean
          estado: Database["public"]["Enums"]["estado_oferta"]
          fecha_expiracion: string | null
          fecha_publicacion: string | null
          funciones: string[]
          id: string
          jornada_id: number | null
          modalidad_id: number | null
          ofrecemos: string[] | null
          publicado_por: string | null
          reporta_a: string | null
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
          cliente_id: string
          competencias?: string[]
          contrato?: string | null
          created_at?: string | null
          deleted_at?: string | null
          descripcion: string
          empresa_oculta?: boolean
          estado?: Database["public"]["Enums"]["estado_oferta"]
          fecha_expiracion?: string | null
          fecha_publicacion?: string | null
          funciones?: string[]
          id?: string
          jornada_id?: number | null
          modalidad_id?: number | null
          ofrecemos?: string[] | null
          publicado_por?: string | null
          reporta_a?: string | null
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
          cliente_id?: string
          competencias?: string[]
          contrato?: string | null
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string
          empresa_oculta?: boolean
          estado?: Database["public"]["Enums"]["estado_oferta"]
          fecha_expiracion?: string | null
          fecha_publicacion?: string | null
          funciones?: string[]
          id?: string
          jornada_id?: number | null
          modalidad_id?: number | null
          ofrecemos?: string[] | null
          publicado_por?: string | null
          reporta_a?: string | null
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
        Relationships: [
          {
            foreignKeyName: "ofertas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "empresas_publicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_jornada_id_fkey"
            columns: ["jornada_id"]
            isOneToOne: false
            referencedRelation: "jornadas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_modalidad_id_fkey"
            columns: ["modalidad_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_publicado_por_fkey"
            columns: ["publicado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectores"
            referencedColumns: ["id"]
          },
        ]
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
      rgpd_documentos: {
        Row: {
          actualizado_at: string | null
          actualizado_por: string | null
          contenido: Json
          created_at: string | null
          descripcion: string | null
          id: 'ropa' | 'runbook' | 'politica_ia' | 'formacion_ia' | 'dpia_checklist' | 'subencargados' | 'responsable_incidentes'
          titulo: string
        }
        Insert: {
          actualizado_at?: string | null
          actualizado_por?: string | null
          contenido?: Json
          created_at?: string | null
          descripcion?: string | null
          id: 'ropa' | 'runbook' | 'politica_ia' | 'formacion_ia' | 'dpia_checklist' | 'subencargados' | 'responsable_incidentes'
          titulo: string
        }
        Update: {
          actualizado_at?: string | null
          actualizado_por?: string | null
          contenido?: Json
          created_at?: string | null
          descripcion?: string | null
          id?: 'ropa' | 'runbook' | 'politica_ia' | 'formacion_ia' | 'dpia_checklist' | 'subencargados' | 'responsable_incidentes'
          titulo?: string
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
          estado_anterior: Database["public"]["Enums"]["estado_solicitud"] | null
          estado_nuevo: Database["public"]["Enums"]["estado_solicitud"]
          id: string
          nota: string | null
          solicitud_id: string
        }
        Insert: {
          cambiado_por?: string | null
          created_at?: string | null
          estado_anterior?: Database["public"]["Enums"]["estado_solicitud"] | null
          estado_nuevo: Database["public"]["Enums"]["estado_solicitud"]
          id?: string
          nota?: string | null
          solicitud_id: string
        }
        Update: {
          cambiado_por?: string | null
          created_at?: string | null
          estado_anterior?: Database["public"]["Enums"]["estado_solicitud"] | null
          estado_nuevo?: Database["public"]["Enums"]["estado_solicitud"]
          id?: string
          nota?: string | null
          solicitud_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitud_eventos_cambiado_por_fkey"
            columns: ["cambiado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitud_eventos_solicitud_id_fkey"
            columns: ["solicitud_id"]
            isOneToOne: false
            referencedRelation: "solicitudes"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "solicitud_notas_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitud_notas_solicitud_id_fkey"
            columns: ["solicitud_id"]
            isOneToOne: false
            referencedRelation: "solicitudes"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "solicitudes_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidato_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "solicitudes_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas_publicadas"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonios: {
        Row: {
          created_at: string
          deleted_at: string | null
          fecha: string | null
          fuente: string | null
          id: string
          nombre: string
          orden: number
          rating: number | null
          rol: string | null
          sector: string | null
          texto: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          fecha?: string | null
          fuente?: string | null
          id?: string
          nombre: string
          orden?: number
          rating?: number | null
          rol?: string | null
          sector?: string | null
          texto: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          fecha?: string | null
          fuente?: string | null
          id?: string
          nombre?: string
          orden?: number
          rating?: number | null
          rol?: string | null
          sector?: string | null
          texto?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      verifactu_registros: {
        Row: {
          created_at: string
          csv_aeat: string | null
          cuota_total: number
          enviado_at: string | null
          estado_envio: string
          factura_id: string
          fecha_emision: string
          fecha_hora_generacion: string
          hash_factura: string
          huella: string
          huella_anterior: string | null
          id: string
          importe_total: number
          intentos: number
          nif_emisor: string
          num_registro: number
          numero_factura: string
          respuesta_aeat: Json | null
          tipo: string
          tipo_factura_aeat: string
          ultimo_error: string | null
          xml_payload: string | null
        }
        Insert: {
          created_at?: string
          csv_aeat?: string | null
          cuota_total: number
          enviado_at?: string | null
          estado_envio?: string
          factura_id: string
          fecha_emision: string
          fecha_hora_generacion: string
          hash_factura: string
          huella: string
          huella_anterior?: string | null
          id?: string
          importe_total: number
          intentos?: number
          nif_emisor: string
          num_registro?: never
          numero_factura: string
          respuesta_aeat?: Json | null
          tipo: string
          tipo_factura_aeat: string
          ultimo_error?: string | null
          xml_payload?: string | null
        }
        Update: {
          created_at?: string
          csv_aeat?: string | null
          cuota_total?: number
          enviado_at?: string | null
          estado_envio?: string
          factura_id?: string
          fecha_emision?: string
          fecha_hora_generacion?: string
          hash_factura?: string
          huella?: string
          huella_anterior?: string | null
          id?: string
          importe_total?: number
          intentos?: number
          nif_emisor?: string
          num_registro?: never
          numero_factura?: string
          respuesta_aeat?: Json | null
          tipo?: string
          tipo_factura_aeat?: string
          ultimo_error?: string | null
          xml_payload?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifactu_registros_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
        ]
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
        Insert: {
          autor_id?: string | null
          categoria_id?: number | null
          contenido?: string | null
          created_at?: string | null
          deleted_at?: string | null
          estado?: Database["public"]["Enums"]["estado_post"] | null
          extracto?: string | null
          fecha_publicacion?: string | null
          id?: string | null
          imagen_alt?: string | null
          imagen_portada?: string | null
          meta_descripcion?: string | null
          meta_titulo?: string | null
          slug?: string | null
          tiempo_lectura?: number | null
          titulo?: string | null
          updated_at?: string | null
          vistas?: string | null
        }
        Update: {
          autor_id?: string | null
          categoria_id?: number | null
          contenido?: string | null
          created_at?: string | null
          deleted_at?: string | null
          estado?: Database["public"]["Enums"]["estado_post"] | null
          extracto?: string | null
          fecha_publicacion?: string | null
          id?: string | null
          imagen_alt?: string | null
          imagen_portada?: string | null
          meta_descripcion?: string | null
          meta_titulo?: string | null
          slug?: string | null
          tiempo_lectura?: number | null
          titulo?: string | null
          updated_at?: string | null
          vistas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "blog_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas_publicas: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string | null
          logo_url: string | null
          nombre: string | null
          slug: string | null
          ubicacion: string | null
          web_url: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string | null
          logo_url?: string | null
          nombre?: string | null
          slug?: string | null
          ubicacion?: string | null
          web_url?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string | null
          logo_url?: string | null
          nombre?: string | null
          slug?: string | null
          ubicacion?: string | null
          web_url?: string | null
        }
        Relationships: []
      }
      ofertas_publicadas: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          deleted_at: string | null
          descripcion: string | null
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
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_oferta"] | null
          fecha_expiracion?: string | null
          fecha_publicacion?: string | null
          id?: string | null
          jornada_id?: number | null
          modalidad_id?: number | null
          ofrecemos?: string[] | null
          publicado_por?: string | null
          requisitos?: string[] | null
          salario_max?: number | null
          salario_min?: number | null
          salario_texto?: string | null
          sector_id?: number | null
          slug?: string | null
          titulo?: string | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_oferta"] | null
          fecha_expiracion?: string | null
          fecha_publicacion?: string | null
          id?: string | null
          jornada_id?: number | null
          modalidad_id?: number | null
          ofrecemos?: string[] | null
          publicado_por?: string | null
          requisitos?: string[] | null
          salario_max?: number | null
          salario_min?: number | null
          salario_texto?: string | null
          sector_id?: number | null
          slug?: string | null
          titulo?: string | null
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "empresas_publicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_jornada_id_fkey"
            columns: ["jornada_id"]
            isOneToOne: false
            referencedRelation: "jornadas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_modalidad_id_fkey"
            columns: ["modalidad_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_publicado_por_fkey"
            columns: ["publicado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_transicionar_solicitudes_nuevo: { Args: never; Returns: number }
      calcular_tiempo_lectura: { Args: { contenido: string }; Returns: number }
      candidatos_inactivos_a_purgar: {
        Args: { meses: number }
        Returns: { avatar_url: string; email: string; user_id: string }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_candidato: { Args: never; Returns: boolean }
      is_recruiter: { Args: never; Returns: boolean }
      next_numero_factura:
        | { Args: never; Returns: { anio: number; correlativo: number; numero: string; serie: string }[] }
        | { Args: { serie_input?: string }; Returns: { anio: number; correlativo: number; numero: string; serie: string }[] }
      slugify: { Args: { "": string }; Returns: string }
    }
    Enums: {
      estado_cliente: "activo" | "pausado" | "finalizado"
      estado_factura: "pendiente" | "pagada" | "vencida" | "devuelta" | "anulada"
      estado_lead: "nuevo" | "pendiente" | "contactado" | "descartado"
      estado_oferta: "borrador" | "publicada" | "pausada" | "cerrada"
      estado_post: "borrador" | "publicado" | "archivado"
      estado_solicitud: "nuevo" | "revisando" | "entrevista" | "descartado" | "contratado"
      forma_pago: "transferencia" | "efectivo" | "bizum" | "tarjeta" | "domiciliacion"
      nivel_idioma: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Nativo"
      servicio_contratado: "operaciones" | "reclutamiento" | "liderazgo" | "integral"
      tarifa_tipo: "mensual" | "proyecto" | "sesion"
      tipo_cliente: "particular" | "empresa"
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
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Convenience type aliases
export type NivelIdioma = Database["public"]["Enums"]["nivel_idioma"]
export type EstadoCliente = Database["public"]["Enums"]["estado_cliente"]
export type EstadoFactura = Database["public"]["Enums"]["estado_factura"]
export type EstadoLead = Database["public"]["Enums"]["estado_lead"]
export type EstadoOferta = Database["public"]["Enums"]["estado_oferta"]
export type EstadoPost = Database["public"]["Enums"]["estado_post"]
export type EstadoSolicitud = Database["public"]["Enums"]["estado_solicitud"]
export type FormaPago = Database["public"]["Enums"]["forma_pago"]
export type ServicioContratado = Database["public"]["Enums"]["servicio_contratado"]
export type TarifaTipo = Database["public"]["Enums"]["tarifa_tipo"]
export type TipoCliente = Database["public"]["Enums"]["tipo_cliente"]
export type TipoLead = Database["public"]["Enums"]["tipo_lead"]
export type UserRole = Database["public"]["Enums"]["user_role"]

export const Constants = {
  public: {
    Enums: {
      estado_cliente: ["activo", "pausado", "finalizado"],
      estado_factura: ["pendiente", "pagada", "vencida", "devuelta", "anulada"],
      estado_lead: ["nuevo", "pendiente", "contactado", "descartado"],
      estado_oferta: ["borrador", "publicada", "pausada", "cerrada"],
      estado_post: ["borrador", "publicado", "archivado"],
      estado_solicitud: ["nuevo", "revisando", "entrevista", "descartado", "contratado"],
      forma_pago: ["transferencia", "efectivo", "bizum", "tarjeta", "domiciliacion"],
      nivel_idioma: ["A1", "A2", "B1", "B2", "C1", "C2", "Nativo"],
      servicio_contratado: ["operaciones", "reclutamiento", "liderazgo", "integral"],
      tarifa_tipo: ["mensual", "proyecto", "sesion"],
      tipo_cliente: ["particular", "empresa"],
      tipo_lead: ["contacto_general", "consulta_servicio"],
      user_role: ["admin", "recruiter", "candidato", "empresa"],
    },
  },
} as const
