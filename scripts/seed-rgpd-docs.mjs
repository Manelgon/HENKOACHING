// Rellena las tarjetas vacías del panel Cumplimiento RGPD (politica_ia, formacion_ia, subencargados)
// con el contenido redactado en docs/cumplimiento/. No sobreescribe documentos ya rellenados.
// Uso: node scripts/seed-rgpd-docs.mjs [--check | --write]
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const HOY = '2026-06-10'

const CONTENIDOS = {
  politica_ia: {
    herramientas_permitidas: [
      {
        nombre: 'Claude / Claude Code',
        uso: 'Desarrollo y mantenimiento de la web y el panel; redacción de borradores',
        datos_permitidos: 'Código de la aplicación y textos sin datos personales',
        datos_prohibidos: 'Datos de candidatos, clientes o leads (nombres, emails, teléfonos, CVs, notas de sesiones, facturas)',
      },
      {
        nombre: 'OpenAI (ChatGPT / generación de imágenes)',
        uso: 'Borradores de textos y generación puntual de imágenes (logo, portadas del blog)',
        datos_permitidos: 'Textos, ideas y prompts sin datos personales de terceros',
        datos_prohibidos: 'Cualquier dato personal de candidatos, clientes o contactos',
      },
    ],
    reglas_generales: [
      'La aplicación no usa IA: la valoración de candidaturas y todas las decisiones sobre personas son individuales y humanas.',
      'Prohibido introducir datos personales de candidatos, clientes o contactos en herramientas de IA públicas. Si se necesita ayuda con un texto que los contiene, se anonimiza antes (quitar nombres y datos de contacto).',
      'Prohibido usar IA para decidir o recomendar sobre personas: selección de candidatos, evaluación de clientes o precios personalizados.',
      'Las imágenes generadas con IA se usan solo con fines ilustrativos (logo, portadas), nunca para representar personas reales.',
      'Si por error se introduce un dato personal en una IA pública: borrar la conversación, anotar el incidente y valorar con el runbook de brechas si procede algo más.',
    ],
    aprobacion_nuevas_integraciones:
      'Cualquier herramienta de IA nueva debe aprobarla Jennifer Cervera. Antes de usarla se comprueba: dónde procesa los datos, si entrena con ellos y si hace falta contrato de encargado (DPA).',
    ultima_revision: HOY,
  },
  formacion_ia: {
    registros: [
      {
        persona: 'Manel (desarrollo y mantenimiento)',
        fecha: HOY,
        curso: 'Redacción y revisión de la Política de IA de Henkoaching; riesgos básicos (no introducir datos personales en IA públicas, no usar IA para decidir sobre personas)',
        horas: '1',
      },
    ],
  },
  subencargados: {
    subencargados: [
      {
        nombre: 'Supabase Inc.',
        servicio: 'Base de datos, autenticación y almacenamiento (CVs, archivos)',
        pais: 'UE — Irlanda (eu-west-1)',
        dpa_firmado: true,
        enlace_dpa: 'https://supabase.com/dpa',
        datos_tratados: 'Todos los datos de la aplicación (candidatos, clientes, leads, facturas)',
      },
      {
        nombre: 'Vercel Inc.',
        servicio: 'Alojamiento de la web y CDN',
        pais: 'EE. UU. (DPF / SCCs)',
        dpa_firmado: true,
        enlace_dpa: 'https://vercel.com/legal/dpa',
        datos_tratados: 'Logs HTTP y metadatos de navegación',
      },
      {
        nombre: 'Google LLC',
        servicio: 'Agenda, tareas y correo del responsable (Calendar, Tasks, Gmail)',
        pais: 'EE. UU. (DPF / SCCs)',
        dpa_firmado: false,
        enlace_dpa: 'https://business.safety.google/processorterms/',
        datos_tratados: 'Eventos de cita y correos que pueden contener nombres y contactos de candidatos/clientes. Cuenta de consumidor: riesgo residual aceptado y documentado; los envíos a interesados salen por la cuenta del dominio (Piensa Solutions)',
      },
      {
        nombre: 'Piensa Solutions S.L.',
        servicio: 'Correo del dominio (envíos transaccionales y comunicaciones)',
        pais: 'España (UE)',
        dpa_firmado: true,
        enlace_dpa: 'https://www.piensasolutions.com/legal',
        datos_tratados: 'Emails con datos de candidatos, clientes y leads',
      },
    ],
  },
}

const { data: rows, error } = await supabase
  .from('rgpd_documentos')
  .select('id, titulo, contenido, actualizado_at')
  .in('id', Object.keys(CONTENIDOS))

if (error) { console.error('Error leyendo rgpd_documentos:', error.message); process.exit(1) }

const isEmpty = (c) => !c || Object.keys(c).length === 0 ||
  Object.values(c).every((v) => (Array.isArray(v) ? v.length === 0 : v === '' || v == null))

for (const row of rows ?? []) {
  console.log(`- ${row.id}: ${isEmpty(row.contenido) ? 'VACÍO' : 'CON CONTENIDO'} (actualizado: ${row.actualizado_at ?? 'nunca'})`)
}

if (process.argv.includes('--write')) {
  for (const row of rows ?? []) {
    // Solo se sobreescriben documentos nunca editados desde el panel (semillas de la migración)
    if (row.actualizado_at !== null && !isEmpty(row.contenido)) { console.log(`  ↷ ${row.id}: editado desde el panel, no se toca`); continue }
    // actualizado_at queda NULL: la tarjeta sigue "Pendiente" hasta que Jennifer revise y guarde desde el panel
    const { error: upErr } = await supabase
      .from('rgpd_documentos')
      .update({ contenido: CONTENIDOS[row.id], actualizado_at: null, actualizado_por: null })
      .eq('id', row.id)
    console.log(upErr ? `  ✗ ${row.id}: ${upErr.message}` : `  ✓ ${row.id}: rellenado`)
  }
}
