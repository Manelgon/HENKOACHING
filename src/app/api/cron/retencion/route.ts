import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Vercel Cron job: limpieza periódica de datos personales en cumplimiento
// del principio de limitación del plazo de conservación (RGPD art. 5.1.e).
//
// Política aplicada (debe coincidir con /legal#privacidad):
//   - Candidatos sin login en > 12 meses Y sin solicitudes en proceso activo:
//     hard delete completo (perfil + CV + solicitudes históricas)
//   - Leads (formularios de contacto) > 24 meses: hard delete
//
// Schedule en vercel.json: diario a las 03:00 UTC.

const MESES_RETENCION_CANDIDATO = 12
const MESES_RETENCION_LEAD = 24
const MESES_RETENCION_EMAIL_ENVIOS = 12

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const admin = createAdminClient()
  const inicio = Date.now()

  const [candidatosEliminados, leadsEliminados, auditLogsPurgados, emailEnviosPurgados] =
    await Promise.all([
      purgarCandidatosInactivos(admin),
      purgarLeadsAntiguos(admin),
      purgarAuditLogsAntiguos(admin),
      purgarEmailEnviosAntiguos(admin),
    ])

  const ms = Date.now() - inicio
  await logAction({
    accion: 'rgpd.cron_retencion',
    recursoTipo: 'sistema',
    metadata: {
      candidatos_eliminados: candidatosEliminados.length,
      leads_eliminados: leadsEliminados,
      audit_logs_purgados: auditLogsPurgados,
      email_envios_purgados: emailEnviosPurgados,
      duracion_ms: ms,
    },
  })

  return NextResponse.json({
    ok: true,
    candidatos_eliminados: candidatosEliminados.length,
    leads_eliminados: leadsEliminados,
    audit_logs_purgados: auditLogsPurgados,
    email_envios_purgados: emailEnviosPurgados,
    duracion_ms: ms,
  })
}

type AdminClient = ReturnType<typeof createAdminClient>

async function purgarCandidatosInactivos(admin: AdminClient): Promise<string[]> {
  const eliminados: string[] = []

  // 1. Listar candidatos elegibles vía RPC SQL (necesitamos cruzar con auth.users)
  const { data: rows, error } = await admin.rpc('candidatos_inactivos_a_purgar', {
    meses: MESES_RETENCION_CANDIDATO,
  })

  if (error) {
    console.error('[cron-retencion] Error listando candidatos:', error.message)
    return eliminados
  }

  for (const c of rows ?? []) {
    try {
      // Recoger paths de CVs para purgar Storage
      const { data: cvsList } = await admin
        .from('cvs')
        .select('storage_path')
        .eq('candidato_id', c.user_id)
      const cvPaths = (cvsList ?? []).map((cv) => cv.storage_path).filter(Boolean)

      // Hard delete del usuario → cascade limpia todas las tablas
      const { error: delErr } = await admin.auth.admin.deleteUser(c.user_id)
      if (delErr) {
        console.error(`[cron-retencion] No se pudo eliminar candidato ${c.user_id}:`, delErr.message)
        continue
      }

      // Purgar archivos físicos
      if (cvPaths.length > 0) {
        await admin.storage.from('cvs').remove(cvPaths)
      }
      if (c.avatar_url) {
        const avatarPath = c.avatar_url.split('/avatars/')[1]
        if (avatarPath) {
          await admin.storage.from('avatars').remove([avatarPath])
        }
      }

      await logAction({
        accion: 'rgpd.purga_candidato_inactivo',
        recursoTipo: 'profile',
        recursoId: c.user_id,
        recursoLabel: c.email,
        metadata: { cvs_purgados: cvPaths.length, motivo: 'inactividad_12m' },
      })

      eliminados.push(c.email)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'desconocido'
      console.error(`[cron-retencion] Excepción al purgar candidato ${c.user_id}:`, msg)
    }
  }

  return eliminados
}

// Calcula la fecha de corte restando N meses sin overflow (setMonth en día 31 puede dar mes incorrecto)
function subMonthsSafe(months: number): Date {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - months)
  return d
}

async function purgarLeadsAntiguos(admin: AdminClient): Promise<number> {
  const limite = subMonthsSafe(MESES_RETENCION_LEAD)

  const { data: leadsViejos, error: selErr } = await admin
    .from('leads')
    .select('id, email')
    .lt('updated_at', limite.toISOString())

  if (selErr) {
    console.error('[cron-retencion] Error listando leads:', selErr.message)
    return 0
  }

  const ids = (leadsViejos ?? []).map((l) => l.id)
  if (ids.length === 0) return 0

  const { error: delErr } = await admin.from('leads').delete().in('id', ids)
  if (delErr) {
    console.error('[cron-retencion] Error borrando leads:', delErr.message)
    return 0
  }

  await logAction({
    accion: 'rgpd.purga_leads_antiguos',
    recursoTipo: 'lead',
    metadata: { eliminados: ids.length, motivo: 'antiguedad_24m' },
  })

  return ids.length
}

async function purgarAuditLogsAntiguos(admin: AdminClient): Promise<number> {
  const limite = subMonthsSafe(12)

  const { data: viejos, error: selErr } = await admin
    .from('audit_logs')
    .select('id')
    .lt('created_at', limite.toISOString())
    .limit(1000)

  if (selErr) {
    console.error('[cron-retencion] Error listando audit_logs:', selErr.message)
    return 0
  }

  const ids = (viejos ?? []).map((l: { id: string }) => l.id)
  if (ids.length === 0) return 0

  if (ids.length === 1000) {
    console.warn('[cron-retencion] audit_logs: se alcanzó el límite de 1000 filas — puede haber más pendientes')
  }

  const { error: delErr } = await admin.from('audit_logs').delete().in('id', ids)
  if (delErr) {
    console.error('[cron-retencion] Error borrando audit_logs:', delErr.message)
    return 0
  }

  return ids.length
}

async function purgarEmailEnviosAntiguos(admin: AdminClient): Promise<number> {
  const limite = subMonthsSafe(MESES_RETENCION_EMAIL_ENVIOS)

  const { data: viejos, error: selErr } = await admin
    .from('email_envios')
    .select('id')
    .lt('created_at', limite.toISOString())
    .limit(1000)

  if (selErr) {
    console.error('[cron-retencion] Error listando email_envios:', selErr.message)
    return 0
  }

  const ids = (viejos ?? []).map((e: { id: string }) => e.id)
  if (ids.length === 0) return 0

  if (ids.length === 1000) {
    console.warn('[cron-retencion] email_envios: se alcanzó el límite de 1000 filas — puede haber más pendientes')
  }

  const { error: delErr } = await admin.from('email_envios').delete().in('id', ids)
  if (delErr) {
    console.error('[cron-retencion] Error borrando email_envios:', delErr.message)
    return 0
  }

  await logAction({
    accion: 'rgpd.purga_email_envios',
    recursoTipo: 'email_envios',
    metadata: { eliminados: ids.length, motivo: `antiguedad_${MESES_RETENCION_EMAIL_ENVIOS}m` },
  })

  return ids.length
}
